/* eslint-disable no-console */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Container, Typography, TextField, Button, Grid, Card, CardContent,
  Box, Chip, Paper, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Divider, IconButton,
  LinearProgress, Stack, useTheme, useMediaQuery,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Save, Preview, Close, Add, AutoFixHigh, Psychology,
  ArrowBack, CheckCircle, Business, FitnessCenter, FamilyRestroom,
  Computer, Palette, RocketLaunch, School, AccessTime, TrendingUp
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTheme as useAppTheme } from '../context/ThemeContext';

/* ── Keyframes (moved out, no visual change) ── */
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

/* ── Deterministic particles (same look every render) ── */
const PARTICLES = [
  { left: 12, top: 18, size: 14, delay: 0.0 },
  { left: 78, top: 22, size: 16, delay: 0.5 },
  { left: 8, top: 72, size: 18, delay: 1.0 },
  { left: 55, top: 65, size: 12, delay: 1.3 },
  { left: 38, top: 40, size: 10, delay: 1.6 },
  { left: 88, top: 82, size: 15, delay: 2.0 }
];

/* ── Styled components (moved out; props-only change) ── */
const BackgroundContainer = styled(Box)(({ theme, darkMode }) => ({
  minHeight: '100vh',
  background: darkMode
    ? `
      radial-gradient(circle at 20% 20%, rgba(174,213,129,.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255,183,195,.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(179,229,252,.1) 0%, transparent 50%),
      linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)
    `
    : `
      radial-gradient(circle at 20% 20%, rgba(174,213,129,.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255,183,195,.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(179,229,252,.15) 0%, transparent 50%),
      linear-gradient(135deg,#f8f9ff 0%,#f0f4ff 25%,#fef7f0 50%,#f0fff4 75%,#f5f8ff 100%)
    `,
  position: 'relative',
  overflow: 'hidden',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  '::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: darkMode
      ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e8f5e8' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: 'none'
  }
}));

const FloatingParticle = styled(Box)(({ darkMode, delay }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: darkMode
    ? 'linear-gradient(135deg,rgba(174,213,129,.1),rgba(179,229,252,.08))'
    : 'linear-gradient(135deg,rgba(174,213,129,.2),rgba(179,229,252,.15))',
  animation: `${softParticle} ${4 + Math.random() * 0}px ease-in-out infinite`, // duration constantized below via style
  animationDelay: `${delay}s`,
  backdropFilter: 'blur(1px)'
}));

const ElegantCard = styled(Card)(({ theme, darkMode }) => ({
  background: darkMode
    ? `linear-gradient(135deg,rgba(30,41,59,.85)0%,rgba(15,23,42,.75)50%,rgba(30,41,59,.65)100%)`
    : `linear-gradient(135deg,rgba(255,255,255,.85)0%,rgba(255,255,255,.75)50%,rgba(255,255,255,.65)100%)`,
  backdropFilter: 'blur(20px) saturate(120%)',
  border: darkMode ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(255,255,255,.3)',
  borderRadius: 24,
  overflow: 'hidden',
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    left: '-100%',
    background: `linear-gradient(90deg,transparent,rgba(129,199,132,.1),transparent)`,
    animation: `${subtleShimmer} 6s ease-in-out infinite`
  },
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    background: 'linear-gradient(90deg,#81c784,#aed581,#90caf9,#f8bbd9)',
    borderRadius: '24px 24px 0 0'
  }
}));

const EnhancedTextField = styled(TextField)(({ theme, darkMode }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    background: darkMode ? 'rgba(30,41,59,.8)' : 'rgba(255,255,255,.8)',
    backdropFilter: 'blur(8px)',
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'all .3s ease',
    '&:hover': {
      background: darkMode ? 'rgba(30,41,59,.9)' : 'rgba(255,255,255,.9)',
      transform: 'translateY(-1px)',
      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,.3)' : '0 4px 12px rgba(0,0,0,.08)'
    },
    '&.Mui-focused': {
      background: darkMode ? 'rgba(30,41,59,.95)' : 'rgba(255,255,255,.95)',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(129,199,132,.15)',
      borderColor: '#81c784'
    }
  }
}));

const ElegantButton = styled(Button)(({ variant: buttonVariant, darkMode }) => ({
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
    background: darkMode ? 'rgba(30,41,59,.1)' : 'rgba(255,255,255,.1)',
    backdropFilter: 'blur(8px)'
  })
}));

const CategoryChip = styled(Chip)(({ theme, darkMode, selected }) => ({
  borderRadius: 16,
  padding: '16px 12px',
  fontSize: '.9rem',
  fontWeight: 600,
  minHeight: 70,
  cursor: 'pointer',
  transition: 'all .3s ease',
  background: selected
    ? 'linear-gradient(135deg,#81c784 0%,#aed581 100%)'
    : darkMode ? 'rgba(30,41,59,.7)' : 'rgba(255,255,255,.7)',
  color: selected ? '#fff' : theme.palette.text.primary,
  border: selected ? 'none' : (darkMode ? '1px solid rgba(129,199,132,.2)' : '1px solid rgba(129,199,132,.3)'),
  backdropFilter: 'blur(8px)'
}));

const ProgressCard = styled(Paper)(({ theme, darkMode }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  background: darkMode ? 'rgba(30,41,59,.8)' : 'rgba(255,255,255,.8)',
  backdropFilter: 'blur(12px)',
  border: darkMode ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(255,255,255,.3)',
  position: 'sticky',
  top: 100
}));

const RequiredSelect = styled(FormControl)(({ theme, darkMode }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    background: darkMode ? 'rgba(30,41,59,.8)' : 'rgba(255,255,255,.8)',
    backdropFilter: 'blur(8px)'
  }
}));

/* ── Static data (unchanged) ── */
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

function CreateStory() {
  const { theme } = useAppTheme();
  const darkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [storyData, setStoryData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    metadata: { recoveryTime: '', currentStatus: '', keyLessons: [''] }
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  /* Derived values (memoized) */
  const wordCount = useMemo(
    () => storyData.content.trim().split(/\s+/).filter(Boolean).length,
    [storyData.content]
  );
  const readTime = useMemo(
    () => Math.max(1, Math.ceil(wordCount / 200)),
    [wordCount]
  );
  const progress = useMemo(() => {
    const parts = [
      storyData.title.length >= 10,
      storyData.content.length >= 100,
      !!storyData.category,
      storyData.tags.length > 0,
      !!storyData.metadata.recoveryTime,
      !!storyData.metadata.currentStatus
    ];
    return (parts.filter(Boolean).length / 6) * 100;
  }, [storyData]);

  /* Handlers (memoized) */
  const handleInputChange = useCallback((field, value) => {
    setStoryData(prev => ({ ...prev, [field]: value }));
  }, []);
  const handleMetadataChange = useCallback((field, value) => {
    setStoryData(prev => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }));
  }, []);
  const addTag = useCallback(() => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !storyData.tags.includes(tag) && storyData.tags.length < 5) {
      setStoryData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag('');
    }
  }, [newTag, storyData.tags]);
  const removeTag = useCallback((t) => {
    setStoryData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== t) }));
  }, []);
  const addKeyLesson = useCallback(() => {
    if (storyData.metadata.keyLessons.length < 5) {
      handleMetadataChange('keyLessons', [...storyData.metadata.keyLessons, '']);
    }
  }, [storyData.metadata.keyLessons, handleMetadataChange]);
  const updateKeyLesson = useCallback((idx, val) => {
    const list = [...storyData.metadata.keyLessons];
    list[idx] = val;
    handleMetadataChange('keyLessons', list);
  }, [storyData.metadata.keyLessons, handleMetadataChange]);
  const removeKeyLesson = useCallback((idx) => {
    handleMetadataChange('keyLessons', storyData.metadata.keyLessons.filter((_, i) => i !== idx));
  }, [storyData.metadata.keyLessons, handleMetadataChange]);

  const validateForm = useCallback(() => {
    const warn = (msg) => setSnackbar({ open: true, message: msg, severity: 'warning' });
    if (storyData.title.length < 10) { warn('Title needs at least 10 characters'); return false; }
    if (storyData.content.length < 100) { warn('Story needs at least 100 characters'); return false; }
    if (!storyData.category) { warn('Please select a category'); return false; }
    if (!storyData.metadata.recoveryTime) { warn('Recovery time is required'); return false; }
    if (!storyData.metadata.currentStatus) { warn('Current status is required'); return false; }
    return true;
  }, [storyData]);

  const resetForm = useCallback(() => {
    setStoryData({
      title: '', content: '', category: '', tags: [],
      metadata: { recoveryTime: '', currentStatus: '', keyLessons: [''] }
    });
    setNewTag('');
  }, []);

  const handleSubmit = useCallback(async (asDraft = false) => {
    if (!validateForm() && !asDraft) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('ff_token');
      if (!token) throw new Error('loginRequired');

      const m = storyData.metadata;
      const cleanMeta = {};
      if (m.recoveryTime) cleanMeta.recoveryTime = m.recoveryTime.trim();
      if (m.currentStatus) cleanMeta.currentStatus = m.currentStatus.trim();
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
        navigate('/dashboard', { replace: true, state: { refresh: true } });
      }, 1200);
    } catch (err) {
      let msg = 'Failed to save story. Please try again.';
      if (err.message === 'loginRequired') {
        msg = 'Please login to create a story';
        setTimeout(() => navigate('/login'), 1000);
      } else if (err.status === 400 && err.details?.length) {
        msg = err.details.map(e => `${e.field}: ${e.message}`).join(' • ');
      } else if (String(err.message || '').toLowerCase().includes('network')) {
        msg = 'Network error. Please check your connection.';
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [storyData, readTime, validateForm, navigate, resetForm]);

  const dark = darkMode;

  return (
    <BackgroundContainer darkMode={dark}>
      {/* Floating Elements (deterministic positions to preserve look) */}
      {PARTICLES.map((p, i) => (
        <FloatingParticle
          key={`fp-${i}`}
          darkMode={dark}
          delay={p.delay}
          sx={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDuration: '5.5s'
          }}
        />
      ))}

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Left form column */}
          <Grid item xs={12} md={8}>
            <ElegantCard darkMode={dark}>
              <CardContent sx={{ p: 4 }}>
                {/* Story Title */}
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                  Story Title
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: muiTheme.palette.text.secondary }}>
                  Create an engaging title for your story
                </Typography>
                <EnhancedTextField
                  fullWidth
                  darkMode={dark}
                  placeholder="Enter your story title..."
                  inputProps={{ maxLength: 200 }}
                  value={storyData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  helperText={`${storyData.title.length}/200 characters`}
                  error={storyData.title.length > 200}
                />

                {/* Category */}
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 2, mb: 1 }}>
                  Category
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: muiTheme.palette.text.secondary }}>
                  Choose the category that best fits your story
                </Typography>

                {/* Two columns like screenshot */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {categories.map((c) => {
                    const Icon = c.icon;
                    return (
                      <Grid key={c.value} item xs={12} md={6}>
                        <CategoryChip
                          darkMode={dark}
                          selected={storyData.category === c.value}
                          onClick={() => handleInputChange('category', c.value)}
                          label={c.label}
                          icon={<Icon sx={{ color: c.color }} />}
                          sx={{ width: '100%', justifyContent: 'flex-start', px: 2 }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Story content */}
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 2, mb: 1 }}>
                  Your Story
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: muiTheme.palette.text.secondary }}>
                  Share your authentic journey
                </Typography>
                <EnhancedTextField
                  fullWidth
                  darkMode={dark}
                  multiline
                  minRows={8}
                  placeholder="Write your story here..."
                  value={storyData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  helperText={`${wordCount} words • ${readTime} min read`}
                />

                {/* Tags */}
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 2, mb: 1 }}>
                  Tags
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: muiTheme.palette.text.secondary }}>
                  Add tags to help others find your story (max 5)
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 1.5 }}>
                  {storyData.tags.map((tag, i) => (
                    <Chip
                      key={`tag-${tag}-${i}`}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<Close />}
                      sx={{
                        background: 'linear-gradient(135deg,#81c784,#aed581)',
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <TextField
                    variant="outlined"
                    placeholder="Add tag (press Enter)"
                    size="small"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    disabled={storyData.tags.length >= 5 || !newTag.trim()}
                    onClick={addTag}
                    sx={{ color: '#81c784', fontWeight: 700, textTransform: 'none' }}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>

                {/* Recovery details */}
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 2, mb: 1 }}>
                  Recovery Details
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: muiTheme.palette.text.secondary }}>
                  Help others understand your journey timeline and current progress
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <RequiredSelect fullWidth darkMode={dark}>
                      <InputLabel>Recovery Time *</InputLabel>
                      <Select
                        label="Recovery Time *"
                        value={storyData.metadata.recoveryTime}
                        onChange={(e) => handleMetadataChange('recoveryTime', e.target.value)}
                      >
                        {recoveryTimeOptions.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </Select>
                    </RequiredSelect>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RequiredSelect fullWidth darkMode={dark}>
                      <InputLabel>Current Status *</InputLabel>
                      <Select
                        label="Current Status *"
                        value={storyData.metadata.currentStatus}
                        onChange={(e) => handleMetadataChange('currentStatus', e.target.value)}
                      >
                        {currentStatusOptions.map((s) => (
                          <MenuItem key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</MenuItem>
                        ))}
                      </Select>
                    </RequiredSelect>
                  </Grid>
                </Grid>

                {/* Actions */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <ElegantButton
                      fullWidth={isMobile}
                      variant="outlined"
                      startIcon={<Save />}
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                      darkMode={dark}
                    >
                      Save as Draft
                    </ElegantButton>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <ElegantButton
                      fullWidth={isMobile}
                      variant="primary"
                      endIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <RocketLaunch />}
                      onClick={() => handleSubmit(false)}
                      disabled={loading || progress < 85}
                      darkMode={dark}
                    >
                      {loading ? 'Publishing...' : 'Publish Story'}
                    </ElegantButton>
                  </Grid>
                </Grid>
              </CardContent>
            </ElegantCard>
          </Grid>

          {/* Right progress column (matches screenshot) */}
          <Grid item xs={12} md={4}>
            <ProgressCard darkMode={dark}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
                Progress
              </Typography>

              <Typography variant="h4" sx={{ fontWeight: 900, color: '#67c684' }}>
                {progress.toFixed(0)}%
              </Typography>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 999,
                  my: 2,
                  '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#81c784,#aed581)' }
                }}
              />

              <Stack spacing={1.5} sx={{ color: muiTheme.palette.text.secondary, mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle sx={{ color: storyData.title.length >= 10 ? '#81c784' : '#e0e0e0' }} />
                  <Typography>Title (10+ characters)</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle sx={{ color: storyData.content.length >= 100 ? '#81c784' : '#e0e0e0' }} />
                  <Typography>Story content (100+ characters)</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle sx={{ color: storyData.category ? '#81c784' : '#e0e0e0' }} />
                  <Typography>Category selected</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle sx={{ color: storyData.tags.length > 0 ? '#81c784' : '#e0e0e0' }} />
                  <Typography>Tags added</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle sx={{ color: storyData.metadata.recoveryTime ? '#81c784' : '#e0e0e0' }} />
                  <Typography>Recovery time selected *</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle sx={{ color: storyData.metadata.currentStatus ? '#81c784' : '#e0e0e0' }} />
                  <Typography>Current status selected *</Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                Writing Tips
              </Typography>
              <Stack spacing={1} sx={{ color: muiTheme.palette.text.secondary }}>
                <Typography>• Start with your challenge or setback</Typography>
                <Typography>• Share your emotions and feelings</Typography>
                <Typography>• Describe your journey to overcome it</Typography>
                <Typography>• Share the lessons you learned</Typography>
                <Typography>• Include your recovery timeline</Typography>
                <Typography>• End with hope and encouragement</Typography>
              </Stack>
            </ProgressCard>
          </Grid>
        </Grid>
      </Container>

      {/* Preview Dialog and Snackbar identical to prior behavior */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: dark ? 'rgba(15,23,42,.95)' : 'rgba(255,255,255,.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Story Preview
          <IconButton onClick={() => setShowPreview(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {storyData.category && (
            <Chip
              label={categories.find(c => c.value === storyData.category)?.label}
              sx={{ mb: 2, background: '#81c784', color: '#fff', fontWeight: 700 }}
            />
          )}
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
            {storyData.title || 'Your Story Title'}
          </Typography>
          {(storyData.metadata.recoveryTime || storyData.metadata.currentStatus) && (
            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
              {storyData.metadata.recoveryTime && (
                <Chip icon={<AccessTime />} label={`Recovery: ${storyData.metadata.recoveryTime}`} />
              )}
              {storyData.metadata.currentStatus && (
                <Chip icon={<TrendingUp />} label={`Status: ${storyData.metadata.currentStatus.replace('_', ' ').toUpperCase()}`} />
              )}
              <Chip label={`${readTime} min read`} />
            </Stack>
          )}
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
            {storyData.content || 'Your story content will appear here...'}
          </Typography>
          {storyData.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags:</Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {storyData.tags.map((t, i) => (
                  <Chip key={`pv-tag-${t}-${i}`} label={t} />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <ElegantButton variant="outlined" onClick={() => setShowPreview(false)} darkMode={dark}>
            Continue Editing
          </ElegantButton>
          <ElegantButton
            variant="primary"
            onClick={() => { setShowPreview(false); handleSubmit(false); }}
            disabled={loading || progress < 85}
            darkMode={dark}
          >
            Publish Story
          </ElegantButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
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
