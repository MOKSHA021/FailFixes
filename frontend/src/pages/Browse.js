/* eslint-disable no-console */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container, Typography, Grid, Box, TextField, InputAdornment,
  FormControl, Select, MenuItem, InputLabel, Chip, Paper, Avatar,
  Fade, Grow, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Stack, Alert, CircularProgress, Card, CardContent, CardActions
} from '@mui/material';
import {
  Search, Category, Business, Psychology, School, FitnessCenter,
  FamilyRestroom, Computer, Palette, AccessTime, Favorite, Visibility,
  Login, PersonAdd, AutoFixHigh, Close, ArrowForward, OpenInNew,
  Comment, FavoriteOutlined
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// 🎯 CUSTOM DEBOUNCE HOOK - MOVED OUTSIDE
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 🎯 MOVED ALL ANIMATIONS OUTSIDE COMPONENT
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

// 🎯 MOVED ALL STYLED COMPONENTS OUTSIDE
const BackgroundContainer = styled(Box)(({ theme, darkMode }) => ({
  minHeight: '100vh',
  background: darkMode
    ? `
      radial-gradient(circle at 20% 20%, rgba(174, 213, 129, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 183, 195, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(179, 229, 252, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)
    `
    : `
      radial-gradient(circle at 20% 20%, rgba(174, 213, 129, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 183, 195, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(179, 229, 252, 0.15) 0%, transparent 50%),
      linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 25%, #fef7f0 50%, #f0fff4 75%, #f5f8ff 100%)
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
    background: darkMode
      ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e8f5e8' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: 'none',
  },
}));

const FloatingParticle = styled(Box)(({ delay, size, left, top, darkMode }) => ({
  position: 'absolute',
  left: `${left}%`,
  top: `${top}%`,
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: '50%',
  background: darkMode
    ? 'linear-gradient(135deg, rgba(174, 213, 129, 0.1), rgba(179, 229, 252, 0.08))'
    : 'linear-gradient(135deg, rgba(174, 213, 129, 0.2), rgba(179, 229, 252, 0.15))',
  animation: `${softParticle} ${4 + Math.random() * 3}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  backdropFilter: 'blur(1px)',
  border: darkMode 
    ? '1px solid rgba(174, 213, 129, 0.05)'
    : '1px solid rgba(174, 213, 129, 0.1)'
}));

const HeroCard = styled(Paper)(({ theme, darkMode }) => ({
  background: darkMode
    ? `
      linear-gradient(135deg,
        rgba(30, 41, 59, 0.85) 0%,
        rgba(15, 23, 42, 0.75) 50%,
        rgba(30, 41, 59, 0.65) 100%
      )
    `
    : `
      linear-gradient(135deg,
        rgba(255, 255, 255, 0.85) 0%,
        rgba(255, 255, 255, 0.75) 50%,
        rgba(255, 255, 255, 0.65) 100%
      )
    `,
  backdropFilter: 'blur(20px) saturate(120%)',
  WebkitBackdropFilter: 'blur(20px) saturate(120%)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '24px',
  padding: theme.spacing(6, 6),
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: darkMode
    ? `
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.2)
    `
    : `
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

const SearchCard = styled(Paper)(({ theme, darkMode }) => ({
  background: darkMode
    ? `
      linear-gradient(135deg,
        rgba(30, 41, 59, 0.85) 0%,
        rgba(15, 23, 42, 0.75) 100%
      )
    `
    : `
      linear-gradient(135deg,
        rgba(255, 255, 255, 0.85) 0%,
        rgba(255, 255, 255, 0.75) 100%
      )
    `,
  backdropFilter: 'blur(20px) saturate(120%)',
  WebkitBackdropFilter: 'blur(20px) saturate(120%)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  padding: theme.spacing(5),
  marginBottom: theme.spacing(6),
  boxShadow: darkMode
    ? `
      0 6px 24px rgba(0, 0, 0, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.2)
    `
    : `
      0 6px 24px rgba(0, 0, 0, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.04)
    `,
}));

const StyledTextField = styled(TextField)(({ theme, darkMode }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    background: darkMode 
      ? 'rgba(30, 41, 59, 0.8)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    color: darkMode ? '#ffffff' : '#000000',
    '& input': {
      color: darkMode ? '#ffffff' : '#000000',
    },
    '&:hover': {
      background: darkMode 
        ? 'rgba(30, 41, 59, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
    }
  },
  '& .MuiInputLabel-root': {
    color: darkMode ? '#b3b3b3' : '#666666',
  }
}));

const StyledSelect = styled(Select)(({ theme, darkMode }) => ({
  borderRadius: '16px',
  background: darkMode 
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(255, 255, 255, 0.8)',
  color: darkMode ? '#ffffff' : '#000000',
}));

const ElegantButton = styled(Button)(({ variant: buttonVariant, darkMode }) => ({
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
    background: darkMode 
      ? 'rgba(15, 23, 42, 0.1)'
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    color: '#81c784',
    '&:hover': {
      background: darkMode
        ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.2), rgba(144, 202, 249, 0.15))'
        : 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))',
      transform: 'translateY(-1px) scale(1.01)',
      boxShadow: '0 6px 20px rgba(129, 199, 132, 0.2)',
      borderWidth: '2px',
    }
  }),
}));

const CategoryChip = styled(Chip)(({ theme, selected, darkMode }) => ({
  borderRadius: '16px',
  padding: '8px 4px',
  fontSize: '0.9rem',
  fontWeight: 600,
  minHeight: 40,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  background: selected
    ? 'linear-gradient(135deg, #81c784 0%, #aed581 100%)'
    : darkMode
      ? 'rgba(30, 41, 59, 0.7)'
      : 'rgba(255, 255, 255, 0.7)',
  color: selected ? 'white' : darkMode ? '#ffffff' : '#000000',
  border: selected ? 'none' : darkMode 
    ? '1px solid rgba(129, 199, 132, 0.2)'
    : '1px solid rgba(129, 199, 132, 0.3)',
  backdropFilter: 'blur(8px)',
  boxShadow: selected
    ? '0 4px 15px rgba(129, 199, 132, 0.4)'
    : darkMode
      ? '0 2px 8px rgba(0, 0, 0, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: selected
      ? '0 8px 25px rgba(129, 199, 132, 0.5)'
      : '0 6px 20px rgba(129, 199, 132, 0.3)',
    background: selected
      ? 'linear-gradient(135deg, #81c784, #aed581)'
      : darkMode
        ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.2), rgba(144, 202, 249, 0.15))'
        : 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))',
  }
}));

const StoryCard = styled(Card)(({ theme, darkMode }) => ({
  background: darkMode
    ? `
      linear-gradient(135deg,
        rgba(30, 41, 59, 0.9) 0%,
        rgba(15, 23, 42, 0.8) 100%
      )
    `
    : `
      linear-gradient(135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.8) 100%
      )
    `,
  backdropFilter: 'blur(15px) saturate(120%)',
  WebkitBackdropFilter: 'blur(15px) saturate(120%)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: darkMode
    ? `
      0 6px 20px rgba(0, 0, 0, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.2)
    `
    : `
      0 6px 20px rgba(0, 0, 0, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.04)
    `,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: darkMode
      ? `
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 8px 24px rgba(129, 199, 132, 0.35)
      `
      : `
        0 20px 40px rgba(0, 0, 0, 0.12),
        0 8px 24px rgba(129, 199, 132, 0.25)
      `,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #81c784, #aed581, #90caf9)',
    borderRadius: '20px 20px 0 0',
  }
}));

const StatsChip = styled(Box)(({ theme, darkMode }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 8px',
  borderRadius: 12,
  backgroundColor: darkMode
    ? 'rgba(129, 199, 132, 0.2)'
    : 'rgba(129, 199, 132, 0.1)',
  border: darkMode 
    ? '1px solid rgba(129, 199, 132, 0.3)'
    : '1px solid rgba(129, 199, 132, 0.2)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: darkMode
      ? 'rgba(129, 199, 132, 0.25)'
      : 'rgba(129, 199, 132, 0.15)',
    transform: 'scale(1.05)'
  }
}));

const MiniLikeButton = styled(IconButton)(({ isLiked, darkMode }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 8px',
  borderRadius: 12,
  backgroundColor: isLiked
    ? 'rgba(233, 30, 99, 0.1)'
    : darkMode
      ? 'rgba(129, 199, 132, 0.2)'
      : 'rgba(129, 199, 132, 0.1)',
  border: `1px solid ${isLiked ? '#e91e63' : darkMode ? 'rgba(129, 199, 132, 0.4)' : 'rgba(129, 199, 132, 0.3)'}`,
  minWidth: 'auto',
  height: 28,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: isLiked
      ? 'rgba(233, 30, 99, 0.2)'
      : 'rgba(233, 30, 99, 0.1)',
    transform: 'scale(1.05)'
  }
}));

function Browse() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const darkMode = theme.palette.mode === 'dark';

  // 🎯 OPTIMIZED STATE
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    sortBy: 'recent',
    page: 1,
    limit: 9
  });
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({});
  const [selectedStory, setSelectedStory] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Debounce search input with 300ms delay
  const debouncedSearch = useDebounce(searchInput, 300);

  // 🎯 MEMOIZED CATEGORIES
  const categories = useMemo(() => [
    { value: 'all', label: 'All Stories', icon: Category, color: '#64748b' },
    { value: 'business', label: 'Business', icon: Business, color: '#81c784' },
    { value: 'personal', label: 'Personal Growth', icon: Psychology, color: '#90caf9' },
    { value: 'education', label: 'Education', icon: School, color: '#ffb74d' },
    { value: 'health', label: 'Health', icon: FitnessCenter, color: '#f8bbd9' },
    { value: 'relationships', label: 'Relationships', icon: FamilyRestroom, color: '#b39ddb' },
    { value: 'career', label: 'Career', icon: Business, color: '#ff8a65' },
    { value: 'technology', label: 'Technology', icon: Computer, color: '#81c784' },
    { value: 'creative', label: 'Creative', icon: Palette, color: '#90caf9' },
  ], []);

  // 🎯 MEMOIZED FETCH STORIES
  const fetchStories = useCallback(async (newFilters = filters) => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      if (newFilters.category && newFilters.category !== 'all') {
        queryParams.append('category', newFilters.category);
      }
      if (newFilters.search && newFilters.search.trim()) {
        queryParams.append('search', newFilters.search.trim());
      }
      queryParams.append('sortBy', newFilters.sortBy);
      queryParams.append('page', newFilters.page.toString());
      queryParams.append('limit', newFilters.limit.toString());

      console.log('🔍 Fetching stories with params:', Object.fromEntries(queryParams));

      const response = await fetch(`http://localhost:5000/api/stories?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stories');
      }

      setStories(data.stories || []);
      setPagination(data.pagination || {});
      console.log('✅ Fetched:', data.stories?.length || 0, 'stories - Page:', data.pagination?.currentPage);

    } catch (error) {
      console.error('❌ Error fetching stories:', error);
      setError(`Failed to load stories: ${error.message}`);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      const newFilters = { ...filters, search: debouncedSearch, page: 1 };
      setFilters(newFilters);
      fetchStories(newFilters);
    }
  }, [debouncedSearch, filters, fetchStories]);

  // Initial fetch
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // 🎯 MEMOIZED HANDLERS
  const handleFilterChange = useCallback((key, value) => {
    if (key === 'search') {
      setSearchInput(value); // This will trigger debounced search
    } else {
      // For non-search filters, reset to page 1 except when changing page
      const newFilters = {
        ...filters,
        [key]: value,
        page: key === 'page' ? value : 1
      };
      console.log('🔄 Filter change:', key, '=', value, '| New page:', newFilters.page);
      setFilters(newFilters);
      fetchStories(newFilters);
    }
  }, [filters, fetchStories]);

  const handlePageChange = useCallback((newPage) => {
    console.log('📄 Page change: from', filters.page, 'to', newPage);
    handleFilterChange('page', newPage);
  }, [filters.page, handleFilterChange]);

  const handleStoryClick = useCallback((story) => {
    const user = localStorage.getItem('ff_user') || localStorage.getItem('token');
    if (!user) {
      setSelectedStory(story);
      setOpenDialog(true);
    } else {
      navigate(`/story/${story._id}`);
    }
  }, [navigate]);

  const handleLikeToggle = useCallback(async (storyId, currentIsLiked) => {
    const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
    if (!token) {
      const story = stories.find(s => s._id === storyId);
      setSelectedStory(story);
      setOpenDialog(true);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/stories/${storyId}/like`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setStories(prevStories =>
          prevStories.map(story =>
            story._id === storyId
              ? {
                  ...story,
                  stats: { ...story.stats, likes: data.likesCount },
                  isLiked: data.isLiked
                }
              : story
          )
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Like toggle error:', error);
    }
  }, [stories]);

  const handleViewStory = useCallback(async (storyId) => {
    navigate(`/story/${storyId}`);
    setStories(prevStories =>
      prevStories.map(story =>
        story._id === storyId
          ? { ...story, stats: { ...story.stats, views: (story.stats.views || 0) + 1 } }
          : story
      )
    );
  }, [navigate]);

  return (
    <BackgroundContainer darkMode={darkMode}>
      {/* Floating Particles */}
      {Array.from({ length: 6 }, (_, i) => (
        <FloatingParticle
          key={`particle-${i}`} // 🎯 STABLE KEYS
          delay={i * 0.7}
          size={10 + Math.random() * 6}
          left={Math.random() * 100}
          top={Math.random() * 100}
          darkMode={darkMode}
        />
      ))}

      <Container maxWidth="lg">
        {/* Hero Section */}
        <HeroCard darkMode={darkMode}>
          <AutoFixHigh sx={{
            fontSize: '4rem',
            background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: `${gentleFloat} 4s ease-in-out infinite, ${softGlow} 3s ease-in-out infinite alternate`,
            mb: 2
          }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 2,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Discover Stories
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Explore inspiring transformation stories from people who turned their challenges into triumphs
          </Typography>
        </HeroCard>

        {/* Search & Filter Section */}
        <SearchCard darkMode={darkMode}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 4,
              color: theme.palette.text.primary,
              textAlign: 'center'
            }}
          >
            Find Your Inspiration
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                key="search-input" // 🎯 STABLE KEY
                fullWidth
                placeholder="Search stories..."
                value={searchInput}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                darkMode={darkMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: theme.palette.text.secondary }}>Category</InputLabel>
                <StyledSelect
                  key="category-select" // 🎯 STABLE KEY
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  darkMode={darkMode}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: theme.palette.text.secondary }}>Sort By</InputLabel>
                <StyledSelect
                  key="sort-select" // 🎯 STABLE KEY
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  darkMode={darkMode}
                >
                  <MenuItem value="recent">Most Recent</MenuItem>
                  <MenuItem value="likes">Most Liked</MenuItem>
                  <MenuItem value="views">Most Viewed</MenuItem>
                </StyledSelect>
              </FormControl>
            </Grid>
          </Grid>

          {/* Category Filter Chips */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 600 }}>
              Browse by Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <CategoryChip
                  key={`chip-${category.value}`} // 🎯 STABLE KEYS
                  selected={filters.category === category.value}
                  onClick={() => handleFilterChange('category', category.value)}
                  label={category.label}
                  icon={React.createElement(category.icon)}
                  darkMode={darkMode}
                />
              ))}
            </Box>
          </Box>
        </SearchCard>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ color: '#81c784' }} />
          </Box>
        )}

        {/* No Stories State */}
        {!loading && stories.length === 0 && !error && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" sx={{ mb: 2, color: theme.palette.text.primary, fontWeight: 700 }}>
              No Stories Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: theme.palette.text.secondary }}>
              {filters.search || filters.category !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Be the first to share your story!'}
            </Typography>
            <ElegantButton
              variant="primary"
              onClick={() => navigate('/create-story')}
              darkMode={darkMode}
              sx={{ px: 4, py: 1.5 }}
            >
              Share Your Story
            </ElegantButton>
          </Box>
        )}

        {/* Stories Grid */}
        {!loading && stories.length > 0 && (
          <Grid container spacing={4}>
            {stories.map((story) => (
              <Grid item key={story._id} xs={12} md={6} lg={4}>
                <StoryCard
                  darkMode={darkMode}
                  onClick={() => handleStoryClick(story)}
                  sx={{ cursor: 'pointer' }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={categories.find(cat => cat.value === story.category)?.label || story.category}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #81c784, #aed581)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />

                      {/* Interactive Stats Display */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <StatsChip darkMode={darkMode}>
                          <Visibility sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
                            {story.stats?.views || 0}
                          </Typography>
                        </StatsChip>

                        {/* Interactive Like Button */}
                        <MiniLikeButton
                          isLiked={story.isLiked}
                          darkMode={darkMode}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeToggle(story._id, story.isLiked);
                          }}
                        >
                          {story.isLiked ? (
                            <Favorite sx={{ fontSize: 14, color: '#e91e63' }} />
                          ) : (
                            <FavoriteOutlined sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          )}
                          <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
                            {story.stats?.likes || 0}
                          </Typography>
                        </MiniLikeButton>

                        <StatsChip darkMode={darkMode}>
                          <Comment sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
                            {story.stats?.comments || 0}
                          </Typography>
                        </StatsChip>
                      </Box>
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: theme.palette.text.primary,
                        lineHeight: 1.3
                      }}
                    >
                      {story.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 3,
                        lineHeight: 1.6
                      }}
                    >
                      {story.excerpt || story.content?.substring(0, 150) + '...'}
                    </Typography>

                    {story.tags?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {story.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              mr: 0.5,
                              mb: 0.5,
                              fontSize: '0.75rem',
                              background: darkMode 
                                ? 'rgba(129, 199, 132, 0.2)' 
                                : 'rgba(129, 199, 132, 0.1)',
                              color: theme.palette.text.primary
                            }}
                          />
                        ))}
                        {story.tags.length > 3 && (
                          <Chip
                            label={`+${story.tags.length - 3}`}
                            size="small"
                            sx={{
                              fontSize: '0.75rem',
                              background: darkMode 
                                ? 'rgba(129, 199, 132, 0.2)' 
                                : 'rgba(129, 199, 132, 0.1)',
                              color: theme.palette.text.primary
                            }}
                          />
                        )}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {story.metadata?.readTime || 1} min read
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          • {new Date(story.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    {/* Read Story Button */}
                    <ElegantButton
                      variant="outlined"
                      endIcon={<ArrowForward />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewStory(story._id);
                      }}
                      darkMode={darkMode}
                      sx={{ ml: 'auto' }}
                    >
                      Read Story
                    </ElegantButton>
                  </CardActions>
                </StoryCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 6, gap: 2 }}>
            <ElegantButton
              variant="outlined"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
              darkMode={darkMode}
            >
              Previous
            </ElegantButton>

            <Box sx={{ textAlign: 'center', mx: 3 }}>
              <Typography variant="body1" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                ({pagination.totalStories} total stories)
              </Typography>
            </Box>

            <ElegantButton
              variant="outlined"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
              darkMode={darkMode}
            >
              Next
            </ElegantButton>
          </Box>
        )}

        {/* Login Prompt Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              background: darkMode
                ? 'rgba(15, 23, 42, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: darkMode 
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: darkMode
                ? '0 20px 60px rgba(0, 0, 0, 0.4)'
                : '0 20px 60px rgba(0, 0, 0, 0.2)',
            }
          }}
        >
          {selectedStory && (
            <>
              <DialogTitle sx={{ pb: 1, color: theme.palette.text.primary }}>
                {selectedStory.title}
                <IconButton
                  onClick={() => setOpenDialog(false)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.text.secondary
                  }}
                >
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Typography sx={{ mb: 3, color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                  {selectedStory.excerpt || selectedStory.content?.substring(0, 300) + '...'}
                </Typography>
                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Continue Reading
                  </Typography>
                  <Typography variant="body2">
                    Sign up for free to read the complete story and connect with our community of inspiring individuals.
                  </Typography>
                </Alert>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <ElegantButton
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  darkMode={darkMode}
                >
                  Sign In
                </ElegantButton>
                <ElegantButton
                  variant="primary"
                  onClick={() => navigate('/register')}
                  darkMode={darkMode}
                >
                  Join Free
                </ElegantButton>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </BackgroundContainer>
  );
}

export default Browse;
