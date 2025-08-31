/* eslint-disable no-console */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Avatar, Box,
  Button, Chip, LinearProgress, Paper, Fade, Grow, List, ListItem,
  ListItemAvatar, ListItemText, useTheme, useMediaQuery, Skeleton,
  Alert, CircularProgress, Divider, AvatarGroup,Stack
} from '@mui/material';
import {
  Create, Visibility, Favorite, Timeline, Celebration, ArrowForward,
  AddCircle, Explore, Star, LocalFireDepartment, Refresh, People,
  PersonAdd, Comment,Edit
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { dashboardAPI } from '../services/api';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(129, 199, 132, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(129, 199, 132, 0.8);
    transform: scale(1.05);
  }
`;

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { theme, mode } = useAppTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const darkMode = mode === 'dark';

  // Theme-aware styled components (inside component to access theme)
  const BackgroundContainer = styled(Box)(() => ({
    minHeight: '100vh',
    background: darkMode ? `
      radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)
    ` : `
      radial-gradient(circle at 20% 20%, rgba(129, 199, 132, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(144, 202, 249, 0.15) 0%, transparent 50%),
      linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 25%, #fef7f0 50%, #f0fff4 75%, #f5f8ff 100%)
    `,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  }));

  const WelcomeSection = styled(Paper)(() => ({
    background: darkMode
      ? `linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)`
      : `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)`,
    backdropFilter: 'blur(20px)',
    borderRadius: '28px',
    padding: theme.spacing(6),
    marginBottom: theme.spacing(6),
    border: darkMode
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: darkMode
      ? '0 20px 60px rgba(0, 0, 0, 0.3)'
      : '0 20px 60px rgba(0, 0, 0, 0.1)'
  }));

  const StatsCard = styled(Card)(({ color }) => ({
    borderRadius: '24px',
    background: darkMode
      ? `linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)`
      : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
    backdropFilter: 'blur(15px)',
    border: darkMode
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.4s ease',
    boxShadow: darkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.08)',
    '&:hover': {
      transform: 'translateY(-12px) scale(1.03)',
      boxShadow: darkMode
        ? '0 32px 80px rgba(0, 0, 0, 0.4)'
        : '0 32px 80px rgba(0, 0, 0, 0.15)',
      '& .icon-container': {
        transform: 'scale(1.15) rotate(10deg)',
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
      },
      '& .stat-value': {
        transform: 'scale(1.1)',
        color: color,
      },
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${color}, ${color}cc)`,
      borderRadius: '24px 24px 0 0',
    }
  }));

  const IconContainer = styled(Box)(({ color }) => ({
    width: 70,
    height: 70,
    borderRadius: '18px',
    background: `linear-gradient(135deg, ${color}15, ${color}25)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    marginLeft: 'auto',
    marginRight: 'auto',
    transition: 'all 0.4s ease',
    border: `2px solid ${color}30`,
  }));

  const ActionButton = styled(Button)(({ variant: buttonVariant }) => ({
    borderRadius: '18px',
    padding: '16px 32px',
    fontSize: '1.1rem',
    fontWeight: 700,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    ...(buttonVariant === 'primary' && {
      background: 'linear-gradient(135deg, #81c784 0%, #aed581 50%, #90caf9 100%)',
      color: 'white',
      boxShadow: '0 8px 25px rgba(129, 199, 132, 0.4)',
      '&:hover': {
        transform: 'translateY(-4px) scale(1.05)',
        boxShadow: '0 16px 40px rgba(129, 199, 132, 0.5)',
      }
    }),
    ...(buttonVariant === 'outlined' && {
      border: '2px solid #81c784',
      color: '#81c784',
      background: darkMode ? 'rgba(30, 41, 59, 0.1)' : 'rgba(255, 255, 255, 0.1)',
      '&:hover': {
        background: darkMode
          ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.2), rgba(144, 202, 249, 0.15))'
          : 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))',
        transform: 'translateY(-2px) scale(1.02)',
      }
    })
  }));

  const ThemedPaper = styled(Paper)(() => ({
    background: darkMode
      ? `linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)`
      : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
    backdropFilter: 'blur(15px)',
    border: darkMode
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    padding: theme.spacing(4),
    boxShadow: darkMode
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.08)',
  }));

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (!isAuthenticated || !user) return;

    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      console.log('📊 Fetching dashboard data...');
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data.dashboard);
      console.log('✅ Dashboard data loaded:', response.data.dashboard);

    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError('Failed to load dashboard data');
      
      if (!dashboardData) {
        setDashboardData({
          user: { name: user?.name || 'User', username: user?.username || 'user' },
          stats: {
            storiesShared: 0,
            totalViews: 0,
            totalLikes: 0,
            followersCount: 0,
            followingCount: 0
          },
          recentStories: [],
          recentFollowers: [],
          recentFollowing: [],
          growth: { growthRate: 0, isPositive: true }
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setMounted(true);
    }
  }, [isAuthenticated, user, dashboardData]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      if (isMounted) {
        if (location.state?.refresh) {
          console.log('🔄 Refreshing from story creation');
          await fetchDashboardData(true);
          navigate(location.pathname, { replace: true, state: {} });
        } else {
          await fetchDashboardData();
        }
      }
    };

    loadDashboard();
    return () => { isMounted = false; };
  }, [location.state?.refresh]);

  const handleManualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  if (!isAuthenticated || !user) {
    return (
      <BackgroundContainer>
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 900,
              mb: 2
            }}
          >
            Welcome to FailFixes! 🚀
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
            Please sign in to access your dashboard
          </Typography>
          <ActionButton variant="primary" onClick={() => navigate('/login')}>
            Sign In
          </ActionButton>
        </Container>
      </BackgroundContainer>
    );
  }

  if (loading && !dashboardData) {
    return (
      <BackgroundContainer>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '24px' }} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </BackgroundContainer>
    );
  }

  const statsData = [
    {
      title: 'Stories Shared',
      value: dashboardData?.stats?.storiesShared || 0,
      icon: <Create sx={{ fontSize: 32 }} />,
      color: '#4caf50',
      description: 'Inspiring stories you\'ve shared'
    },
    {
      title: 'Total Views',
      value: (dashboardData?.stats?.totalViews || 0).toLocaleString(),
      icon: <Visibility sx={{ fontSize: 32 }} />,
      color: '#2196f3',
      description: 'People who read your stories'
    },
    {
      title: 'Hearts Received',
      value: dashboardData?.stats?.totalLikes || dashboardData?.stats?.heartsReceived || 0,
      icon: <Favorite sx={{ fontSize: 32 }} />,
      color: '#f44336',
      description: 'Community appreciation'
    },
    {
      title: 'Followers',
      value: dashboardData?.stats?.followersCount || 0,
      icon: <People sx={{ fontSize: 32 }} />,
      color: '#9c27b0',
      description: 'People following your journey'
    }
  ];

  return (
    <BackgroundContainer>
      <Container maxWidth="xl">
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>
            {error}
          </Alert>
        )}

        {/* Welcome Section */}
        <WelcomeSection>
          <Grid container alignItems="center" spacing={4}>
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #81c784, #aed581)',
                  color: 'white',
                  fontWeight: 900
                }}
              >
                {dashboardData?.user?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography
                variant="h3"
                sx={{
                  background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
                  backgroundClip: 'text',
                  WebkitBackdropClip: 'text',
                  color: 'transparent',
                  fontWeight: 900,
                  mb: 1
                }}
              >
                Welcome back, {dashboardData?.user?.name || user?.name || 'User'}! 👋
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  mb: 4
                }}
              >
                Ready to inspire someone today? ✨
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <ActionButton
                  variant="primary"
                  endIcon={<Create />}
                  onClick={() => navigate('/create-story')}
                  fullWidth={false}
                  size="large"
                >
                  Share Your Story
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  fullWidth={false}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </ActionButton>
              </Stack>
            </Grid>
          </Grid>
        </WelcomeSection>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatsCard color={stat.color}>
                <CardContent sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <IconContainer color={stat.color} className="icon-container">
                    {React.cloneElement(stat.icon, {
                      sx: { fontSize: 32, color: stat.color }
                    })}
                  </IconContainer>
                  <Typography
                    variant="h3"
                    className="stat-value"
                    sx={{
                      fontWeight: 900,
                      mb: 1,
                      color: theme.palette.text.primary,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: theme.palette.text.primary
                    }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {stat.description}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          ))}
        </Grid>

        {/* Social Section */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Recent Followers */}
          <Grid item xs={12} md={6}>
            <ThemedPaper>
              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 700,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <People sx={{ color: '#9c27b0' }} />
                Recent Followers
              </Typography>
              <Typography variant="h6" sx={{ color: '#9c27b0', mb: 3, fontWeight: 600 }}>
                {dashboardData?.stats?.followersCount || 0}
              </Typography>

              {dashboardData?.recentFollowers?.length > 0 ? (
                <>
                  <AvatarGroup max={4} sx={{ mb: 3, justifyContent: 'flex-start' }}>
                    {dashboardData.recentFollowers.slice(0, 4).map((follower, index) => (
                      <Avatar
                        key={index}
                        onClick={() => navigate(`/profile/${follower.username}`)}
                        sx={{
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, #9c27b0, #e1bee7)',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        {follower.name?.charAt(0) || 'U'}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  
                  <List>
                    {dashboardData.recentFollowers.slice(0, 3).map((follower, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => navigate(`/profile/${follower.username}`)}
                        sx={{
                          borderRadius: '12px',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: darkMode
                              ? 'rgba(156, 39, 176, 0.1)'
                              : 'rgba(156, 39, 176, 0.05)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ background: 'linear-gradient(135deg, #9c27b0, #e1bee7)', color: 'white' }}>
                            {follower.name?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                              {follower.name || 'Anonymous'}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ color: theme.palette.text.secondary }}>
                              @{follower.username} • {follower.stats?.storiesCount || 0} stories
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                  No followers yet. Share more stories to grow your community!
                </Typography>
              )}

              <ActionButton
                variant="outlined"
                onClick={() => navigate(`/profile/${user?.username || user?.name}/followers`)}
                fullWidth
                sx={{
                  mt: 2,
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  '&:hover': { 
                    borderColor: '#7b1fa2', 
                    backgroundColor: 'rgba(156, 39, 176, 0.1)' 
                  }
                }}
              >
                View All Followers
              </ActionButton>
            </ThemedPaper>
          </Grid>

          {/* Recent Following */}
          <Grid item xs={12} md={6}>
            <ThemedPaper>
              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 700,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <PersonAdd sx={{ color: '#ff9800' }} />
                Following
              </Typography>
              <Typography variant="h6" sx={{ color: '#ff9800', mb: 3, fontWeight: 600 }}>
                {dashboardData?.stats?.followingCount || 0}
              </Typography>

              {dashboardData?.recentFollowing?.length > 0 ? (
                <>
                  <AvatarGroup max={4} sx={{ mb: 3, justifyContent: 'flex-start' }}>
                    {dashboardData.recentFollowing.slice(0, 4).map((following, index) => (
                      <Avatar
                        key={index}
                        onClick={() => navigate(`/profile/${following.username}`)}
                        sx={{
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, #ff9800, #ffcc02)',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': { transform: 'scale(1.1)' }
                        }}
                      >
                        {following.name?.charAt(0) || 'U'}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  
                  <List>
                    {dashboardData.recentFollowing.slice(0, 3).map((following, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => navigate(`/profile/${following.username}`)}
                        sx={{
                          borderRadius: '12px',
                          mb: 1,
                          '&:hover': {
                            backgroundColor: darkMode
                              ? 'rgba(255, 152, 0, 0.1)'
                              : 'rgba(255, 152, 0, 0.05)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ background: 'linear-gradient(135deg, #ff9800, #ffcc02)', color: 'white' }}>
                            {following.name?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                              {following.name || 'Anonymous'}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ color: theme.palette.text.secondary }}>
                              @{following.username} • {following.stats?.storiesCount || 0} stories
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
                  Not following anyone yet. Discover inspiring creators!
                </Typography>
              )}

              <ActionButton
                variant="outlined"
                onClick={() => navigate(`/profile/${user?.username || user?.name}/following`)}
                fullWidth
                sx={{
                  mt: 2,
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  '&:hover': { 
                    borderColor: '#f57c00', 
                    backgroundColor: 'rgba(255, 152, 0, 0.1)' 
                  }
                }}
              >
                View All Following
              </ActionButton>
            </ThemedPaper>
          </Grid>
        </Grid>

        {/* Recent Stories */}
        <ThemedPaper>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Timeline sx={{ color: '#4caf50' }} />
            Recent Stories
          </Typography>

          {dashboardData?.recentStories?.length > 0 ? (
            <List>
              {dashboardData.recentStories.slice(0, 3).map((story, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderRadius: '12px',
                    mb: 2,
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                    '&:hover': {
                      backgroundColor: darkMode
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'rgba(76, 175, 80, 0.05)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    {story.status === 'published' ? (
                      <Visibility sx={{ color: '#4caf50' }} />
                    ) : (
                      <Edit sx={{ color: '#ff9800' }} />
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                        {story.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Chip
                          icon={<Visibility />}
                          label={story.views}
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                          icon={<Favorite />}
                          label={story.likes}
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                          icon={<Comment />}
                          label={story.comments || 0}
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
                No stories yet
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                Share your first story to get started!
              </Typography>
            </Box>
          )}

          <ActionButton
            variant="outlined"
            onClick={() => navigate('/browse')}
            fullWidth
            sx={{ mt: 3 }}
          >
            View All Stories
          </ActionButton>
        </ThemedPaper>
      </Container>
    </BackgroundContainer>
  );
}

export default Dashboard;
