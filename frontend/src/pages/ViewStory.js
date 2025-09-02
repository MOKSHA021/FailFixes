/* eslint-disable no-console */

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Avatar, Chip, Button,
  IconButton, CircularProgress, Alert, Divider, Stack, Card,
  CardContent, TextField, Collapse, Fade, Grow, useTheme, useMediaQuery
} from '@mui/material';
import {
  ArrowBack, Share, Favorite, FavoriteOutlined, Comment,
  Visibility, AccessTime, TrendingUp, Person, Category as CategoryIcon,
  Send, ExpandMore, ExpandLess, CheckCircle, School, Business,
  Psychology, FitnessCenter, Computer, Palette, FamilyRestroom
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';

// Animation keyframes
const gentleFloat = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
`;

const softGlow = keyframes`
  0%, 100% { box-shadow: 0 0 15px rgba(129, 199, 132, 0.2); }
  50% { box-shadow: 0 0 25px rgba(129, 199, 132, 0.3); }
`;

function ViewStory() {
  const { theme } = useAppTheme();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();

  // Theme-aware styled components (inside component to access theme)
  const BackgroundContainer = styled(Box)(() => ({
    minHeight: '100vh',
    background: theme.palette.mode === 'light' 
      ? `
        radial-gradient(circle at 20% 20%, rgba(174, 213, 129, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 183, 195, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(179, 229, 252, 0.15) 0%, transparent 50%),
        linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 25%, #fef7f0 50%, #f0fff4 75%, #f5f8ff 100%)
      `
      : `
        radial-gradient(circle at 20% 20%, rgba(174, 213, 129, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 183, 195, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(179, 229, 252, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)
      `,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  }));

  const StoryCard = styled(Paper)(() => ({
    background: theme.palette.mode === 'light'
      ? `
        linear-gradient(135deg,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(255, 255, 255, 0.8) 100%
        )
      `
      : `
        linear-gradient(135deg,
          rgba(30, 41, 59, 0.9) 0%,
          rgba(15, 23, 42, 0.8) 100%
        )
      `,
    backdropFilter: 'blur(20px) saturate(120%)',
    WebkitBackdropFilter: 'blur(20px) saturate(120%)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '24px',
    padding: theme.spacing(6),
    marginBottom: theme.spacing(4),
    position: 'relative',
    overflow: 'hidden',
    color: theme.palette.text.primary,
    boxShadow: theme.palette.mode === 'light'
      ? `
        0 8px 32px rgba(0, 0, 0, 0.08),
        0 4px 16px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `
      : `
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 4px 16px rgba(0, 0, 0, 0.2)
      `,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #81c784, #aed581, #90caf9, #f8bbd9)',
      borderRadius: '24px 24px 0 0',
    }
  }));

  const ActionButton = styled(Button)(({ variant: buttonVariant, selected }) => ({
    borderRadius: 16,
    padding: '12px 24px',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    ...(buttonVariant === 'like' && {
      background: selected
        ? 'linear-gradient(135deg, #e91e63, #f06292)'
        : theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(30, 41, 59, 0.8)',
      color: selected ? '#fff' : '#e91e63',
      border: `2px solid ${selected ? '#e91e63' : 'rgba(233, 30, 99, 0.3)'}`,
      '&:hover': {
        background: selected
          ? 'linear-gradient(135deg, #d81b60, #e91e63)'
          : theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, rgba(233, 30, 99, 0.1), rgba(233, 30, 99, 0.05))'
            : 'linear-gradient(135deg, rgba(233, 30, 99, 0.2), rgba(233, 30, 99, 0.15))',
        transform: 'translateY(-2px) scale(1.05)',
      }
    }),
    ...(buttonVariant === 'comment' && {
      background: theme.palette.mode === 'light'
        ? 'rgba(33, 150, 243, 0.1)'
        : 'rgba(33, 150, 243, 0.2)',
      color: '#2196f3',
      border: '2px solid rgba(33, 150, 243, 0.3)',
      '&:hover': {
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(33, 150, 243, 0.1))'
          : 'linear-gradient(135deg, rgba(33, 150, 243, 0.3), rgba(33, 150, 243, 0.2))',
        transform: 'translateY(-2px) scale(1.05)',
      }
    })
  }));

  const MetadataChip = styled(Chip)(({ variant: chipVariant }) => ({
    borderRadius: 16,
    padding: '12px 16px',
    fontSize: '0.9rem',
    fontWeight: 600,
    height: 'auto',
    ...(chipVariant === 'recovery' && {
      background: 'linear-gradient(135deg, #81c784, #aed581)',
      color: '#fff',
      '& .MuiSvgIcon-root': { color: '#fff' }
    }),
    ...(chipVariant === 'status' && {
      background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
      color: '#fff',
      '& .MuiSvgIcon-root': { color: '#fff' }
    })
  }));

  const CommentCard = styled(Paper)(() => ({
    background: theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    color: theme.palette.text.primary,
  }));

  const categories = [
    { value: 'business', label: 'Business & Startup', icon: Business, color: '#81c784' },
    { value: 'personal', label: 'Personal Growth', icon: Psychology, color: '#90caf9' },
    { value: 'education', label: 'Education & Learning', icon: School, color: '#ffb74d' },
    { value: 'health', label: 'Health & Wellness', icon: FitnessCenter, color: '#f8bbd9' },
    { value: 'relationships', label: 'Relationships', icon: FamilyRestroom, color: '#b39ddb' },
    { value: 'career', label: 'Career & Work', icon: Business, color: '#81c784' },
    { value: 'technology', label: 'Technology', icon: Computer, color: '#90caf9' },
    { value: 'creative', label: 'Creative Arts', icon: Palette, color: '#ffb74d' }
  ];

  // Get category info function
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) ||
      { label: categoryValue, icon: CategoryIcon, color: '#81c784' };
  };

  // Fetch story data
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`http://localhost:5000/api/stories/${id}`, { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load story');
        }

        setStory(data.story);
        console.log('📖 Story loaded:', data.story);
      } catch (err) {
        console.error('❌ Error loading story:', err);
        setError(err.message || 'Failed to load story');
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };

    fetchStory();
  }, [id]);

  // Handle like toggle
  const handleLike = async () => {
    if (likeLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLikeLoading(true);
      const response = await fetch(`http://localhost:5000/api/stories/${id}/like`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setStory(prev => ({
          ...prev,
          stats: { ...prev.stats, likes: data.likesCount },
          isLiked: data.isLiked
        }));
        console.log('✅ Like updated:', data.isLiked, data.likesCount);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Like error:', error);
      alert('Error updating like. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle comment submission
  const handleComment = async () => {
    if (!commentText.trim() || commentLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setCommentLoading(true);
      const response = await fetch(`http://localhost:5000/api/stories/${id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentText })
      });

      const data = await response.json();
      if (response.ok) {
        setStory(prev => ({
          ...prev,
          comments: [...(prev.comments || []), data.comment],
          stats: { ...prev.stats, comments: data.commentsCount }
        }));
        setCommentText('');
        console.log('✅ Comment added:', data.comment);
      } else {
        throw new Error(data.message || 'Error adding comment');
      }
    } catch (error) {
      console.error('❌ Comment error:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <BackgroundContainer>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} sx={{ color: '#81c784', mb: 3 }} />
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                Loading your inspiring story...
              </Typography>
            </Box>
          </Box>
        </Container>
      </BackgroundContainer>
    );
  }

  if (error) {
    return (
      <BackgroundContainer>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <StoryCard>
            <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => navigate('/browse')}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #81c784, #aed581)',
                '&:hover': { background: 'linear-gradient(135deg, #66bb6a, #81c784)' }
              }}
            >
              Back to Stories
            </Button>
          </StoryCard>
        </Container>
      </BackgroundContainer>
    );
  }

  if (!story) return null;

  // Extract category info before JSX
  const categoryInfo = getCategoryInfo(story.category);
  const CategoryIconComponent = categoryInfo.icon;

  return (
    <BackgroundContainer>
      <Container maxWidth="lg">
        {/* Header Actions */}
        <Button
          startIcon={<ArrowBack />}
          variant="outlined"
          onClick={() => navigate('/browse')}
          sx={{
            mb: 4,
            borderRadius: 2,
            color: '#81c784',
            borderColor: '#81c784',
            background: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.8)' 
              : 'rgba(30, 41, 59, 0.8)',
            '&:hover': { 
              borderColor: '#66bb6a', 
              backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(129, 199, 132, 0.1)' 
                : 'rgba(129, 199, 132, 0.2)'
            }
          }}
        >
          Back to Stories
        </Button>

        {/* Main Story Card */}
        <StoryCard>
          {/* Category Badge */}
          {story.category && (
            <Chip
              icon={<CategoryIconComponent />}
              label={categoryInfo.label}
              sx={{
                background: 'linear-gradient(135deg, #81c784, #aed581)',
                color: '#fff',
                fontWeight: 600,
                padding: '8px 12px',
                mb: 4,
                '& .MuiSvgIcon-root': { color: '#fff' }
              }}
            />
          )}

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

          {/* Author Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Avatar 
              sx={{ 
                background: 'linear-gradient(135deg, #81c784, #aed581)', 
                color: 'white', 
                fontWeight: 700,
                width: 48,
                height: 48
              }}
            >
              {(story.author?.name || 'Anonymous').charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {story.author?.name || 'Anonymous'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                @{story.author?.username || 'user'} • {story.readTime || 1} min read
              </Typography>
            </Box>
          </Box>

          {/* Recovery Time and Status Display */}
          {(story.metadata?.recoveryTime || story.metadata?.currentStatus) && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 700 }}>
                Recovery Journey
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {story.metadata?.recoveryTime && (
                  <MetadataChip
                    variant="recovery"
                    icon={<AccessTime />}
                    label={`Recovery Time: ${story.metadata.recoveryTime}`}
                  />
                )}
                {story.metadata?.currentStatus && (
                  <MetadataChip
                    variant="status"
                    icon={<TrendingUp />}
                    label={`Current Status: ${story.metadata.currentStatus.replace('_', ' ').toUpperCase()}`}
                  />
                )}
              </Stack>
              {story.metadata?.currentStatus === 'thriving' && (
                <Chip
                  icon={<CheckCircle />}
                  label="Success Story - Fully Recovered & Thriving"
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #4caf50, #81c784)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              )}
            </Box>
          )}

          {/* Story Content */}
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.125rem',
              lineHeight: 1.8,
              color: theme.palette.text.primary,
              mb: 4,
              whiteSpace: 'pre-line'
            }}
          >
            {story.content}
          </Typography>

          {/* Key Lessons */}
          {story.metadata?.keyLessons && story.metadata.keyLessons.length > 0 && (
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
                Key Lessons Learned
              </Typography>
              {story.metadata.keyLessons.map((lesson, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      background: 'linear-gradient(135deg, #81c784, #aed581)',
                      fontSize: '0.875rem',
                      fontWeight: 700
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Typography variant="body1" sx={{ color: theme.palette.text.primary, flex: 1 }}>
                    {lesson}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 700 }}>
                Tags
              </Typography>
              {story.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    mr: 1,
                    mb: 1,
                    background: theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))'
                      : 'linear-gradient(135deg, rgba(129, 199, 132, 0.2), rgba(144, 202, 249, 0.2))',
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(129, 199, 132, 0.3)' : 'rgba(129, 199, 132, 0.4)'}`,
                    fontWeight: 600
                  }}
                />
              ))}
            </Box>
          )}

          {/* Stats */}
          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {story.stats?.views || 0} views
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Favorite sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {story.stats?.likes || 0} likes
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Comment sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {story.stats?.comments || 0} comments
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <ActionButton
              variant="like"
              selected={story.isLiked}
              startIcon={story.isLiked ? <Favorite /> : <FavoriteOutlined />}
              onClick={handleLike}
              disabled={likeLoading || !isAuthenticated}
            >
              {story.isLiked ? 'Liked' : 'Like'} ({story.stats?.likes || 0})
            </ActionButton>
            <ActionButton
              variant="comment"
              startIcon={showComments ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowComments(!showComments)}
            >
              Comments ({story.stats?.comments || 0})
            </ActionButton>
          </Box>

          {/* Authentication Notice */}
          {!isAuthenticated && (
            <Alert
              severity="info"
              sx={{
                borderRadius: '12px',
                mb: 4,
                background: theme.palette.mode === 'light'
                  ? 'rgba(129, 199, 132, 0.1)'
                  : 'rgba(129, 199, 132, 0.2)',
                border: '1px solid rgba(129, 199, 132, 0.3)'
              }}
            >
              <Button
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', color: '#81c784' }}
              >
                Sign in
              </Button>
              {' '}to like and comment on stories
            </Alert>
          )}

          {/* Comments Section */}
          <Collapse in={showComments}>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.primary, fontWeight: 700 }}>
                Comments ({story.stats?.comments || 0})
              </Typography>

              {/* Add Comment Form - Only for authenticated users */}
              {isAuthenticated ? (
                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: theme.palette.mode === 'light'
                          ? 'rgba(255, 255, 255, 0.8)'
                          : 'rgba(30, 41, 59, 0.8)',
                        color: theme.palette.text.primary,
                        '& input': {
                          color: theme.palette.text.primary
                        },
                        '& textarea': {
                          color: theme.palette.text.primary
                        }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={commentLoading ? <CircularProgress size={18} color="inherit" /> : <Send />}
                    onClick={handleComment}
                    disabled={!commentText.trim() || commentLoading}
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #81c784, #aed581)',
                      '&:hover': { background: 'linear-gradient(135deg, #66bb6a, #81c784)' }
                    }}
                  >
                    {commentLoading ? 'Posting...' : 'Post Comment'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Button
                    onClick={() => navigate('/login')}
                    sx={{ textTransform: 'none', color: '#81c784', fontWeight: 600 }}
                  >
                    Sign in
                  </Button>
                  {' '}to join the conversation
                </Box>
              )}

              {/* Comments List */}
              {story.comments && story.comments.length > 0 ? (
                story.comments.map((comment, index) => (
                  <CommentCard key={index}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1 }}>
                      {comment.user?.name || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 2, lineHeight: 1.6 }}>
                      {comment.content}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Typography>
                  </CommentCard>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    No comments yet. Be the first to share your thoughts!
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </StoryCard>
      </Container>
    </BackgroundContainer>
  );
}

export default ViewStory;
