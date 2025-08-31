/* eslint-disable no-console */

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Grid, Card, CardContent,
  Box, Chip, Paper, Alert, CircularProgress, Fade, Grow, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Divider,
  IconButton, LinearProgress, Skeleton, Avatar, Stack, useTheme,
  useMediaQuery, FormControl, InputLabel, Select, MenuItem,
  List,ListItem,ListItemText 
} from '@mui/material';
import {
  Create, Save, Preview, Close, Add, AutoFixHigh, Psychology,
  TipsAndUpdates, ArrowBack, Edit, CheckCircle, Lightbulb, Timeline,
  EmojiEvents, Business, FitnessCenter, FamilyRestroom, Computer,
  Palette, RocketLaunch, School, Category, AccessTime, TrendingUp
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTheme as useAppTheme } from '../context/ThemeContext';

/* ─────────────────────────── ANIMATION KEYFRAMES ─────────────────────────── */
const gentleFloat = keyframes`
  0%,100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
`;

const softGlow = keyframes`
  0%,100% { box-shadow: 0 0 15px rgba(129,199,132,.2), 0 0 30px rgba(129,199,132,.1); }
  50% { box-shadow: 0 0 25px rgba(129,199,132,.3), 0 0 40px rgba(129,199,132,.15); }
`;

const subtleShimmer = keyframes`
  0% {background-position:-200px 0;} 100% {background-position:200px 0;}
`;

const softParticle = keyframes`
  0%,100% { transform: translate(0,0); opacity:.2; }
  50% { transform: translate(8px,-15px); opacity:.4; }
`;

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
function CreateStory() {
  const { theme } = useAppTheme(); // Theme context
  const [storyData, setStoryData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    metadata: {
      recoveryTime: '',
      currentStatus: '',
      keyLessons: ['']
    }
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mounted, setMounted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Theme-aware styled components (inside component to access theme)
  const BackgroundContainer = styled(Box)(() => ({
    minHeight: '100vh',
    background: theme.palette.mode === 'light' 
      ? `
        radial-gradient(circle at 20% 20%, rgba(174,213,129,.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,183,195,.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(179,229,252,.15) 0%, transparent 50%),
        linear-gradient(135deg,#f8f9ff 0%,#f0f4ff 25%,#fef7f0 50%,#f0fff4 75%,#f5f8ff 100%)
      `
      : `
        radial-gradient(circle at 20% 20%, rgba(174,213,129,.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,183,195,.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(179,229,252,.1) 0%, transparent 50%),
        linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)
      `,
    position: 'relative',
    overflow: 'hidden',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: theme.palette.mode === 'light'
        ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e8f5e8' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      pointerEvents: 'none'
    }
  }));

  const FloatingParticle = styled(Box)(({ delay, size, left, top }) => ({
    position: 'absolute',
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg,rgba(174,213,129,.2),rgba(179,229,252,.15))'
      : 'linear-gradient(135deg,rgba(174,213,129,.1),rgba(179,229,252,.08))',
    animation: `${softParticle} ${4 + Math.random() * 3}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    backdropFilter: 'blur(1px)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(174,213,129,.1)' : 'rgba(174,213,129,.05)'}`
  }));

  const ElegantCard = styled(Card)(() => ({
    background: theme.palette.mode === 'light'
      ? `linear-gradient(135deg,rgba(255,255,255,.85)0%,rgba(255,255,255,.75)50%,rgba(255,255,255,.65)100%)`
      : `linear-gradient(135deg,rgba(30,41,59,.85)0%,rgba(15,23,42,.75)50%,rgba(30,41,59,.65)100%)`,
    backdropFilter: 'blur(20px) saturate(120%)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`,
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    color: theme.palette.text.primary,
    boxShadow: theme.palette.mode === 'light'
      ? `0 8px 32px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04),inset 0 1px 0 rgba(255,255,255,.6)`
      : `0 8px 32px rgba(0,0,0,.3),0 4px 16px rgba(0,0,0,.2)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      left: '-100%',
      background: `linear-gradient(90deg,transparent,rgba(129,199,132,.1),transparent)`,
      animation: `${subtleShimmer} 6s ease-in-out infinite`
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: 'linear-gradient(90deg,#81c784,#aed581,#90caf9,#f8bbd9)',
      borderRadius: '24px 24px 0 0'
    }
  }));

  const EnhancedTextField = styled(TextField)(() => ({
    marginBottom: theme.spacing(3),
    '& .MuiOutlinedInput-root': {
      borderRadius: 16,
      background: theme.palette.mode === 'light' 
        ? 'rgba(255,255,255,.8)' 
        : 'rgba(30,41,59,.8)',
      backdropFilter: 'blur(8px)',
      fontSize: '1rem',
      fontWeight: 500,
      color: theme.palette.text.primary,
      transition: 'all .3s ease',
      '&:hover': {
        background: theme.palette.mode === 'light' 
          ? 'rgba(255,255,255,.9)' 
          : 'rgba(30,41,59,.9)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,.08)',
        borderColor: 'rgba(129,199,132,.3)'
      },
      '&.Mui-focused': {
        background: theme.palette.mode === 'light' 
          ? 'rgba(255,255,255,.95)' 
          : 'rgba(30,41,59,.95)',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 20px rgba(129,199,132,.15)',
        borderColor: '#81c784'
      }
    },
    '& .MuiInputLabel-root': {
      fontWeight: 500,
      color: theme.palette.text.secondary,
      '&.Mui-focused': { color: '#81c784' }
    }
  }));

  const ElegantButton = styled(Button)(({ variant: buttonVariant }) => ({
    borderRadius: 16,
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    minHeight: 50,
    transition: 'all .3s ease',
    ...(buttonVariant === 'primary' && {
      background: 'linear-gradient(135deg,#81c784 0%,#aed581 50%,#90caf9 100%)',
      backgroundSize: '150% 150%',
      color: '#fff',
      boxShadow: '0 4px 15px rgba(129,199,132,.3)',
      '&:hover': {
        backgroundPosition: 'right center',
        transform: 'translateY(-2px) scale(1.01)',
        boxShadow: '0 8px 25px rgba(129,199,132,.4)'
      }
    }),
    ...(buttonVariant === 'outlined' && {
      border: '2px solid #81c784',
      color: '#81c784',
      background: theme.palette.mode === 'light' 
        ? 'rgba(255,255,255,.1)' 
        : 'rgba(30,41,59,.1)',
      backdropFilter: 'blur(8px)',
      '&:hover': {
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg,rgba(129,199,132,.1),rgba(144,202,249,.1))'
          : 'linear-gradient(135deg,rgba(129,199,132,.2),rgba(144,202,249,.15))',
        transform: 'translateY(-1px) scale(1.01)',
        boxShadow: '0 6px 20px rgba(129,199,132,.2)'
      }
    })
  }));

  const CategoryChip = styled(Chip)(({ selected }) => ({
    borderRadius: 16,
    padding: '16px 12px',
    fontSize: '.9rem',
    fontWeight: 600,
    minHeight: 70,
    cursor: 'pointer',
    transition: 'all .3s ease',
    background: selected
      ? 'linear-gradient(135deg,#81c784 0%,#aed581 100%)'
      : theme.palette.mode === 'light'
        ? 'rgba(255,255,255,.7)'
        : 'rgba(30,41,59,.7)',
    color: selected ? '#fff' : theme.palette.text.primary,
    border: selected ? 'none' : `1px solid ${theme.palette.mode === 'light' ? 'rgba(129,199,132,.3)' : 'rgba(129,199,132,.2)'}`,
    backdropFilter: 'blur(8px)',
    boxShadow: selected
      ? '0 4px 15px rgba(129,199,132,.4)'
      : theme.palette.mode === 'light'
        ? '0 2px 8px rgba(0,0,0,.08)'
        : '0 2px 8px rgba(0,0,0,.3)',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: selected
        ? '0 8px 25px rgba(129,199,132,.5)'
        : '0 6px 20px rgba(129,199,132,.3)'
    }
  }));

  const ProgressCard = styled(Paper)(() => ({
    padding: theme.spacing(4),
    borderRadius: 20,
    background: theme.palette.mode === 'light'
      ? 'rgba(255,255,255,.8)'
      : 'rgba(30,41,59,.8)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`,
    color: theme.palette.text.primary,
    boxShadow: theme.palette.mode === 'light'
      ? '0 6px 20px rgba(0,0,0,.08)'
      : '0 6px 20px rgba(0,0,0,.3)',
    position: 'sticky',
    top: 100
  }));

  const RequiredSelect = styled(FormControl)(() => ({
    marginBottom: theme.spacing(3),
    '& .MuiOutlinedInput-root': {
      borderRadius: 16,
      background: theme.palette.mode === 'light' 
        ? 'rgba(255,255,255,.8)' 
        : 'rgba(30,41,59,.8)',
      backdropFilter: 'blur(8px)',
      color: theme.palette.text.primary,
      '&:hover': {
        background: theme.palette.mode === 'light' 
          ? 'rgba(255,255,255,.9)' 
          : 'rgba(30,41,59,.9)',
      },
      '&.Mui-focused': {
        background: theme.palette.mode === 'light' 
          ? 'rgba(255,255,255,.95)' 
          : 'rgba(30,41,59,.95)',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#81c784',
        }
      }
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      '&.Mui-focused': { color: '#81c784' }
    }
  }));

  /* category list */
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

  const recoveryTimeOptions = ['1 month', '3 months', '6 months', '1 year', '2 years', '3+ years'];
  const currentStatusOptions = ['recovering', 'recovered', 'thriving', 'helping_others'];

  /* helpers */
  const calculateProgress = () => {
    const parts = [
      storyData.title.length >= 10,
      storyData.content.length >= 100,
      !!storyData.category,
      storyData.tags.length > 0,
      !!storyData.metadata.recoveryTime,
      !!storyData.metadata.currentStatus
    ];
    setProgress((parts.filter(Boolean).length / 6) * 100);
  };

  const updateWordCount = () => {
    const words = storyData.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setReadTime(Math.max(1, Math.ceil(words / 200)));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setInitialLoading(false);
      setMounted(true);
    }, 1500);
    calculateProgress();
    updateWordCount();
    return () => clearTimeout(t);
  }, [storyData]);

  /* handlers */
  const handleInputChange = (field, value) => setStoryData(p => ({ ...p, [field]: value }));
  const handleMetadataChange = (field, value) =>
    setStoryData(p => ({ ...p, metadata: { ...p.metadata, [field]: value } }));

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !storyData.tags.includes(tag) && storyData.tags.length < 5) {
      setStoryData(p => ({ ...p, tags: [...p.tags, tag] }));
      setNewTag('');
    }
  };

  const removeTag = (t) => setStoryData(p => ({ ...p, tags: p.tags.filter(tag => tag !== t) }));

  const addKeyLesson = () => {
    if (storyData.metadata.keyLessons.length < 5) {
      handleMetadataChange('keyLessons', [...storyData.metadata.keyLessons, '']);
    }
  };

  const updateKeyLesson = (idx, val) => {
    const list = [...storyData.metadata.keyLessons];
    list[idx] = val;
    handleMetadataChange('keyLessons', list);
  };

  const removeKeyLesson = (idx) =>
    handleMetadataChange('keyLessons', storyData.metadata.keyLessons.filter((_, i) => i !== idx));

  const validateForm = () => {
    if (storyData.title.length < 10) { warn('Title needs at least 10 characters'); return false; }
    if (storyData.content.length < 100) { warn('Story needs at least 100 characters'); return false; }
    if (!storyData.category) { warn('Please select a category'); return false; }
    if (!storyData.metadata.recoveryTime) { warn('Recovery time is required'); return false; }
    if (!storyData.metadata.currentStatus) { warn('Current status is required'); return false; }
    return true;
    function warn(msg) { setSnackbar({ open: true, message: msg, severity: 'warning' }); }
  };

  const handleSubmit = async (asDraft = false) => {
    if (!validateForm() && !asDraft) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
      if (!token) throw new Error('loginRequired');

      const m = storyData.metadata;
      const cleanMeta = {};
      cleanMeta.recoveryTime = m.recoveryTime.trim();
      cleanMeta.currentStatus = m.currentStatus.trim();
      const lessons = m.keyLessons.filter(l => l && l.trim());
      if (lessons.length) cleanMeta.keyLessons = lessons;
      if (readTime) cleanMeta.readTime = readTime;

      const payload = {
        title: storyData.title.trim(),
        content: storyData.content.trim(),
        category: storyData.category,
        tags: storyData.tags.slice(0, 5),
        metadata: cleanMeta,
        status: asDraft ? 'draft' : 'published'
      };

      const res = await fetch('http://localhost:5000/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.message || 'Failed to save');
        err.status = res.status;
        err.details = data.errors || [];
        throw err;
      }

      setSnackbar({
        open: true,
        message: data.message || (asDraft ? 'Story saved as draft!' : 'Story published successfully!'),
        severity: 'success'
      });

      resetForm();
      setTimeout(() => {
        navigate('/dashboard', {
          replace: true,
          state: { refresh: true }
        });
      }, 2000);

    } catch (err) {
      console.error('save error →', err);
      let msg = 'Failed to save story. Please try again.';
      if (err.message === 'loginRequired') {
        msg = 'Please login to create a story';
        setTimeout(() => navigate('/login'), 1500);
      } else if (err.status === 400 && err.details.length) {
        msg = err.details.map(e => `${e.field}: ${e.message}`).join(' • ');
      } else if (err.message.toLowerCase().includes('network')) {
        msg = 'Network error. Please check your connection.';
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setStoryData({
    title: '', content: '', category: '', tags: [],
    metadata: { recoveryTime: '', currentStatus: '', keyLessons: [''] }
  });

  if (initialLoading) {
    return (
      <BackgroundContainer>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: '#81c784', mb: 3 }} />
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
              Loading story editor...
            </Typography>
          </Box>
        </Container>
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer>
      {/* floating particles */}
      {[...Array(6)].map((_, i) => (
        <FloatingParticle
          key={i}
          delay={i * 0.5}
          size={8 + Math.random() * 4}
          left={Math.random() * 100}
          top={Math.random() * 100}
        />
      ))}

      <Container maxWidth="xl">
        {/* header */}
        <ElegantCard sx={{ mb: 6, textAlign: 'center' }}>
          <CardContent sx={{ py: 6 }}>
            <Typography
              variant="h2"
              sx={{
                background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 900,
                mb: 2
              }}
            >
              Share Your Story
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
                fontWeight: 500
              }}
            >
              Transform your experience into inspiration for others
            </Typography>

            <Stack direction={isMobile ? 'column' : 'row'} spacing={2} justifyContent="center">
              <ElegantButton
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
              >
                Go Back
              </ElegantButton>
              <ElegantButton
                variant="outlined"
                startIcon={<Preview />}
                onClick={() => setShowPreview(true)}
                disabled={!storyData.title || !storyData.content}
              >
                Preview
              </ElegantButton>
            </Stack>
          </CardContent>
        </ElegantCard>

        {/* main grid */}
        <Grid container spacing={4}>
          {/* form column */}
          <Grid item xs={12} lg={8}>
            <ElegantCard>
              <CardContent sx={{ p: 6 }}>
                {/* title */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
                    Story Title
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Create an engaging title for your story
                  </Typography>
                  <EnhancedTextField
                    fullWidth
                    placeholder="Enter your story title..."
                    value={storyData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    helperText={`${storyData.title.length}/200 characters`}
                    error={storyData.title.length > 200}
                  />
                </Box>

                {/* category */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
                    Category
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Choose the category that best fits your story
                  </Typography>
                  <Grid container spacing={2}>
                    {categories.map((c) => (
                      <Grid item xs={12} sm={6} md={4} key={c.value}>
                        <CategoryChip
                          label={c.label}
                          icon={<c.icon />}
                          selected={storyData.category === c.value}
                          onClick={() => handleInputChange('category', c.value)}
                          sx={{ width: '100%', justifyContent: 'center' }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* content */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
                    Your Story
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Share your authentic journey
                  </Typography>
                  <EnhancedTextField
                    fullWidth
                    multiline
                    rows={12}
                    placeholder="Tell your story..."
                    value={storyData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    helperText={`${wordCount} words • ${readTime} min read`}
                  />
                </Box>

                {/* tags */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
                    Tags
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Add tags to help others find your story (max 5)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {storyData.tags.map((tag, i) => (
                      <Chip
                        key={i}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        deleteIcon={<Close />}
                        sx={{
                          background: 'linear-gradient(135deg,#81c784,#aed581)',
                          color: '#fff',
                          fontWeight: 600,
                          '&:hover': { background: 'linear-gradient(135deg,#66bb6a,#81c784)' }
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      disabled={storyData.tags.length >= 5}
                      variant="standard"
                      sx={{
                        flexGrow: 1,
                        '& .MuiInput-root': {
                          color: theme.palette.text.primary,
                        },
                        '& .MuiInput-underline:before': { display: 'none' },
                        '& .MuiInput-underline:after': { display: 'none' }
                      }}
                    />
                    <IconButton onClick={addTag} disabled={storyData.tags.length >= 5} sx={{ color: '#81c784' }}>
                      <Add />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                    Example: resilience, entrepreneurship, mental-health, career-change
                  </Typography>
                </Box>

                {/* Recovery Details */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
                    Recovery Details
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Help others understand your journey timeline and current progress
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <RequiredSelect fullWidth>
                        <InputLabel>Recovery Time *</InputLabel>
                        <Select
                          value={storyData.metadata.recoveryTime}
                          onChange={(e) => handleMetadataChange('recoveryTime', e.target.value)}
                          label="Recovery Time *"
                          required
                        >
                          {recoveryTimeOptions.map(time => (
                            <MenuItem key={time} value={time}>{time}</MenuItem>
                          ))}
                        </Select>
                      </RequiredSelect>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <RequiredSelect fullWidth>
                        <InputLabel>Current Status *</InputLabel>
                        <Select
                          value={storyData.metadata.currentStatus}
                          onChange={(e) => handleMetadataChange('currentStatus', e.target.value)}
                          label="Current Status *"
                          required
                        >
                          {currentStatusOptions.map(status => (
                            <MenuItem key={status} value={status}>
                              {status.replace('_', ' ').toUpperCase()}
                            </MenuItem>
                          ))}
                        </Select>
                      </RequiredSelect>
                    </Grid>
                  </Grid>
                </Box>

                {/* key lessons */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}>
                    Key Lessons (Optional - Max 5)
                  </Typography>
                  {storyData.metadata.keyLessons.map((lesson, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <EnhancedTextField
                        fullWidth
                        placeholder={`Lesson ${idx + 1}...`}
                        value={lesson}
                        onChange={(e) => updateKeyLesson(idx, e.target.value)}
                      />
                      <IconButton onClick={() => removeKeyLesson(idx)} sx={{ color: theme.palette.text.secondary }}>
                        <Close />
                      </IconButton>
                    </Box>
                  ))}
                  {storyData.metadata.keyLessons.length < 5 && (
                    <ElegantButton variant="outlined" startIcon={<Add />} onClick={addKeyLesson}>
                      Add Lesson
                    </ElegantButton>
                  )}
                </Box>

                {/* actions */}
                <Stack direction={isMobile ? 'column' : 'row'} spacing={3} sx={{ mt: 6 }}>
                  <ElegantButton
                    variant="outlined"
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    fullWidth={isMobile}
                  >
                    Save as Draft
                  </ElegantButton>
                  <ElegantButton
                    variant="primary"
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Create />}
                    onClick={() => handleSubmit(false)}
                    disabled={loading || progress < 85}
                    fullWidth={isMobile}
                  >
                    {loading ? 'Publishing...' : 'Publish Story'}
                  </ElegantButton>
                </Stack>
              </CardContent>
            </ElegantCard>
          </Grid>

          {/* sidebar */}
          <Grid item xs={12} lg={4}>
            <ProgressCard>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 3 }}>
                Progress
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ color: '#81c784', fontWeight: 900, mb: 1 }}>
                  {progress.toFixed(0)}%
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <CheckCircle sx={{ mr: 2, color: storyData.title.length >= 10 ? '#81c784' : '#e0e0e0' }} />
                  <ListItemText 
                    primary="Title (10+ characters)" 
                    sx={{ color: theme.palette.text.primary }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <CheckCircle sx={{ mr: 2, color: storyData.content.length >= 100 ? '#81c784' : '#e0e0e0' }} />
                  <ListItemText 
                    primary="Story content (100+ characters)" 
                    sx={{ color: theme.palette.text.primary }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <CheckCircle sx={{ mr: 2, color: storyData.category ? '#81c784' : '#e0e0e0' }} />
                  <ListItemText 
                    primary="Category selected" 
                    sx={{ color: theme.palette.text.primary }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <CheckCircle sx={{ mr: 2, color: storyData.tags.length > 0 ? '#81c784' : '#e0e0e0' }} />
                  <ListItemText 
                    primary="Tags added" 
                    sx={{ color: theme.palette.text.primary }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <CheckCircle sx={{ mr: 2, color: storyData.metadata.recoveryTime ? '#81c784' : '#e0e0e0' }} />
                  <ListItemText 
                    primary="Recovery time selected *" 
                    sx={{ color: theme.palette.text.primary }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <CheckCircle sx={{ mr: 2, color: storyData.metadata.currentStatus ? '#81c784' : '#e0e0e0' }} />
                  <ListItemText 
                    primary="Current status selected *" 
                    sx={{ color: theme.palette.text.primary }}
                  />
                </ListItem>
              </List>
            </ProgressCard>

            {/* tips card */}
            <ProgressCard sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 3 }}>
                <Lightbulb sx={{ mr: 1, color: '#ffb74d' }} />
                Writing Tips
              </Typography>
              <Box component="ul" sx={{ pl: 2, color: theme.palette.text.secondary }}>
                <li>Start with your challenge or setback</li>
                <li>Share your emotions and feelings</li>
                <li>Describe your journey to overcome it</li>
                <li>Share the lessons you learned</li>
                <li>Include your recovery timeline</li>
                <li>End with hope and encouragement</li>
              </Box>
            </ProgressCard>
          </Grid>
        </Grid>
      </Container>

      {/* preview dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: theme.palette.mode === 'light'
              ? 'rgba(255,255,255,.95)'
              : 'rgba(15,23,42,.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`
          }
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>Story Preview</DialogTitle>
        <DialogContent>
          {storyData.category && (
            <Chip
              label={categories.find(c => c.value === storyData.category)?.label}
              sx={{ mb: 2, background: '#81c784', color: '#fff' }}
            />
          )}
          <Typography variant="h4" sx={{ mb: 3, color: theme.palette.text.primary, fontWeight: 700 }}>
            {storyData.title || 'Your Story Title'}
          </Typography>

          {/* Recovery details in preview */}
          {(storyData.metadata.recoveryTime || storyData.metadata.currentStatus) && (
            <Box sx={{ mb: 3 }}>
              {storyData.metadata.recoveryTime && (
                <Chip
                  label={`Recovery: ${storyData.metadata.recoveryTime}`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              {storyData.metadata.currentStatus && (
                <Chip
                  label={`Status: ${storyData.metadata.currentStatus.replace('_', ' ')}`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
            </Box>
          )}

          <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.primary, lineHeight: 1.8 }}>
            {storyData.content || 'Your story content will appear here...'}
          </Typography>

          {storyData.tags.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                Tags:
              </Typography>
              {storyData.tags.map((t, i) => (
                <Chip key={i} label={t} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <ElegantButton variant="outlined" onClick={() => setShowPreview(false)}>
            Continue Editing
          </ElegantButton>
          <ElegantButton
            variant="primary"
            onClick={() => { setShowPreview(false); handleSubmit(false); }}
            disabled={loading || progress < 85}
          >
            Publish Story
          </ElegantButton>
        </DialogActions>
      </Dialog>

      {/* snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ borderRadius: 3, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </BackgroundContainer>
  );
}

export default CreateStory;
