import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Person,
  LocationOn,
  CalendarToday,
  Article,
  Favorite,
  Visibility,
  PersonAdd,
  PersonRemove,
  Share
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Styled Components
const ProfileHeader = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
  color: 'white',
  borderRadius: '24px',
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden'
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  textAlign: 'center',
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.3)'
}));

const ActionButton = styled(Button)(({ variant: buttonVariant }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  ...(buttonVariant === 'follow' && {
    background: 'linear-gradient(135deg, #81c784, #aed581)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #66bb6a, #81c784)'
    }
  }),
  ...(buttonVariant === 'unfollow' && {
    background: 'linear-gradient(135deg, #f44336, #e57373)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #d32f2f, #f44336)'
    }
  })
}));

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const theme = useTheme();

  // State management
  const [profile, setProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // 🎯 SAFE HELPER FUNCTIONS
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U';
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return 'U';
    
    const words = trimmedName.split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'U';
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        console.log('Fetching profile for username:', username);

        const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`http://localhost:5000/api/users/profile/${username}`, {
          method: 'GET',
          headers
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch profile');
        }

        console.log('Profile data received:', data);
        setProfile(data.profile);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Fetch user stories
  useEffect(() => {
    const fetchStories = async () => {
      if (!username || !profile) return;

      try {
        setStoriesLoading(true);

        const response = await fetch(`http://localhost:5000/api/stories/author/${username}?limit=6`);
        const data = await response.json();

        if (response.ok) {
          setStories(data.stories || []);
        }
      } catch (err) {
        console.error('Stories fetch error:', err);
      } finally {
        setStoriesLoading(false);
      }
    };

    fetchStories();
  }, [username, profile]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!profile) {
      console.error('No profile data available for follow action');
      return;
    }

    try {
      setFollowLoading(true);

      const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const targetUsername = profile.username || profile.name || username;
      console.log('Following user:', targetUsername);

      const response = await fetch(`http://localhost:5000/api/users/${targetUsername}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          isFollowing: data.isFollowing
        }));
        console.log('Follow action successful:', data.message);
      } else {
        throw new Error(data.message || 'Failed to follow user');
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert('Error following user. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} sx={{ color: '#81c784' }} />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 4 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/browse')}
          sx={{ borderRadius: 2 }}
        >
          Back to Stories
        </Button>
      </Container>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning" sx={{ borderRadius: 3, mb: 4 }}>
          User profile not found
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/browse')}
          sx={{ borderRadius: 2 }}
        >
          Back to Stories
        </Button>
      </Container>
    );
  }

  // 🎯 SAFE DATA ACCESS WITH DEFAULTS
  const displayName = profile.name || profile.username || 'Anonymous User';
  const displayUsername = profile.username || profile.name || 'user';
  const userBio = profile.bio || 'No bio available';
  const userLocation = profile.location || '';
  const memberSince = formatDate(profile.createdAt);
  const avatarInitials = getInitials(displayName);

  // Stats with safe defaults
  const stats = {
    stories: profile.storiesCount || profile.stats?.storiesCount || 0,
    followers: profile.stats?.followersCount || 0,
    following: profile.stats?.followingCount || 0,
    views: profile.stats?.totalViews || 0
  };

  // Check if current user can follow this profile
  const canFollow = isAuthenticated && 
                   currentUser && 
                   profile.canFollow !== false && 
                   currentUser._id !== profile._id;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Profile Header */}
      <ProfileHeader>
        <Grid container spacing={4} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: '2.5rem',
                fontWeight: 800,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {avatarInitials}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              {displayName}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              @{displayUsername}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {userBio}
            </Typography>
            
            {/* Profile Details */}
            <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
              {userLocation && (
                <Box display="flex" alignItems="center">
                  <LocationOn sx={{ fontSize: 18, mr: 1, opacity: 0.8 }} />
                  <Typography variant="body2">{userLocation}</Typography>
                </Box>
              )}
              <Box display="flex" alignItems="center">
                <CalendarToday sx={{ fontSize: 18, mr: 1, opacity: 0.8 }} />
                <Typography variant="body2">Joined {memberSince}</Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2}>
              {canFollow && (
                <ActionButton
                  variant={profile.isFollowing ? 'unfollow' : 'follow'}
                  startIcon={followLoading ? <CircularProgress size={18} /> : 
                           (profile.isFollowing ? <PersonRemove /> : <PersonAdd />)}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? 'Processing...' : 
                   (profile.isFollowing ? 'Unfollow' : 'Follow')}
                </ActionButton>
              )}
              <Button
                variant="outlined"
                startIcon={<Share />}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Share Profile
              </Button>
            </Box>
          </Grid>
        </Grid>
      </ProfileHeader>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Stories', value: stats.stories, icon: <Article />, color: '#81c784' },
          { label: 'Followers', value: stats.followers, icon: <Person />, color: '#90caf9' },
          { label: 'Following', value: stats.following, icon: <PersonAdd />, color: '#ffb74d' },
          { label: 'Total Views', value: stats.views, icon: <Visibility />, color: '#f8bbd9' }
        ].map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <StatsCard>
              <Box display="flex" justifyContent="center" mb={1}>
                {React.cloneElement(stat.icon, { 
                  sx: { fontSize: 32, color: stat.color } 
                })}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                {formatNumber(stat.value)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </StatsCard>
          </Grid>
        ))}
      </Grid>

      {/* Content Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            background: 'linear-gradient(135deg, #81c784, #aed581)',
            '& .MuiTab-root': { color: 'white', fontWeight: 600 }
          }}
        >
          <Tab label="Stories" />
          <Tab label="About" />
        </Tabs>

        <Box p={3}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Published Stories ({stats.stories})
              </Typography>
              
              {storiesLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : stories.length > 0 ? (
                <Grid container spacing={3}>
                  {stories.map((story) => (
                    <Grid item xs={12} md={6} key={story._id}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': { transform: 'translateY(-4px)' },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => navigate(`/story/${story._id}`)}
                      >
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {story.title || 'Untitled Story'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {story.excerpt || 'No excerpt available'}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={story.category || 'General'} 
                              size="small"
                              sx={{ background: '#81c78420' }}
                            />
                            <Box display="flex" gap={1}>
                              <Box display="flex" alignItems="center">
                                <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption">
                                  {story.stats?.views || 0}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <Favorite sx={{ fontSize: 16, mr: 0.5, color: '#e91e63' }} />
                                <Typography variant="caption">
                                  {story.stats?.likes || 0}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={6}>
                  <Article sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No stories published yet
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                About {displayName}
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Bio"
                    secondary={userBio}
                  />
                </ListItem>
                <Divider />
                {userLocation && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Location"
                        secondary={userLocation}
                      />
                    </ListItem>
                    <Divider />
                  </>
                )}
                <ListItem>
                  <ListItemText
                    primary="Member Since"
                    secondary={memberSince}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Username"
                    secondary={`@${displayUsername}`}
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default UserProfile;
