import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Send, 
  Chat, 
  Favorite, 
  Message, 
  EmojiEmotions,
  Star,
  ThumbUp
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useSocket } from '../../context/SocketContexts'; // ✅ FIXED: Removed 's'
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';

// ✅ FLOATING ANIMATIONS
const gentleFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-15px) rotate(5deg); 
  }
`;

const slowSpin = keyframes`
  0% { 
    transform: rotate(0deg) scale(1); 
  }
  50% { 
    transform: rotate(180deg) scale(1.1); 
  }
  100% { 
    transform: rotate(360deg) scale(1); 
  }
`;

// ✅ CHAT CONTAINER WITH FLOATING ICONS
const ChatContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  overflow: 'hidden',
}));

const FloatingIcon = styled(Box)(({ theme, top, left, delay, size }) => ({
  position: 'absolute',
  top: top || '20%',
  left: left || '10%',
  opacity: 0.1,
  fontSize: size || '2rem',
  color: '#81c784',
  animation: `${gentleFloat} ${6 + (delay || 0)}s ease-in-out infinite`,
  animationDelay: `${delay || 0}s`,
  pointerEvents: 'none',
  zIndex: 1,
}));

const SpinningIcon = styled(Box)(({ theme, top, right, delay, size }) => ({
  position: 'absolute',
  top: top || '60%',
  right: right || '15%',
  opacity: 0.08,
  fontSize: size || '1.5rem',
  color: '#f8bbd9',
  animation: `${slowSpin} ${10 + (delay || 0)}s linear infinite`,
  animationDelay: `${delay || 0}s`,
  pointerEvents: 'none',
  zIndex: 1,
}));

// ✅ PERFECT LEFT/RIGHT MESSAGE ROW
const MessageRow = styled(Box)(({ isCurrentUser }) => ({
  display: 'flex',
  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
  alignItems: 'flex-end',
  marginBottom: '16px',
  width: '100%',
  padding: '0 12px',
}));

// ✅ INSTAGRAM-STYLE CHAT BUBBLE WITH DYNAMIC WIDTH
const ChatBubble = styled(Paper)(({ isCurrentUser, timestamp }) => {
  const baseWidth = 80;
  const charWidth = 8;
  const padding = 32;
  const timestampLength = timestamp ? timestamp.length : 8;
  const dynamicWidth = Math.max(baseWidth, timestampLength * charWidth + padding);

  return {
    maxWidth: '70%',
    minWidth: `${dynamicWidth}px`,
    padding: '12px 16px',
    borderRadius: isCurrentUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
    backgroundColor: isCurrentUser ? '#0095f6' : '#e5e5ea',
    color: isCurrentUser ? '#ffffff' : '#000000',
    boxShadow: isCurrentUser 
      ? '0 2px 8px rgba(0, 149, 246, 0.3)' 
      : '0 1px 3px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    wordBreak: 'break-word',
    // Message tail
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: isCurrentUser ? -6 : 'auto',
      left: isCurrentUser ? 'auto' : -6,
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '6px',
      borderColor: isCurrentUser 
        ? 'transparent transparent transparent #0095f6'
        : 'transparent #e5e5ea transparent transparent'
    }
  };
});

// ✅ MESSAGES AREA WITH ENHANCED STYLING
const MessagesArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2, 1),
  position: 'relative',
  zIndex: 2,
  background: 'transparent',
  // ✅ ENHANCED SCROLLBAR STYLING
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(135deg, rgba(0,149,246,0.3), rgba(0,149,246,0.5))',
    borderRadius: '10px',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(0,149,246,0.5), rgba(0,149,246,0.7))',
    }
  },
}));

function ChatWindow({ chat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState([]);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  // ✅ CLEAR NOTIFICATIONS WHEN CHAT IS OPENED
  useEffect(() => {
    if (chat && socket) {
      fetchMessages();
      socket.emit('joinChat', chat._id);
      
      // ✅ MARK CHAT AS READ TO CLEAR NOTIFICATIONS
      markChatAsRead();
    }
    return () => {
      if (chat && socket) {
        socket.emit('leaveChat', chat._id);
      }
    };
  }, [chat, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (data) => {
      if (data.chatId === chat?._id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        // ✅ MARK AS READ IMMEDIATELY IF CHAT IS OPEN
        markChatAsRead();
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

  // ✅ MARK CHAT AS READ FUNCTION
  const markChatAsRead = async () => {
    if (!chat || !socket) return;
    
    try {
      // Emit socket event to mark as read
      socket.emit('markChatAsRead', chat._id);
      
      // Also call API to mark as read in database
      await chatAPI.markChatAsRead(chat._id);
      
      console.log('✅ Chat marked as read:', chat._id);
    } catch (error) {
      console.error('❌ Error marking chat as read:', error);
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

  // ✅ HELPER FUNCTIONS
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
      <ChatContainer>
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <FloatingIcon top="20%" left="15%" delay={0} size="3rem">
            <Chat />
          </FloatingIcon>
          <FloatingIcon top="60%" left="70%" delay={2} size="2.5rem">
            <Message />
          </FloatingIcon>
          <SpinningIcon top="40%" right="20%" delay={1} size="2rem">
            <Favorite />
          </SpinningIcon>
          
          {/* ✅ ENHANCED EMPTY STATE STYLING */}
          <Paper sx={{ 
            p: 5, 
            borderRadius: 4, 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
            backdropFilter: 'blur(20px)',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            maxWidth: 400
          }}>
            <Typography variant="h5" color="text.primary" mb={2} sx={{ fontWeight: 700 }}>
              💬 Welcome to Chat
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Select a conversation from the sidebar to start messaging with your connections
            </Typography>
          </Paper>
        </Box>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      {/* ✅ FLOATING BACKGROUND ICONS */}
      <FloatingIcon top="10%" left="5%" delay={0} size="2rem">
        <Chat />
      </FloatingIcon>
      <FloatingIcon top="25%" left="85%" delay={1} size="1.8rem">
        <Message />
      </FloatingIcon>
      <FloatingIcon top="45%" left="3%" delay={2} size="2.2rem">
        <EmojiEmotions />
      </FloatingIcon>
      <FloatingIcon top="70%" left="88%" delay={3} size="1.5rem">
        <ThumbUp />
      </FloatingIcon>
      
      <SpinningIcon top="15%" right="10%" delay={0} size="1.8rem">
        <Favorite />
      </SpinningIcon>
      <SpinningIcon top="55%" right="8%" delay={2} size="1.6rem">
        <Star />
      </SpinningIcon>
      <SpinningIcon top="80%" right="12%" delay={4} size="2rem">
        <Send />
      </SpinningIcon>

      <Paper sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}>
        {/* ✅ ENHANCED CHAT HEADER */}
        <Box sx={{ 
          p: 3, 
          borderBottom: 1, 
          borderColor: 'rgba(255, 255, 255, 0.3)',
          background: 'linear-gradient(135deg, #81c784, #aed581)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ 
              mr: 2, 
              width: 48,
              height: 48,
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              fontSize: '1.2rem',
              fontWeight: 700
            }}>
              {getChatAvatarLetter()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.3rem' }}>
                {getChatDisplayName()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                {chat.isGroupChat ? `${chat.participants?.length || 0} members` : 'Direct Message'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ✅ MESSAGES AREA WITH PERFECT LEFT/RIGHT LAYOUT */}
        <MessagesArea>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress sx={{ color: '#81c784' }} size={50} />
            </Box>
          ) : (
            <>
              {/* ✅ PERFECT INSTAGRAM-STYLE LEFT/RIGHT MESSAGES */}
              {messages.map((message, index) => {
                if (!message) return null;
                
                const isCurrentUser = message.sender?._id === user._id;
                const senderName = getSafeDisplayName(message.sender);
                const timestamp = formatTime(message.createdAt);
                
                console.log(`Message: "${message.content}" | From: ${senderName} | isCurrentUser: ${isCurrentUser}`);

                return (
                  <MessageRow key={message._id || index} isCurrentUser={isCurrentUser}>
                    {/* ✅ OTHER USER AVATAR (LEFT SIDE) */}
                    {!isCurrentUser && (
                      <Avatar sx={{ 
                        mr: 1, 
                        width: 32, 
                        height: 32,
                        background: 'linear-gradient(135deg, #81c784, #aed581)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        {getSafeAvatarLetter(senderName)}
                      </Avatar>
                    )}
                    
                    {/* ✅ MESSAGE BUBBLE */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Show sender name for other users */}
                      {!isCurrentUser && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            ml: 1, 
                            mb: 0.5, 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          {senderName}
                        </Typography>
                      )}
                      
                      <ChatBubble isCurrentUser={isCurrentUser} timestamp={timestamp}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            lineHeight: 1.4,
                            fontSize: '0.95rem',
                            marginBottom: '6px',
                            fontWeight: 500
                          }}
                        >
                          {message.content || 'No content'}
                        </Typography>
                        
                        <Typography
                          variant="caption"
                          sx={{ 
                            display: 'block', 
                            textAlign: isCurrentUser ? 'right' : 'left',
                            opacity: 0.7,
                            fontSize: '0.65rem',
                            color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
                            fontWeight: 500
                          }}
                        >
                          {timestamp}
                        </Typography>
                      </ChatBubble>
                    </Box>
                    
                    {/* ✅ CURRENT USER AVATAR (RIGHT SIDE) */}
                    {isCurrentUser && (
                      <Avatar sx={{ 
                        ml: 1, 
                        width: 32, 
                        height: 32,
                        background: 'linear-gradient(135deg, #0095f6, #00d4ff)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        {getSafeAvatarLetter(user?.name)}
                      </Avatar>
                    )}
                  </MessageRow>
                );
              })}
              
              {/* ✅ ENHANCED TYPING INDICATOR */}
              {typing.length > 0 && (
                <MessageRow isCurrentUser={false}>
                  <Avatar sx={{ 
                    mr: 1, 
                    width: 32, 
                    height: 32, 
                    background: 'linear-gradient(135deg, #e0e0e0, #f5f5f5)',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    {getSafeAvatarLetter(typing[0]?.username)}
                  </Avatar>
                  <Chip 
                    label={`${typing[0]?.username || 'Someone'} is typing...`} 
                    size="small" 
                    sx={{
                      background: 'linear-gradient(135deg, #f0f0f0, #fafafa)',
                      color: '#666',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      animation: `${gentleFloat} 2s ease-in-out infinite`
                    }}
                  />
                </MessageRow>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </MessagesArea>

        {/* ✅ ENHANCED INPUT AREA */}
        <Box sx={{ 
          p: 3, 
          borderTop: 1, 
          borderColor: 'rgba(255, 255, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
          backdropFilter: 'blur(10px)'
        }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value || '')}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                backgroundColor: 'rgba(240, 242, 245, 0.8)',
                border: 'none',
                backdropFilter: 'blur(10px)',
                fontSize: '0.95rem',
                '&:hover': { 
                  backgroundColor: 'rgba(232, 234, 237, 0.9)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 12px rgba(0, 149, 246, 0.15)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0095f6',
                    borderWidth: '2px',
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': { 
                  border: 'none' 
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()} 
                    sx={{
                      background: newMessage.trim() 
                        ? 'linear-gradient(135deg, #0095f6, #00d4ff)' 
                        : 'linear-gradient(135deg, #e4e6ea, #f0f2f5)',
                      color: newMessage.trim() ? 'white' : '#bdc1c6',
                      width: 40,
                      height: 40,
                      boxShadow: newMessage.trim() 
                        ? '0 2px 8px rgba(0, 149, 246, 0.3)' 
                        : 'none',
                      '&:hover': {
                        background: newMessage.trim() 
                          ? 'linear-gradient(135deg, #0077cc, #00b4d8)' 
                          : 'linear-gradient(135deg, #e4e6ea, #f0f2f5)',
                        transform: 'scale(1.05)',
                      },
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Send sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Paper>
    </ChatContainer>
  );
}

export default ChatWindow;
