import React, { useState } from 'react';
import { Container, Grid } from '@mui/material';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import StartChatDialog from '../components/chat/StartChatDialouge';

function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [startChatOpen, setStartChatOpen] = useState(false);

  const handleCreateChat = () => {
    setStartChatOpen(true);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleChatCreated = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 120px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={4}>
          <ChatList
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onCreateChat={handleCreateChat}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <ChatWindow chat={selectedChat} />
        </Grid>
      </Grid>

      <StartChatDialog
        open={startChatOpen}
        onClose={() => setStartChatOpen(false)}
        onChatCreated={handleChatCreated}
      />
    </Container>
  );
}

export default ChatPage;
