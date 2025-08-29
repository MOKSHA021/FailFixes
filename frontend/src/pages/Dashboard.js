import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  IconButton,
  Fade,
  Grow,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  Create,
  Visibility,
  Favorite,
  Share,
  EmojiEvents,
  Groups,
  Timeline,
  Auto_AwEsome,
  AddCircle,
  Explore,
  Star,
  LocalFireDepartment,
  Psychology,
  Celebration,
  ArrowForward,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(129, 199, 132, 0.3); }
  50% { box-shadow: 0 0 35px rgba(129, 199, 132, 0.6); }
`;

// Styled Components
const WelcomeSection = styled(Paper)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(129, 199, 132, 0.08) 0%, 
      rgba(144, 202, 249, 0.08) 50%,
      rgba(174, 213, 129, 0.08) 100%
    )
  `,
  borderRadius: '24px',
  padding: theme.spacing(4, 3),
  marginBottom: theme.spacing(4),
  border: '1px solid rgba(129, 199, 132, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    animation: `${shimmer} 3s ease-in-out infinite`,
  }
}));

const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: '20px',
  overflow: 'hidden',
  background: '#ffffff',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
    '& .icon-container': {
      transform: 'scale(1.1) rotate(5deg)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: color,
  }
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  width: 80,
  height: 80,
  borderRadius: '20px',
  background: `${color}15`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: `2px solid ${color}20`,
}));

const ActionButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
  borderRadius: '16px',
  padding: '14px 28px',
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  ...(buttonVariant === 'primary' && {
    background: 'linear-gradient(135deg, #81c784 0%, #aed581 50%, #90caf9 100%)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(129, 199, 132, 0.3)',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 12px 35px rgba(129, 199, 132, 0.4)',
    }
  }),
  ...(buttonVariant === 'outlined' && {
    border: '2px solid #1976d2',
    color: '#1976d2',
    background: 'rgba(25, 118, 210, 0.02)',
    '&:hover': {
      background: 'rgba(25, 118, 210, 0.08)',
      transform: 'translateY(-2px)',
    }
  })
}));

const ActivityCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: '#ffffff',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
  }
}));

const ProgressSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(66, 165, 245, 0.05) 100%)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: '1px solid rgba(25, 118, 210, 0.1)',
}));

function Dashboard() {
  const { user, isAuthenticated } = useAuth(); // Use AuthContext
  const [stats, setStats] = useState({
    storiesShared: 5,
    viewsReceived: 1247,
    likesReceived: 89,
    communitiesHelped: 12
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setMounted(true);
    
    // Sample recent activity
    setRecentActivity([
      {
        id: 1,
        type: 'story_shared',
        title: 'Your story "From Startup Failure to Success" was published',
        time: '2 hours ago',
        icon: <Create />,
        color: '#4caf50'
      },
      {
        id: 2,
        type: 'community_interaction',
        title: 'Sarah Johnson liked your story',
        time: '5 hours ago',
        icon: <Favorite />,
        color: '#f44336'
      },
      {
        id: 3,
        type: 'milestone',
        title: 'Congratulations! You reached 1000 views',
        time: '1 day ago',
        icon: <EmojiEvents />,
        color: '#ff9800'
      }
    ]);
  }, []);

  const statsData = [
    {
      title: 'Stories Shared',
      value: stats.storiesShared,
      icon: <Create sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      description: 'Inspiring stories you\'ve shared'
    },
    {
      title: 'Total Views',
      value: stats.viewsReceived.toLocaleString(),
      icon: <Visibility sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      description: 'People who read your stories'
    },
    {
      title: 'Hearts Received',
      value: stats.likesReceived,
      icon: <Favorite sx={{ fontSize: 40 }} />,
      color: '#f44336',
      description: 'Community appreciation'
    },
    {
      title: 'Communities Helped',
      value: stats.communitiesHelped,
      icon: <Groups sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      description: 'Lives you\'ve touched'
    }
  ];

  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, color: '#1e293b' }}>
          Please Sign In
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#64748b' }}>
          Access your dashboard to track your journey and share your stories.
        </Typography>
        <ActionButton
          variant="primary"
          onClick={() => navigate('/login')}
          size="large"
        >
          Sign In to Continue
        </ActionButton>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Fade in={mounted} timeout={1000}>
        <WelcomeSection elevation={0}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    background: 'linear-gradient(135deg, #81c784, #90caf9)',
                    fontSize: '2rem',
                    fontWeight: 800,
                    animation: `${pulse} 3s ease-in-out infinite`,
                  }}
                  src={user.avatar}
                >
                  {user.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      color: '#1e293b',
                      fontSize: { xs: '2rem', md: '3rem' },
                      mb: 1
                    }}
                  >
                    Welcome back, {user.name || 'User'}! 👋
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: '1.25rem'
                    }}
                  >
                    Ready to inspire someone today?
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={2}>
                <ActionButton
                  variant="primary"
                  startIcon={<Create />}
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/create-story')}
                  fullWidth
                >
                  Share Your Story
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  startIcon={<Explore />}
                  onClick={() => navigate('/browse')}
                  fullWidth
                >
                  Explore Stories
                </ActionButton>
              </Box>
            </Grid>
          </Grid>
        </WelcomeSection>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Grow in={mounted} timeout={1200 + index * 200}>
              <StatsCard color={stat.color}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <IconContainer 
                    className="icon-container"
                    color={stat.color}
                    sx={{ mx: 'auto' }}
                  >
                    {React.cloneElement(stat.icon, { 
                      sx: { fontSize: 40, color: stat.color } 
                    })}
                  </IconContainer>
                  
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 900, 
                      color: '#1e293b', 
                      mb: 1,
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: stat.color,
                      mb: 1,
                      fontSize: '1.1rem'
                    }}
                  >
                    {stat.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '0.9rem'
                    }}
                  >
                    {stat.description}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grow>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Progress Section */}
        <Grid item xs={12} md={8}>
          <Grow in={mounted} timeout={1600}>
            <Paper 
              elevation={0}
              sx={{
                borderRadius: '20px',
                p: 4,
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#1e293b', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Timeline sx={{ fontSize: '2rem', color: '#1976d2' }} />
                Your Growth Journey
              </Typography>

              <ProgressSection>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Community Impact Level
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ 
                      flexGrow: 1, 
                      height: 12, 
                      borderRadius: 6,
                      background: 'rgba(25, 118, 210, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #81c784, #90caf9)',
                        borderRadius: 6,
                      }
                    }} 
                  />
                  <Chip 
                    label="75%" 
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #81c784, #90caf9)',
                      color: 'white',
                      fontWeight: 700
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  You're 25% away from reaching "Community Hero" status! 
                  Share 2 more stories to unlock exclusive features.
                </Typography>
              </ProgressSection>

              {/* Quick Actions */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <ActionButton
                      variant="outlined"
                      startIcon={<AddCircle />}
                      onClick={() => navigate('/create-story')}
                      fullWidth
                    >
                      New Story
                    </ActionButton>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ActionButton
                      variant="outlined"
                      startIcon={<Psychology />}
                      onClick={() => navigate('/community')}
                      fullWidth
                    >
                      Join Discussion
                    </ActionButton>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grow>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Grow in={mounted} timeout={1800}>
            <Paper 
              elevation={0}
              sx={{
                borderRadius: '20px',
                p: 3,
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                height: 'fit-content'
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#1e293b', 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <LocalFireDepartment sx={{ fontSize: '1.8rem', color: '#ff9800' }} />
                Recent Activity
              </Typography>

              <List sx={{ p: 0 }}>
                {recentActivity.map((activity, index) => (
                  <Fade in={mounted} timeout={2000 + index * 200} key={activity.id}>
                    <ActivityCard elevation={0}>
                      <ListItem sx={{ p: 2 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            background: `${activity.color}15`,
                            color: activity.color,
                            width: 48,
                            height: 48
                          }}>
                            {activity.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                color: '#1e293b',
                                lineHeight: 1.4
                              }}
                            >
                              {activity.title}
                            </Typography>
                          }
                          secondary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#64748b',
                                mt: 0.5
                              }}
                            >
                              {activity.time}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </ActivityCard>
                  </Fade>
                ))}
              </List>

              <ActionButton
                variant="outlined"
                onClick={() => navigate('/activity')}
                fullWidth
                sx={{ mt: 2 }}
              >
                View All Activity
              </ActionButton>
            </Paper>
          </Grow>
        </Grid>
      </Grid>

      {/* Inspiration Section */}
      <Grow in={mounted} timeout={2000}>
        <Paper 
          elevation={0}
          sx={{
            borderRadius: '20px',
            p: 4,
            mt: 4,
            background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.05) 0%, rgba(144, 202, 249, 0.05) 100%)',
            border: '1px solid rgba(129, 199, 132, 0.15)',
            textAlign: 'center'
          }}
        >
          <Celebration sx={{ 
            fontSize: '4rem', 
            color: '#81c784', 
            mb: 2,
            animation: `${float} 3s ease-in-out infinite`
          }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              color: '#1e293b', 
              mb: 2 
            }}
          >
            You're Making a Difference! 🎉
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b', 
              mb: 3,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Your stories have inspired others to overcome their challenges. 
            Every failure shared is a lesson learned by the community.
          </Typography>
          <ActionButton
            variant="primary"
            size="large"
            startIcon={<Star />}
            onClick={() => navigate('/impact')}
          >
            See Your Impact
          </ActionButton>
        </Paper>
      </Grow>
    </Container>
  );
}

export default Dashboard;
