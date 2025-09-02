import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Avatar, Button, Grid,
  Card, CardContent, Chip, CircularProgress, Alert, Divider,
  Tab, Tabs, List, ListItem, ListItemText, useTheme
} from '@mui/material';
import {
  Person, LocationOn, CalendarToday, Article, Favorite,
  Visibility, PersonAdd, PersonRemove, Share
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';

function UserProfile() {
  const { theme } = useAppTheme();
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const muiTheme = useTheme();

  // State management
  const [profile, setProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Theme-aware styled components (inside component to access theme)
  const ProfileHeader = styled(Paper)(() => ({
    background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
    color: 'white',
    borderRadius: '24px',
    padding: theme.spacing(6),
    marginBottom: theme.spacing(4),
    position: 'relative',
    overflow: 'hidden'
  }));

  const StatsCard = styled(Card)(() => ({
    borderRadius: '16px',
    textAlign: 'center',
    padding: theme.spacing(2),
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'
      : 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.7))',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
    color: theme.palette.text.primary
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

  const ContentContainer = styled(Container)(() => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    minHeight: '100vh',
    background: theme.palette.mode === 'light' 
      ? 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)'
      : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  }));

  const ContentPaper = styled(Paper)(() => ({
    borderRadius: '24px',
    padding: theme.spacing(4),
    background: theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(30, 41, 59, 0.9)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 32px rgba(0, 0, 0, 0.08)'
      : '0 8px 32px rgba(0, 0, 0, 0.3)',
  }));

  // SAFE HELPER FUNCTIONS
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
      <ContentContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} sx={{ color: '#81c784' }} />
        </Box>
      </ContentContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <ContentContainer>
        <ContentPaper>
          <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/browse')}
            sx={{ borderRadius: 2 }}
          >
            Back to Stories
          </Button>
        </ContentPaper>
      </ContentContainer>
    );
  }

  // No profile found
  if (!profile) {
    return (
      <ContentContainer>
        <ContentPaper>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 4, textAlign: 'center' }}>
            User profile not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/browse')}
            sx={{ borderRadius: 2, display: 'block', mx: 'auto' }}
          >
            Back to Stories
          </Button>
        </ContentPaper>
      </ContentContainer>
    );
  }

  // SAFE DATA ACCESS WITH DEFAULTS
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
    <ContentContainer>
      {/* Profile Header */}
      <ProfileHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: '3rem',
              fontWeight: 900,
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '4px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {avatarInitials}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
              {displayName}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              @{displayUsername}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 3, lineHeight: 1.6 }}>
              {userBio}
            </Typography>

            {/* Profile Details */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, opacity: 0.8 }}>
              {userLocation && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{userLocation}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 18 }} />
                <Typography variant="body2">Joined {memberSince}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {canFollow && (
              <ActionButton
                variant={profile.isFollowing ? 'unfollow' : 'follow'}
                startIcon={profile.isFollowing ? <PersonRemove /> : <PersonAdd />}
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
        </Box>
      </ProfileHeader>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { label: 'Stories', value: stats.stories, icon: <Article />, color: '#81c784' },
          { label: 'Followers', value: stats.followers, icon: <Person />, color: '#90caf9' },
          { label: 'Following', value: stats.following, icon: <PersonAdd />, color: '#ffb74d' },
          { label: 'Total Views', value: stats.views, icon: <Visibility />, color: '#f8bbd9' }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {React.cloneElement(stat.icon, {
                  sx: { fontSize: 32, color: stat.color }
                })}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: theme.palette.text.primary }}>
                {formatNumber(stat.value)}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                {stat.label}
              </Typography>
            </StatsCard>
          </Grid>
        ))}
      </Grid>

      {/* Content Tabs */}
      <ContentPaper>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #81c784, #aed581)',
            borderRadius: '16px',
            '& .MuiTab-root': { color: 'white', fontWeight: 600 }
          }}
        >
          <Tab label={`Stories (${stats.stories})`} />
          <Tab label="About" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.primary, fontWeight: 700 }}>
              Published Stories ({stats.stories})
            </Typography>

            {storiesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : stories.length > 0 ? (
              <Grid container spacing={3}>
                {stories.map((story) => (
                  <Grid item xs={12} md={6} key={story._id}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: theme.palette.mode === 'light'
                          ? 'rgba(255, 255, 255, 0.8)'
                          : 'rgba(30, 41, 59, 0.8)',
                        border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)'}`,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.palette.mode === 'light'
                            ? '0 8px 25px rgba(0, 0, 0, 0.15)'
                            : '0 8px 25px rgba(0, 0, 0, 0.4)'
                        }
                      }}
                      onClick={() => navigate(`/story/${story._id}`)}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: theme.palette.text.primary
                          }}
                        >
                          {story.title || 'Untitled Story'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 2,
                            lineHeight: 1.6
                          }}
                        >
                          {story.excerpt || 'No excerpt available'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            icon={<Visibility />}
                            label={story.stats?.views || 0}
                            size="small"
                          />
                          <Chip
                            icon={<Favorite />}
                            label={story.stats?.likes || 0}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
                  No stories published yet
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.primary, fontWeight: 700 }}>
              About {displayName}
            </Typography>

            <List>
              <ListItem>
                <ListItemText
                  primary={
                    <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      Bio
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      {userBio}
                    </Typography>
                  }
                />
              </ListItem>

              {userLocation && (
                <>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                          Location
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: theme.palette.text.secondary }}>
                          {userLocation}
                        </Typography>
                      }
                    />
                  </ListItem>
                </>
              )}

              <Divider />
              <ListItem>
                <ListItemText
                  primary={
                    <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                      Member Since
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      {memberSince}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Box>
        )}
      </ContentPaper>
    </ContentContainer>
  );
}

export default UserProfile;
