import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  CircularProgress,
  Button
} from '@mui/material';
import { People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import FollowButton from './FollowButton';

function UserSuggestions() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await userAPI.getSuggestedUsers();
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Suggestions error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleFollowChange = (username, isFollowing) => {
    setUsers(prev => prev.map(user => 
      (user.username === username || user.name === username)
        ? { ...user, isFollowing }
        : user
    ));
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  if (users.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <People color="action" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          No Suggestions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We'll suggest users as the community grows!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <People />
        Suggested Users
      </Typography>
      
      <List disablePadding>
        {users.slice(0, 5).map((user) => (
          <ListItem 
            key={user._id} 
            disablePadding 
            sx={{ py: 1 }}
          >
            <ListItemAvatar>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/profile/${user.username || user.name}`)}
              >
                {(user.name || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Typography 
                  variant="subtitle2"
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' }
                  }}
                  onClick={() => navigate(`/profile/${user.username || user.name}`)}
                >
                  {user.name}
                  {user.username && user.username !== user.name && (
                    <Typography component="span" variant="body2" color="text.secondary">
                      {' '}@{user.username}
                    </Typography>
                  )}
                </Typography>
              }
              secondary={
                <Box>
                  {user.bio && (
                    <Typography variant="caption" display="block">
                      {user.bio.length > 50 ? `${user.bio.substring(0, 50)}...` : user.bio}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {user.stats?.followersCount || 0} followers
                  </Typography>
                </Box>
              }
            />
            
            <FollowButton
              username={user.username || user.name}
              isFollowing={user.isFollowing}
              onFollowChange={(isFollowing) => handleFollowChange(user.username || user.name, isFollowing)}
              size="small"
            />
          </ListItem>
        ))}
      </List>
      
      {users.length > 5 && (
        <Box textAlign="center" mt={2}>
          <Button 
            variant="text" 
            size="small"
            onClick={() => navigate('/discover')}
          >
            See More
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default UserSuggestions;
