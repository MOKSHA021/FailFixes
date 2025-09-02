import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Chip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useSocket } from '../../context/SocketContexts';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';

function ChatWindow({ chat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState([]);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (chat) {
      fetchMessages();
      socket?.emit('joinChat', chat._id);
    }
    return () => {
      if (chat) socket?.emit('leaveChat', chat._id);
    };
  }, [chat, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (data) => {
      if (data.chatId === chat?._id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    });

    socket.on('userTyping', (data) => {
      if (data.userId !== user._id) {
        setTyping(prev => {
          if (data.isTyping) {
            return [...prev.filter(u => u.userId !== data.userId), data];
          } else {
            return prev.filter(u => u.userId !== data.userId);
          }
        });
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
    };
  }, [socket, chat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!chat) return;
    try {
      setLoading(true);
      const response = await chatAPI.getChatMessages(chat._id);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !chat) return;

    socket.emit('sendMessage', {
      chatId: chat._id,
      content: newMessage.trim(),
      messageType: 'text'
    });

    setNewMessage('');
    socket.emit('typing', { chatId: chat._id, isTyping: false });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    if (socket && chat) {
      socket.emit('typing', { 
        chatId: chat._id, 
        isTyping: value.trim().length > 0 
      });
    }
  };

  // ✅ HELPER FUNCTIONS WITH SAFE CHAR ACCESS
  const getSafeDisplayName = (chatOrUser) => {
    if (!chatOrUser) return 'Unknown';
    return chatOrUser.name || chatOrUser.username || 'Unknown User';
  };

  const getSafeAvatarLetter = (name) => {
    if (!name || typeof name !== 'string' || name.length === 0) {
      return 'U';
    }
    return name.charAt(0).toUpperCase();
  };

  const getChatDisplayName = () => {
    if (!chat) return '';
    if (chat.isGroupChat) return chat.chatName || 'Group Chat';
    const otherParticipant = chat.participants?.find(p => p._id !== user._id);
    return getSafeDisplayName(otherParticipant);
  };

  const getChatAvatarLetter = () => {
    if (!chat) return 'C';
    if (chat.isGroupChat) return getSafeAvatarLetter(chat.chatName || 'Group');
    const otherParticipant = chat.participants?.find(p => p._id !== user._id);
    return getSafeAvatarLetter(getSafeDisplayName(otherParticipant));
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  if (!chat) {
    return (
      <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Select a conversation to start messaging
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2 }}>
            {getChatAvatarLetter()}
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            {getChatDisplayName()}
          </Typography>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {/* ✅ FIXED: Safe message mapping with proper null checks */}
            {messages.map((message, index) => {
              if (!message) return null; // Skip null messages
              
              const isOwnMessage = message.sender?._id === user._id;
              const senderName = getSafeDisplayName(message.sender);
              const senderAvatarLetter = getSafeAvatarLetter(senderName);
              
              // Show avatar logic - same as before but with safe checks
              const showAvatar = !isOwnMessage && (
                index === 0 || 
                !messages[index - 1] ||
                messages[index - 1].sender?._id !== message.sender?._id
              );

              return (
                <ListItem
                  key={message._id || index}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    pb: 1
                  }}
                >
                  {/* ✅ FIXED: Safe avatar rendering */}
                  {showAvatar && (
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                      {senderAvatarLetter}
                    </Avatar>
                  )}
                  
                  <Box sx={{ 
                    maxWidth: '70%', 
                    ml: !isOwnMessage && !showAvatar ? 5 : 0 
                  }}>
                    {/* ✅ FIXED: Safe sender name display */}
                    {!isOwnMessage && showAvatar && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {senderName}
                      </Typography>
                    )}
                    
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                        color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        mt: !isOwnMessage && showAvatar ? 0.5 : 0
                      }}
                    >
                      <Typography variant="body2">
                        {message.content || 'No content'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ 
                          display: 'block', 
                          textAlign: 'right', 
                          mt: 0.5, 
                          opacity: 0.7 
                        }}
                      >
                        {formatTime(message.createdAt)}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              );
            })}
            
            {/* ✅ FIXED: Safe typing indicator */}
            {typing.length > 0 && (
              <ListItem>
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  {getSafeAvatarLetter(typing[0]?.username)}
                </Avatar>
                <Chip 
                  label={`${typing[0]?.username || 'Someone'} is typing...`} 
                  size="small" 
                  variant="outlined" 
                />
              </ListItem>
            )}
            
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value || '')} // ✅ Ensure string value
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim()} 
                  color="primary"
                >
                  <Send />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Paper>
  );
}

export default ChatWindow;
