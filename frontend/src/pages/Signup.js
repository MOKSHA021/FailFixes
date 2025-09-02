import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Link, Alert,
  CircularProgress, FormControlLabel, Checkbox, IconButton,
  InputAdornment, Container, Fade, Slide, Chip, Stack, Avatar,
  LinearProgress, useTheme, useMediaQuery
} from '@mui/material';
import {
  Visibility, VisibilityOff, PersonAdd, Email, Person, Security,
  AutoFixHigh, CheckCircle, Groups, Psychology, TrendingUp,
  Verified, Shield, ArrowForward, Star
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import axios from 'axios';

// 🎯 MOVED ANIMATIONS OUTSIDE COMPONENT
const softPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(174, 213, 129, 0.2), 0 0 30px rgba(174, 213, 129, 0.1);
  }
  50% {
    box-shadow: 0 0 20px rgba(174, 213, 129, 0.3), 0 0 40px rgba(174, 213, 129, 0.15);
  }
`;

const gentleSlide = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const softMorph = keyframes`
  0%, 100% {
    border-radius: 50% 50% 50% 50%;
    transform: rotate(0deg) scale(1);
  }
  50% {
    border-radius: 60% 40% 60% 40%;
    transform: rotate(180deg) scale(1.05);
  }
`;

const lightGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 🎯 MOVED ALL STYLED COMPONENTS OUTSIDE
const BackgroundContainer = styled(Box)(({ theme, darkMode }) => ({
  minHeight: '100vh',
  background: darkMode 
    ? `
      radial-gradient(circle at 25% 25%, rgba(174, 213, 129, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 183, 195, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(179, 229, 252, 0.08) 0%, transparent 50%),
      linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)
    `
    : `
      radial-gradient(circle at 25% 25%, rgba(174, 213, 129, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 183, 195, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(179, 229, 252, 0.12) 0%, transparent 50%),
      linear-gradient(135deg, #fafbfc 0%, #f0f5ff 25%, #fef9f0 50%, #f0fff6 75%, #f7faff 100%)
    `,
  backgroundSize: '300% 300%',
  animation: `${lightGradient} 12s ease infinite`,
  position: 'relative',
  overflow: 'hidden',
}));

const FloatingElement = styled(Box)(({ delay, size, left, top, duration, darkMode }) => ({
  position: 'absolute',
  left: `${left}%`,
  top: `${top}%`,
  width: `${size}px`,
  height: `${size}px`,
  background: darkMode
    ? 'linear-gradient(135deg, rgba(174, 213, 129, 0.1), rgba(179, 229, 252, 0.08))'
    : 'linear-gradient(135deg, rgba(174, 213, 129, 0.15), rgba(179, 229, 252, 0.1))',
  animation: `${softMorph} ${duration}s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  backdropFilter: 'blur(2px)',
  border: darkMode 
    ? '1px solid rgba(174, 213, 129, 0.05)'
    : '1px solid rgba(174, 213, 129, 0.1)'
}));

const EnhancedSignupCard = styled(Paper)(({ theme, darkMode }) => ({
  background: darkMode
    ? `
      linear-gradient(135deg,
        rgba(30, 41, 59, 0.9) 0%,
        rgba(15, 23, 42, 0.8) 50%,
        rgba(30, 41, 59, 0.75) 100%
      )
    `
    : `
      linear-gradient(135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 255, 255, 0.8) 50%,
        rgba(255, 255, 255, 0.75) 100%
      )
    `,
  backdropFilter: 'blur(25px) saturate(130%)',
  WebkitBackdropFilter: 'blur(25px) saturate(130%)',
  border: darkMode 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '24px',
  padding: theme.spacing(5, 4.5),
  position: 'relative',
  overflow: 'hidden',
  animation: `${gentleSlide} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
  boxShadow: darkMode
    ? `
      0 12px 40px rgba(0, 0, 0, 0.3),
      0 6px 20px rgba(0, 0, 0, 0.2)
    `
    : `
      0 12px 40px rgba(0, 0, 0, 0.06),
      0 6px 20px rgba(0, 0, 0, 0.03),
      inset 0 1px 0 rgba(255, 255, 255, 0.4)
    `,
  maxWidth: '620px',
  width: '100%',
  margin: '0 auto',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #aed581, #b3e5fc, #ffb3ba, #c8e6c9, #dcedc8)',
    backgroundSize: '300% 300%',
    animation: `${lightGradient} 4s ease infinite`
  }
}));

const StyledTextField = styled(TextField)(({ theme, darkMode }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    background: darkMode 
      ? 'rgba(30, 41, 59, 0.85)'
      : 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    fontSize: '1.05rem',
    fontWeight: 500,
    minHeight: '58px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1.5px solid transparent',
    '& input': {
      padding: '16px 12px',
      color: darkMode ? '#ffffff' : '#000000',
    },
    '&:hover': {
      background: darkMode 
        ? 'rgba(30, 41, 59, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-1px)',
      boxShadow: darkMode
        ? '0 4px 15px rgba(0, 0, 0, 0.3)'
        : '0 4px 15px rgba(0, 0, 0, 0.06)',
      borderColor: 'rgba(174, 213, 129, 0.3)'
    },
    '&.Mui-focused': {
      background: darkMode 
        ? 'rgba(30, 41, 59, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(174, 213, 129, 0.12)',
      borderColor: '#aed581',
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    fontSize: '1rem',
    color: darkMode ? '#b3b3b3' : '#666666',
    '&.Mui-focused': {
      color: '#aed581'
    }
  }
}));

const Signup = () => {
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const darkMode = theme.palette.mode === 'dark';

  // 🎯 OPTIMIZED STATE - SINGLE STATE OBJECT
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    allowAnonymous: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🎯 MEMOIZED CALCULATIONS TO PREVENT RE-RENDERS
  const passwordStrength = useMemo(() => {
    let strength = 0;
    const password = formData.password;
    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/) || password.match(/[^a-zA-Z0-9]+/)) strength += 25;
    return strength;
  }, [formData.password]);

  const formProgress = useMemo(() => {
    const fields = ['email', 'username', 'password', 'confirmPassword'];
    const filledFields = fields.filter(field => formData[field].trim() !== '').length;
    return (filledFields / fields.length) * 100;
  }, [formData.email, formData.username, formData.password, formData.confirmPassword]);

  // 🎯 OPTIMIZED CHANGE HANDLER - SINGLE FUNCTION
  const handleInputChange = useCallback((event) => {
    const { name, value, checked, type } = event.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  }, [errors]);

  // 🎯 MEMOIZED FEATURES TO PREVENT RE-CREATION
  const features = useMemo(() => [
    { icon: <Groups />, text: 'Share & Learn', color: '#81c784' },
    { icon: <Psychology />, text: 'Join Community', color: '#90caf9' },
    { icon: <Shield />, text: 'Privacy First', color: '#ffb74d' },
    { icon: <TrendingUp />, text: 'Growth Tools', color: '#f8bbd9' }
  ], []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName || formData.username,
        allowAnonymous: formData.allowAnonymous
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.param] = err.msg;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, navigate]);

  return (
    <BackgroundContainer darkMode={darkMode}>
      {/* Floating Elements */}
      {Array.from({ length: 6 }, (_, i) => (
        <FloatingElement
          key={`floating-${i}`} // 🎯 STABLE KEYS
          delay={i * 0.8}
          size={12 + Math.random() * 8}
          left={Math.random() * 100}
          top={Math.random() * 100}
          duration={8 + Math.random() * 4}
          darkMode={darkMode}
        />
      ))}

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <EnhancedSignupCard elevation={0} darkMode={darkMode}>
          {/* Brand Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AutoFixHigh sx={{
              fontSize: '4.2rem',
              background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }} />
            <Typography
              variant="h2"
              sx={{
                fontSize: '3.5rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #81c784 0%, #aed581 25%, #90caf9 50%, #f8bbd9 75%, #b3e5fc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1.5,
                [muiTheme.breakpoints.down('sm')]: {
                  fontSize: '2.8rem'
                }
              }}
            >
              Join FailFixes
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: '1.25rem'
              }}
            >
              Start Your Growth Journey
            </Typography>
          </Box>

          {/* Welcome Section */}
          <Box sx={{
            background: darkMode
              ? 'linear-gradient(135deg, rgba(174, 213, 129, 0.15), rgba(179, 229, 252, 0.15))'
              : 'linear-gradient(135deg, rgba(174, 213, 129, 0.08), rgba(179, 229, 252, 0.08))',
            borderRadius: '16px',
            p: 3.5,
            mb: 4,
            border: darkMode 
              ? '1px solid rgba(174, 213, 129, 0.3)'
              : '1px solid rgba(174, 213, 129, 0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              mb: 1,
              color: theme.palette.text.primary,
              textAlign: 'center'
            }}>
              🚀 Join 25,000+ Growth Seekers
            </Typography>
            <Typography variant="body1" sx={{
              color: theme.palette.text.secondary,
              mb: 2,
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              Transform setbacks into comebacks with our supportive community.
            </Typography>
            
            {/* Feature Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
              mt: 2,
              [muiTheme.breakpoints.down('sm')]: {
                gridTemplateColumns: '1fr'
              }
            }}>
              {features.map((feature, index) => (
                <Box
                  key={`feature-${index}`} // 🎯 STABLE KEYS
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    background: darkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.6)',
                    border: darkMode 
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: darkMode
                        ? '0 4px 15px rgba(0, 0, 0, 0.3)'
                        : '0 4px 15px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  {React.cloneElement(feature.icon, { sx: { color: feature.color, fontSize: '1.25rem' } })}
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            {/* Progress Indicator */}
            <LinearProgress 
              variant="determinate" 
              value={formProgress}
              sx={{ 
                mb: 3,
                height: '8px',
                borderRadius: '4px',
                backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #81c784, #aed581)',
                  borderRadius: '4px'
                }
              }}
            />
            
            {errors.general && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {errors.general}
              </Alert>
            )}

            {/* Form Fields with STABLE KEYS */}
            <StyledTextField
              key="email-field" // 🎯 STABLE KEY
              fullWidth
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              darkMode={darkMode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              key="username-field" // 🎯 STABLE KEY
              fullWidth
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleInputChange}
              error={!!errors.username}
              helperText={errors.username}
              darkMode={darkMode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              key="password-field" // 🎯 STABLE KEY
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              darkMode={darkMode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
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

            <StyledTextField
              key="confirm-password-field" // 🎯 STABLE KEY
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              darkMode={darkMode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: '#81c784',
                          backgroundColor: 'rgba(129, 199, 132, 0.1)'
                        }
                      }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="allowAnonymous"
                  checked={formData.allowAnonymous}
                  onChange={handleInputChange}
                  sx={{
                    color: '#81c784',
                    '&.Mui-checked': { color: '#81c784' }
                  }}
                />
              }
              label={
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: '0.9rem' }}>
                  Enable anonymous sharing for privacy
                </Typography>
              }
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PersonAdd />}
              endIcon={!loading && <ArrowForward />}
              sx={{
                mb: 4,
                borderRadius: '14px',
                padding: '18px 44px',
                fontSize: '1.1rem',
                fontWeight: 700,
                textTransform: 'none',
                minHeight: '58px',
                background: 'linear-gradient(135deg, #81c784 0%, #aed581 50%, #90caf9 100%)',
                backgroundSize: '150% 150%',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.25)',
                '&:hover': {
                  backgroundPosition: 'right center',
                  transform: 'translateY(-2px) scale(1.01)',
                  boxShadow: '0 10px 30px rgba(129, 199, 132, 0.35)'
                },
                '&:disabled': {
                  opacity: 0.6,
                  transform: 'none'
                }
              }}
            >
              {loading ? 'Creating Your Account...' : 'Start My Journey'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Already have an account?
              </Typography>
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/login')}
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
                Sign In →
              </Link>
            </Box>
          </form>
        </EnhancedSignupCard>
      </Container>
    </BackgroundContainer>
  );
};

export default Signup;
