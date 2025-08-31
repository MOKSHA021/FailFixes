import React, { useState, useEffect } from 'react';
import {
  Container, Typography, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, Paper, CircularProgress, Alert, Box, Button
} from '@mui/material';
import { ArrowBack, People } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import FollowButton from '../components/FollowButton';

function FollowersPage() {
  const { theme } = useTheme();
  const { username } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalFollowers: 0 });

  // Theme-aware styled components
  const ThemedContainer = styled(Container)(() => ({
    minHeight: '100vh',
    background: theme.palette.mode === 'light' 
      ? 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)'
      : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  }));

  const ThemedPaper = styled(Paper)(() => ({
    background: theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(30, 41, 59, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: theme.spacing(4),
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)'
      : '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
  }));

  const ThemedButton = styled(Button)(() => ({
    borderRadius: '16px',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    color: theme.palette.text.primary,
    border: `2px solid ${theme.palette.mode === 'light' ? 'rgba(129, 199, 132, 0.3)' : 'rgba(129, 199, 132, 0.4)'}`,
    background: theme.palette.mode === 'light' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(30, 41, 59, 0.1)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(129, 199, 132, 0.1)' 
        : 'rgba(129, 199, 132, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(129, 199, 132, 0.3)'
    }
  }));

  const ThemedListItem = styled(ListItem)(() => ({
    borderRadius: '16px',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    background: theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(30, 41, 59, 0.7)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(129, 199, 132, 0.05)' 
        : 'rgba(129, 199, 132, 0.1)',
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'light'
        ? '0 6px 20px rgba(0, 0, 0, 0.1)'
        : '0 6px 20px rgba(0, 0, 0, 0.3)'
    }
  }));

  useEffect(() => {
    fetchFollowers();
  }, [username]);

  const fetchFollowers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await userAPI.getUserFollowers(username, { page, limit: 20 });
      setFollowers(response.data.followers || []);
      setPagination(response.data.pagination || { currentPage: 1, totalFollowers: 0 });
    } catch (err) {
      console.error('Followers error:', err);
      setError('Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = (followedUsername, isFollowing) => {
    setFollowers(prev => prev.map(follower =>
      (follower.username === followedUsername || follower.name === followedUsername)
        ? { ...follower, isFollowing }
        : follower
    ));
  };

  if (loading) {
    return (
      <ThemedContainer>
        <ThemedPaper sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} sx={{ color: '#81c784', mb: 3 }} />
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            Loading followers...
          </Typography>
        </ThemedPaper>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer>
      <ThemedPaper>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <ThemedButton
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/profile/${username}`)}
            sx={{ mr: 2 }}
          >
            Back
          </ThemedButton>
        </Box>

        <Typography
          variant="h3"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 900,
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <People sx={{ color: '#81c784', fontSize: '2.5rem' }} />
          Followers ({pagination.totalFollowers})
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            mb: 4,
            fontSize: '1.125rem'
          }}
        >
          People who are inspired by @{username}'s journey
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: '16px',
              background: theme.palette.mode === 'light'
                ? 'rgba(244, 67, 54, 0.1)'
                : 'rgba(244, 67, 54, 0.2)',
              border: `1px solid rgba(244, 67, 54, 0.3)`
            }}
          >
            {error}
          </Alert>
        )}

        {followers.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography
              variant="h4"
              sx={{ 
                color: theme.palette.text.primary, 
                mb: 2, 
                fontWeight: 700 
              }}
            >
              No followers yet
            </Typography>
            <Typography
              variant="body1"
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '1.125rem'
              }}
            >
              This user doesn't have any followers yet.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {followers.map((follower, index) => (
              <ThemedListItem
                key={index}
                onClick={() => navigate(`/profile/${follower.displayUsername || follower.username || follower.name}`)}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      fontSize: '1.5rem',
                      background: 'linear-gradient(135deg, #81c784, #aed581)',
                      color: 'white',
                      fontWeight: 700
                    }}
                  >
                    {follower.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box
                      onClick={() => navigate(`/profile/${follower.displayUsername || follower.username || follower.name}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.text.primary,
                          fontWeight: 700,
                          mb: 0.5
                        }}
                      >
                        {follower.name}
                        {follower.username && follower.username !== follower.name && (
                          <Typography
                            component="span"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontWeight: 400,
                              ml: 1
                            }}
                          >
                            @{follower.username}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      {follower.bio && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 1,
                            lineHeight: 1.6
                          }}
                        >
                          {follower.bio.length > 100 ? `${follower.bio.substring(0, 100)}...` : follower.bio}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500
                        }}
                      >
                        {follower.stats?.followersCount || 0} followers • {follower.stats?.storiesCount || 0} stories
                      </Typography>
                    </Box>
                  }
                />
                
                <Box sx={{ ml: 2 }} onClick={(e) => e.stopPropagation()}>
                  <FollowButton
                    targetUserId={follower._id}
                    targetUsername={follower.username || follower.name}
                    isFollowing={follower.isFollowing}
                    onFollowChange={(isFollowing) => 
                      handleFollowChange(follower.username || follower.name, isFollowing)
                    }
                  />
                </Box>
              </ThemedListItem>
            ))}
          </List>
        )}

        {/* Load More Button (if needed) */}
        {pagination.totalFollowers > followers.length && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <ThemedButton
              onClick={() => fetchFollowers(pagination.currentPage + 1)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </ThemedButton>
          </Box>
        )}
      </ThemedPaper>
    </ThemedContainer>
  );
}

export default FollowersPage;
