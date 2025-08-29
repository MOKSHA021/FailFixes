import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Button
} from '@mui/material';
import { ArrowBack, People } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import FollowButton from '../components/FollowButton';

function FollowersPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalFollowers: 0 });

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
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/profile/${username}`)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h5">
          Followers ({pagination.totalFollowers})
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {followers.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No followers yet
          </Typography>
          <Typography color="text.secondary">
            This user doesn't have any followers yet.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {followers.map((follower, index) => (
              <ListItem 
                key={follower._id}
                divider={index < followers.length - 1}
                sx={{ py: 2 }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/profile/${follower.displayUsername || follower.username || follower.name}`)}
                  >
                    {follower.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography 
                      variant="subtitle1"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => navigate(`/profile/${follower.displayUsername || follower.username || follower.name}`)}
                    >
                      {follower.name}
                      {follower.username && follower.username !== follower.name && (
                        <Typography component="span" variant="body2" color="text.secondary">
                          {' '}@{follower.username}
                        </Typography>
                      )}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {follower.bio && (
                        <Typography variant="body2" color="text.secondary">
                          {follower.bio.length > 100 ? `${follower.bio.substring(0, 100)}...` : follower.bio}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {follower.stats?.followersCount || 0} followers • {follower.stats?.storiesCount || 0} stories
                      </Typography>
                    </Box>
                  }
                />
                
                <FollowButton
                  username={follower.displayUsername || follower.username || follower.name}
                  isFollowing={follower.isFollowing}
                  onFollowChange={(isFollowing) => handleFollowChange(follower.username || follower.name, isFollowing)}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}

export default FollowersPage;
