import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Link, Alert,
  CircularProgress, Divider, IconButton, InputAdornment, Container,
  Fade, Slide, Chip, Stack, Avatar, useTheme, useMediaQuery
} from '@mui/material';
import {
  Visibility, VisibilityOff, Login as LoginIcon, AutoFixHigh,
  TrendingUp, Psychology, EmojiObjects, GroupWork, Star, ArrowForward
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';

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
    box-shadow: 0 0 15px rgba(139, 195, 74, 0.2), 0 0 30px rgba(139, 195, 74, 0.1);
  }
  50% {
    box-shadow: 0 0 25px rgba(139, 195, 74, 0.3), 0 0 40px rgba(139, 195, 74, 0.15);
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

const EnhancedGlassCard = styled(Paper)(({ theme, darkMode }) => ({
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
  padding: theme.spacing(6, 5),
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
  maxWidth: '580px',
  width: '100%',
  margin: '0 auto',
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
        rgba(174, 213, 129, 0.1),
        transparent
      )
    `,
    animation: `${subtleShimmer} 4s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #aed581, #b3e5fc, #ffb3ba, #c8e6c9)',
  }
}));

const StyledTextField = styled(TextField)(({ theme, darkMode }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    background: darkMode 
      ? 'rgba(30, 41, 59, 0.8)'
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    fontSize: '1.1rem',
    fontWeight: 500,
    minHeight: '60px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1.5px solid transparent',
    '& input': {
      padding: '18px 16px',
      color: darkMode ? '#ffffff' : '#000000',
    },
    '&:hover': {
      background: darkMode 
        ? 'rgba(30, 41, 59, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-1px)',
      boxShadow: darkMode
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.08)',
      borderColor: 'rgba(129, 199, 132, 0.3)'
    },
    '&.Mui-focused': {
      background: darkMode 
        ? 'rgba(30, 41, 59, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(129, 199, 132, 0.15)',
      borderColor: '#81c784',
      '& fieldset': {
        borderWidth: '2px'
      }
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: `0 0 0 1000px ${darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)'} inset !important`,
      WebkitTextFillColor: `${darkMode ? '#ffffff' : '#000000'} !important`,
      borderRadius: '16px !important'
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    fontSize: '1rem',
    color: darkMode ? '#b3b3b3' : '#666666',
    '&.Mui-focused': {
      color: '#81c784'
    }
  }
}));

const EnhancedButton = styled(Button)(({ variant: buttonVariant, darkMode }) => ({
  borderRadius: '16px',
  padding: '16px 40px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '56px',
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
    },
    '&:active': {
      transform: 'translateY(0px) scale(0.98)'
    }
  }),
  ...(buttonVariant === 'outlined' && {
    border: '2px solid',
    borderImage: 'linear-gradient(135deg, #81c784, #aed581, #90caf9) 1',
    background: darkMode 
      ? 'rgba(30, 41, 59, 0.1)'
      : 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    color: darkMode ? '#ffffff' : '#000000',
    '&:hover': {
      background: darkMode
        ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.2), rgba(144, 202, 249, 0.15))'
        : 'linear-gradient(135deg, rgba(129, 199, 132, 0.1), rgba(144, 202, 249, 0.1))',
      transform: 'translateY(-1px) scale(1.01)',
      boxShadow: '0 6px 20px rgba(129, 199, 132, 0.2)'
    }
  }),
  '&:disabled': {
    opacity: 0.6,
    transform: 'none'
  }
}));

const StatsDisplay = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr'
  }
}));

const StatCard = styled(Box)(({ theme, darkMode }) => ({
  textAlign: 'center',
  padding: theme.spacing(2.5),
  borderRadius: '12px',
  background: darkMode 
    ? 'rgba(30, 41, 59, 0.6)'
    : 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'blur(8px)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.3)',
  minHeight: '80px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    background: darkMode 
      ? 'rgba(30, 41, 59, 0.75)'
      : 'rgba(255, 255, 255, 0.75)',
    boxShadow: darkMode
      ? '0 6px 20px rgba(0, 0, 0, 0.3)'
      : '0 6px 20px rgba(0, 0, 0, 0.08)'
  }
}));

const Login = () => {
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { login } = useAuth();
  const darkMode = theme.palette.mode === 'dark';

  // 🎯 OPTIMIZED STATE
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🎯 MEMOIZED FEATURES
  const features = useMemo(() => [
    { icon: <Psychology />, text: 'Learn & Grow', color: '#81c784' },
    { icon: <GroupWork />, text: 'Share Wisdom', color: '#90caf9' },
    { icon: <EmojiObjects />, text: 'Get Insights', color: '#ffb74d' },
    { icon: <TrendingUp />, text: 'Community', color: '#f8bbd9' }
  ], []);

  // 🎯 MEMOIZED HANDLERS
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  }, [error]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, login, navigate]);

  const handleGuestAccess = useCallback(async () => {
    setLoading(true);
    try {
      navigate('/browse');
    } catch (error) {
      setError('Failed to create guest session');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <BackgroundContainer darkMode={darkMode}>
      {/* Soft Floating Particles */}
      {Array.from({ length: 8 }, (_, i) => (
        <FloatingParticle
          key={`particle-${i}`} // 🎯 STABLE KEYS
          delay={i * 0.7}
          size={10 + Math.random() * 6}
          left={Math.random() * 100}
          top={Math.random() * 100}
          darkMode={darkMode}
        />
      ))}

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <EnhancedGlassCard elevation={0} darkMode={darkMode}>
          {/* Brand Logo */}
          <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
            <AutoFixHigh sx={{
              fontSize: '4rem',
              background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${gentleFloat} 4s ease-in-out infinite, ${softGlow} 3s ease-in-out infinite alternate`,
              filter: 'drop-shadow(0 4px 8px rgba(129, 199, 132, 0.2))',
              mb: 2
            }} />
            <Typography
              variant="h2"
              sx={{
                fontSize: '3.2rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #81c784 0%, #aed581 25%, #90caf9 50%, #f8bbd9 75%, #b3e5fc 100%)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1.5,
                letterSpacing: '-0.02em',
                [muiTheme.breakpoints.down('sm')]: {
                  fontSize: '2.5rem'
                }
              }}
            >
              FailFixes
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: '1.25rem'
              }}
            >
              Welcome Back
            </Typography>
          </Box>

          {/* Feature Showcase */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 4
          }}>
            {features.map((feature, index) => (
              <Chip
                key={`feature-${index}`} // 🎯 STABLE KEYS
                icon={feature.icon}
                label={feature.text}
                sx={{
                  borderRadius: '16px',
                  background: darkMode
                    ? `linear-gradient(135deg, ${feature.color}30 0%, ${feature.color}20 100%)`
                    : `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  padding: '8px 12px',
                  border: `1px solid ${feature.color}40`,
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-1px) scale(1.02)',
                    boxShadow: `0 4px 12px ${feature.color}30`,
                    background: darkMode
                      ? `linear-gradient(135deg, ${feature.color}50 0%, ${feature.color}40 100%)`
                      : `linear-gradient(135deg, ${feature.color}40 0%, ${feature.color}30 100%)`
                  }
                }}
              />
            ))}
          </Box>

          {/* Stats Display */}
          <StatsDisplay>
            <StatCard darkMode={darkMode}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#81c784' }}>
                12K+
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                Stories
              </Typography>
            </StatCard>
            <StatCard darkMode={darkMode}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#90caf9' }}>
                95%
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                Growth
              </Typography>
            </StatCard>
            <StatCard darkMode={darkMode}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffb74d' }}>
                200+
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                Daily Tips
              </Typography>
            </StatCard>
          </StatsDisplay>

          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {/* Form Fields with STABLE KEYS */}
            <StyledTextField
              key="identifier-input" // 🎯 STABLE KEY
              fullWidth
              name="identifier"
              label="Email or Username"
              type="text"
              value={formData.identifier}
              onChange={handleChange}
              required
              autoFocus
              margin="normal"
              autoComplete="username"
              darkMode={darkMode}
            />

            <StyledTextField
              key="password-input" // 🎯 STABLE KEY
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              autoComplete="current-password"
              darkMode={darkMode}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: '#81c784',
                          backgroundColor: 'rgba(129, 199, 132, 0.1)'
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <EnhancedButton
              type="submit"
              fullWidth
              variant="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <LoginIcon />}
              endIcon={!loading && <ArrowForward />}
              darkMode={darkMode}
              sx={{ mb: 3 }}
            >
              {loading ? 'Signing In...' : 'Sign In to FailFixes'}
            </EnhancedButton>

            <EnhancedButton
              fullWidth
              variant="outlined"
              onClick={handleGuestAccess}
              disabled={loading}
              darkMode={darkMode}
              sx={{ mb: 4 }}
            >
              Browse as Guest Explorer
            </EnhancedButton>

            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                New to FailFixes?
              </Typography>
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/signup')}
                sx={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #81c784, #90caf9)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                Join Community →
              </Link>
            </Box>
          </form>
        </EnhancedGlassCard>
      </Container>
    </BackgroundContainer>
  );
};

export default Login;
