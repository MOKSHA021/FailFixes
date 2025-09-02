import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Avatar, Chip, IconButton,
  Button, Divider, CircularProgress, Alert, Fade, Grow, Tooltip,
  useTheme, useMediaQuery,
} from '@mui/material';
import {
  ArrowBack, Favorite, FavoriteBorder, Share, Visibility,
  AccessTime, Person, Category, TrendingUp, Edit, Delete,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import api from '../services/api';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const heartBeat = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

function StoryDetail() {
  const { theme } = useAppTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Theme-aware styled components (inside component to access theme)
  const StoryContainer = styled(Container)(() => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    minHeight: '100vh',
    background: theme.palette.mode === 'light' 
      ? 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)'
      : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  }));

  const StoryPaper = styled(Paper)(() => ({
    borderRadius: '24px',
    padding: theme.spacing(5, 4),
    marginBottom: theme.spacing(4),
    background: theme.palette.mode === 'light'
      ? '#ffffff'
      : 'rgba(30, 41, 59, 0.9)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)'}`,
    boxShadow: theme.palette.mode === 'light'
      ? '0 8px 32px rgba(0, 0, 0, 0.08)'
      : '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    color: theme.palette.text.primary,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #81c784, #aed581, #90caf9)',
    }
  }));

  const CategoryBadge = styled(Chip)(({ categoryColor }) => ({
    background: `${categoryColor}15`,
    color: categoryColor,
    fontWeight: 600,
    border: `1px solid ${categoryColor}30`,
    borderRadius: '12px',
    fontSize: '0.9rem',
    padding: '8px 4px',
  }));

  const ActionButton = styled(IconButton)(({ active }) => ({
    borderRadius: '12px',
    padding: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: active 
      ? 'rgba(244, 67, 54, 0.1)' 
      : theme.palette.mode === 'light' 
        ? 'rgba(248, 250, 252, 0.8)' 
        : 'rgba(30, 41, 59, 0.8)',
    color: active ? '#f44336' : theme.palette.text.secondary,
    border: `1px solid ${active ? 'rgba(244, 67, 54, 0.3)' : theme.palette.mode === 'light' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
    '&:hover': {
      background: active ? 'rgba(244, 67, 54, 0.2)' : theme.palette.mode === 'light' ? 'rgba(100, 116, 139, 0.1)' : 'rgba(255, 255, 255, 0.05)',
      transform: 'scale(1.1)',
      ...(active && {
        animation: `${heartBeat} 0.6s ease-in-out`,
      })
    }
  }));

  const BackButton = styled(Button)(() => ({
    borderRadius: '12px',
    padding: '8px 20px',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(248, 250, 252, 0.8)' 
      : 'rgba(30, 41, 59, 0.8)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(100, 116, 139, 0.1)' 
        : 'rgba(255, 255, 255, 0.05)',
      borderColor: theme.palette.mode === 'light' 
        ? 'rgba(100, 116, 139, 0.3)' 
        : 'rgba(255, 255, 255, 0.2)',
    }
  }));

  const StoryContent = styled(Typography)(() => ({
    fontSize: '1.125rem',
    lineHeight: 1.8,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(3),
    whiteSpace: 'pre-line',
    '& p': {
      marginBottom: theme.spacing(2),
    }
  }));

  const categories = {
    business: { label: 'Business & Startup', icon: '💼', color: '#1976d2' },
    personal: { label: 'Personal Growth', icon: '🌱', color: '#4caf50' },
    education: { label: 'Education & Learning', icon: '📚', color: '#ff9800' },
    health: { label: 'Health & Wellness', icon: '💪', color: '#f44336' },
    relationships: { label: 'Relationships', icon: '❤️', color: '#e91e63' },
    career: { label: 'Career & Work', icon: '🚀', color: '#673ab7' },
    technology: { label: 'Technology', icon: '💻', color: '#00bcd4' },
    creative: { label: 'Creative Arts', icon: '🎨', color: '#ff5722' },
  };

  useEffect(() => {
    setMounted(true);
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/stories/${id}`);
      if (response.data.success) {
        setStory(response.data.data);
        setIsLiked(response.data.data.likedBy?.includes(user?.id) || false);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      setError(error.response?.data?.message || 'Story not found');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/stories/${id}/like`);
      if (response.data.success) {
        setIsLiked(response.data.data.isLiked);
        setStory(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            likes: response.data.data.likes
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: story.title,
      text: story.excerpt || story.content.substring(0, 150) + '...',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share was cancelled or failed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Story link copied to clipboard!');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <StoryContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: '#81c784', mb: 3 }} />
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
              Loading your inspiring story...
            </Typography>
          </Box>
        </Box>
      </StoryContainer>
    );
  }

  if (error) {
    return (
      <StoryContainer>
        <StoryPaper>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 2 }}>
              Story Not Found
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, fontSize: '1.125rem' }}>
              The story you're looking for doesn't exist or may have been removed.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/browse')}
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #81c784, #aed581)',
                px: 4,
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none'
              }}
            >
              Browse Stories
            </Button>
          </Box>
        </StoryPaper>
      </StoryContainer>
    );
  }

  if (!story) return null;

  const categoryInfo = categories[story.category] || categories.personal;
  const isAuthor = user?.id === story.author?._id || user?.id === story.author;

  return (
    <StoryContainer>
      {/* Back Button */}
      <BackButton
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 4 }}
      >
        Back
      </BackButton>

      {/* Main Story Content */}
      <StoryPaper>
        {/* Story Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          {/* Category and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CategoryBadge
              label={categoryInfo.label}
              categoryColor={categoryInfo.color}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <ActionButton active={isLiked} onClick={handleLike}>
              {isLiked ? <Favorite /> : <FavoriteBorder />}
            </ActionButton>
            <ActionButton onClick={handleShare}>
              <Share />
            </ActionButton>
            {isAuthor && (
              <ActionButton onClick={() => navigate(`/edit-story/${id}`)}>
                <Edit />
              </ActionButton>
            )}
          </Box>
        </Box>

        {/* Story Title */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mb: 4,
            color: theme.palette.text.primary,
            lineHeight: 1.2,
            fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' }
          }}
        >
          {story.title}
        </Typography>

        {/* Author and Meta Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #81c784, #aed581)' }}>
              {story.authorName?.charAt(0) || story.author?.name?.charAt(0) || 'A'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {story.authorName || story.author?.name || 'Anonymous'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Published on {formatDate(story.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {story.readTime} min read
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {story.engagement?.views || 0} views
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Favorite sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {story.engagement?.likes || 0} likes
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Story Tags */}
        {story.tags && story.tags.length > 0 && (
          <Box sx={{ mb: 4 }}>
            {story.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  mr: 1,
                  mb: 1,
                  background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))',
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(129, 199, 132, 0.3)' : 'rgba(129, 199, 132, 0.4)'}`,
                  fontWeight: 600
                }}
              />
            ))}
          </Box>
        )}

        {/* Story Content */}
        <StoryContent variant="body1">
          {story.content}
        </StoryContent>

        {/* Story Metadata */}
        {story.metadata && (
          <Paper
            sx={{
              p: 4,
              borderRadius: '16px',
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.05), rgba(144, 202, 249, 0.05))'
                : 'linear-gradient(135deg, rgba(129, 199, 132, 0.15), rgba(144, 202, 249, 0.15))',
              border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(129, 199, 132, 0.2)' : 'rgba(129, 199, 132, 0.3)'}`,
              mb: 4
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
              📊 Story Details
            </Typography>

            {story.metadata.recoveryTime && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 0.5 }}>
                  Recovery Time:
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  {story.metadata.recoveryTime}
                </Typography>
              </Box>
            )}

            {story.metadata.currentStatus && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 0.5 }}>
                  Current Status:
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  {story.metadata.currentStatus.replace('_', ' ').charAt(0).toUpperCase() +
                   story.metadata.currentStatus.replace('_', ' ').slice(1)}
                </Typography>
              </Box>
            )}

            {story.metadata.keyLessons && story.metadata.keyLessons.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary, mb: 2 }}>
                  💡 Key Lessons Learned:
                </Typography>
                {story.metadata.keyLessons.map((lesson, index) => (
                  <Typography key={index} variant="body1" sx={{ color: theme.palette.text.primary, mb: 1, pl: 2 }}>
                    • {lesson}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        )}

        {/* Engagement Section */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary, fontWeight: 600 }}>
            Show your appreciation:
          </Typography>
          <ActionButton active={isLiked} onClick={handleLike} size="large">
            {isLiked ? <Favorite sx={{ fontSize: 32 }} /> : <FavoriteBorder sx={{ fontSize: 32 }} />}
          </ActionButton>
          <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
            {story.engagement?.likes || 0} people found this inspiring
          </Typography>
        </Box>

        {/* Related Stories or Call to Action */}
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))',
            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(129, 199, 132, 0.3)' : 'rgba(129, 199, 132, 0.4)'}`
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 700 }}>
            Inspired by this story?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
            Share your own transformation journey and inspire others in our community.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/create-story')}
            sx={{
              background: 'linear-gradient(135deg, #81c784 0%, #90caf9 100%)',
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(129, 199, 132, 0.4)',
              }
            }}
          >
            Share Your Story
          </Button>
        </Paper>
      </StoryPaper>
    </StoryContainer>
  );
}

export default StoryDetail;
