/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Avatar, Paper, Chip, IconButton,
  Button, Fade, Grow, CircularProgress, Alert, Divider, Stack
} from '@mui/material';
import {
  ArrowBack, Share, Bookmark, Favorite, Visibility, AccessTime,
  Person, Business, Psychology, School, FitnessCenter, FamilyRestroom,
  Computer, Palette, AutoFixHigh, FavoriteOutlined, BookmarkBorder, Comment
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import LikeButton from '../components/LikeButton';
import Comments from '../components/Comments';

// 🎨 **ELEGANT ANIMATIONS - Matching Home Style**
const gentleFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-8px) rotate(1deg); 
  }
`;

const softGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 15px rgba(129, 199, 132, 0.2), 0 0 30px rgba(129, 199, 132, 0.1); 
  }
  50% { 
    box-shadow: 0 0 25px rgba(129, 199, 132, 0.3), 0 0 40px rgba(129, 199, 132, 0.15); 
  }
`;

const subtleShimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const softParticle = keyframes`
  0%, 100% { 
    transform: translateY(0px) translateX(0px); 
    opacity: 0.2; 
  }
  50% { 
    transform: translateY(-15px) translateX(8px); 
    opacity: 0.4; 
  }
`;

const fadeIn = keyframes`
  0% { 
    opacity: 0;
    transform: translateY(20px);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
`;

// 🏗️ **ELEGANT STYLED COMPONENTS - Matching Home Style**
const BackgroundContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `
    radial-gradient(circle at 20% 20%, rgba(174, 213, 129, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 183, 195, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(179, 229, 252, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, 
      #f8f9ff 0%, 
      #f0f4ff 25%,
      #fef7f0 50%,
      #f0fff4 75%,
      #f5f8ff 100%
    )
  `,
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e8f5e8' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    `,
    pointerEvents: 'none',
  },
}));

const FloatingParticle = styled(Box)(({ delay, size, left, top }) => ({
  position: 'absolute',
  left: `${left}%`,
  top: `${top}%`,
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(174, 213, 129, 0.2), rgba(179, 229, 252, 0.15))',
  animation: `${softParticle} ${4 + Math.random() * 3}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  backdropFilter: 'blur(1px)',
  border: '1px solid rgba(174, 213, 129, 0.1)'
}));

const StoryCard = styled(Paper)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.85) 0%,
      rgba(255, 255, 255, 0.75) 50%,
      rgba(255, 255, 255, 0.65) 100%
    )
  `,
  backdropFilter: 'blur(20px) saturate(120%)',
  WebkitBackdropFilter: 'blur(20px) saturate(120%)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '24px',
  padding: theme.spacing(8, 6),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `
      linear-gradient(90deg, 
        transparent, 
        rgba(129, 199, 132, 0.1), 
        transparent
      )
    `,
    animation: `${subtleShimmer} 6s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #81c784, #aed581, #90caf9, #f8bbd9)',
    borderRadius: '24px 24px 0 0',
  }
}));

const AuthorCard = styled(Paper)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.8) 100%
    )
  `,
  backdropFilter: 'blur(15px) saturate(120%)',
  WebkitBackdropFilter: 'blur(15px) saturate(120%)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  boxShadow: `
    0 6px 20px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04)
  `,
}));

const ElegantButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
  borderRadius: '16px',
  padding: '12px 28px',
  fontSize: '0.95rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(buttonVariant === 'primary' && {
    background: 'linear-gradient(135deg, #81c784 0%, #aed581 50%, #90caf9 100%)',
    backgroundSize: '150% 150%',
    color: 'white',
    boxShadow: '0 4px 15px rgba(129, 199, 132, 0.3)',
    '&:hover': {
      backgroundPosition: 'right center',
      transform: 'translateY(-2px) scale(1.01)',
      boxShadow: '0 8px 25px rgba(129, 199, 132, 0.4)'
    }
  }),
  ...(buttonVariant === 'outlined' && {
    border: '2px solid #81c784',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    color: '#81c784',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))',
      transform: 'translateY(-1px) scale(1.01)',
      boxShadow: '0 6px 20px rgba(129, 199, 132, 0.2)',
      borderWidth: '2px',
    }
  }),
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(129, 199, 132, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(129, 199, 132, 0.3)'
  }
}));

const StoryContent = styled(Box)(({ theme }) => ({
  '& p': {
    marginBottom: theme.spacing(3),
    lineHeight: 1.8,
    fontSize: '1.125rem',
    color: '#374151',
    fontWeight: 400,
    animation: `${fadeIn} 0.6s ease-out`,
  },
  '& p:first-of-type': {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: '#1f2937',
    '&::first-letter': {
      fontSize: '3.5rem',
      fontWeight: 800,
      float: 'left',
      lineHeight: '3rem',
      paddingRight: '8px',
      marginTop: '4px',
      background: 'linear-gradient(135deg, #81c784, #aed581)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }
  },
  '& strong, & b': {
    fontWeight: 700,
    color: '#2e7d32',
  },
  '& em, & i': {
    fontStyle: 'italic',
    color: '#4a5568',
  },
}));

const InteractionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  background: 'rgba(129, 199, 132, 0.05)',
  borderRadius: '16px',
  border: '1px solid rgba(129, 199, 132, 0.1)',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StatsItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.6)',
  border: '1px solid rgba(129, 199, 132, 0.2)'
}));

function ViewStory() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();

  const categoryIcons = {
    business: Business,
    personal: Psychology,
    education: School,
    health: FitnessCenter,
    relationships: FamilyRestroom,
    career: Business,
    technology: Computer,
    creative: Palette
  };

  const categoryColors = {
    business: '#81c784',
    personal: '#90caf9',
    education: '#ffb74d',
    health: '#f8bbd9',
    relationships: '#b39ddb',
    career: '#ff8a65',
    technology: '#81c784',
    creative: '#90caf9'
  };

  useEffect(() => {
    fetchStory();
    setMounted(true);
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const response = await fetch(`http://localhost:5000/api/stories/${id}`, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch story');
      }

      setStory(data.story);
    } catch (err) {
      console.error('Error fetching story:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content) => {
    if (!content) return '';
    
    return content
      .split('\n\n')
      .filter(para => para.trim())
      .map(para => para.trim())
      .join('\n\n');
  };

  const handleLikeChange = (isLiked, likesCount) => {
    setStory(prev => ({
      ...prev,
      isLiked,
      stats: { ...prev.stats, likes: likesCount }
    }));
  };

  const CategoryIcon = story?.category ? categoryIcons[story.category] : Business;
  const categoryColor = story?.category ? categoryColors[story.category] : '#81c784';

  if (loading) {
    return (
      <BackgroundContainer>
        <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#81c784' }} />
        </Container>
      </BackgroundContainer>
    );
  }

  if (error || !story) {
    return (
      <BackgroundContainer>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            {error || 'Story not found'}
          </Alert>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <ElegantButton variant="outlined" onClick={() => navigate('/browse')}>
              Back to Browse
            </ElegantButton>
          </Box>
        </Container>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer>
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.4}
          size={Math.random() * 25 + 10}
          left={Math.random() * 100}
          top={Math.random() * 100}
        />
      ))}

      <Container maxWidth="md">
        {/* Header Actions */}
        <Fade in={mounted} timeout={600}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <ActionButton onClick={() => navigate('/browse')}>
              <ArrowBack sx={{ color: '#81c784' }} />
            </ActionButton>

            <Stack direction="row" spacing={1}>
              <ActionButton>
                <Share sx={{ color: '#81c784' }} />
              </ActionButton>
              <ActionButton>
                <BookmarkBorder sx={{ color: '#81c784' }} />
              </ActionButton>
            </Stack>
          </Box>
        </Fade>

        {/* Story Content */}
        <Grow in={mounted} timeout={800}>
          <StoryCard>
            {/* Story Header */}
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Chip 
                  icon={<CategoryIcon sx={{ fontSize: '1rem' }} />}
                  label={story.category?.charAt(0).toUpperCase() + story.category?.slice(1)}
                  sx={{ 
                    background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}90)`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    height: 32
                  }}
                />
                
                {/* 🎯 NEW: Enhanced Stats Display */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                  <StatsItem>
                    <Visibility sx={{ fontSize: 18, color: '#81c784' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      {story.stats?.views || 0}
                    </Typography>
                  </StatsItem>
                  
                  <StatsItem>
                    <FavoriteOutlined sx={{ fontSize: 18, color: '#e91e63' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      {story.stats?.likes || 0}
                    </Typography>
                  </StatsItem>
                  
                  <StatsItem>
                    <Comment sx={{ fontSize: 18, color: '#2196f3' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      {story.stats?.comments || 0}
                    </Typography>
                  </StatsItem>
                  
                  <StatsItem>
                    <AccessTime sx={{ fontSize: 18, color: '#ff9800' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                      {story.metadata?.readTime || 1} min
                    </Typography>
                  </StatsItem>
                </Box>
              </Box>

              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                mb: 4,
                color: '#1a202c',
                lineHeight: 1.2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}>
                {story.title}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 4, 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                📅 Published on {new Date(story.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>

              {story.tags?.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                  {story.tags.map((tag, index) => (
                    <Chip 
                      key={index}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: 'rgba(129, 199, 132, 0.3)',
                        color: '#81c784',
                        fontWeight: 500,
                        '&:hover': { 
                          backgroundColor: 'rgba(129, 199, 132, 0.1)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* Enhanced Story Content */}
            <StoryContent>
              <Typography 
                component="div"
                sx={{ 
                  '& > *': { mb: 3 },
                  '& > *:last-child': { mb: 0 }
                }}
              >
                {formatContent(story.content).split('\n\n').map((paragraph, index) => (
                  <Typography
                    key={index}
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.125rem',
                      color: '#374151',
                      fontWeight: 400,
                      mb: 3,
                      ...(index === 0 && {
                        fontSize: '1.2rem',
                        fontWeight: 500,
                        color: '#1f2937',
                        '&::first-letter': {
                          fontSize: '3.5rem',
                          fontWeight: 800,
                          float: 'left',
                          lineHeight: '3rem',
                          paddingRight: '12px',
                          marginTop: '4px',
                          marginRight: '4px',
                          background: 'linear-gradient(135deg, #81c784, #aed581)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }
                      })
                    }}
                  >
                    {paragraph}
                  </Typography>
                ))}
              </Typography>
            </StoryContent>

            {/* 🎯 NEW: Interaction Bar */}
            <InteractionBar>
              <LikeButton
                storyId={story._id}
                initialLikes={story.stats?.likes || 0}
                initialIsLiked={story.isLiked || false}
                onLikeChange={handleLikeChange}
              />
              
              <ElegantButton
                variant="outlined"
                startIcon={<BookmarkBorder />}
                size="small"
              >
                Save
              </ElegantButton>

              <ElegantButton
                variant="outlined"
                startIcon={<Share />}
                size="small"
              >
                Share
              </ElegantButton>
            </InteractionBar>

            {/* Key Lessons */}
            {story.metadata?.keyLessons?.length > 0 && (
              <>
                <Divider sx={{ my: 6 }} />
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 4,
                    color: '#81c784',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <AutoFixHigh sx={{ fontSize: '2rem' }} />
                    Key Takeaways
                  </Typography>
                  <Stack spacing={3}>
                    {story.metadata.keyLessons.map((lesson, index) => (
                      <Box key={index} sx={{ 
                        p: 4, 
                        background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.05), rgba(144, 202, 249, 0.03))',
                        borderRadius: 3,
                        border: '1px solid rgba(129, 199, 132, 0.15)',
                        position: 'relative',
                        '&::before': {
                          content: `"${index + 1}"`,
                          position: 'absolute',
                          top: -10,
                          left: 20,
                          background: 'linear-gradient(135deg, #81c784, #aed581)',
                          color: 'white',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 700
                        }
                      }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 500,
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          color: '#374151',
                          pt: 1
                        }}>
                          {lesson}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </StoryCard>
        </Grow>

        {/* Author Information */}
        <Fade in={mounted} timeout={1200}>
          <AuthorCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80,
                  background: 'linear-gradient(135deg, #81c784, #aed581)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  animation: `${gentleFloat} 4s ease-in-out infinite, ${softGlow} 3s ease-in-out infinite alternate`,
                }}
              >
                {story.author?.name?.charAt(0) || <Person />}
              </Avatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#2e7d32' }}>
                  {story.author?.name || 'Anonymous Author'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                  {story.author?.bio || 'Sharing stories of transformation and growth.'}
                </Typography>
                {story.author?.location && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    📍 {story.author.location}
                  </Typography>
                )}
              </Box>
              
              <ElegantButton variant="primary">
                Follow
              </ElegantButton>
            </Box>
          </AuthorCard>
        </Fade>

        {/* 🎯 NEW: Comments Section */}
        <Fade in={mounted} timeout={1400}>
          <Box sx={{ mt: 4 }}>
            <Comments 
              storyId={story._id} 
              initialCommentsCount={story.stats?.comments || 0}
            />
          </Box>
        </Fade>
      </Container>
    </BackgroundContainer>
  );
}

export default ViewStory;
