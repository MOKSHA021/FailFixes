import React, { useState, useEffect } from 'react';
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

// Gentle Animations
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

const Signup = () => {
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
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
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formProgress, setFormProgress] = useState(0);

  // Theme-aware styled components (inside component to access theme)
  const BackgroundContainer = styled(Box)(() => ({
    minHeight: '100vh',
    background: theme.palette.mode === 'light' 
      ? `
        radial-gradient(circle at 25% 25%, rgba(174, 213, 129, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255, 183, 195, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(179, 229, 252, 0.12) 0%, transparent 50%),
        linear-gradient(135deg, #fafbfc 0%, #f0f5ff 25%, #fef9f0 50%, #f0fff6 75%, #f7faff 100%)
      `
      : `
        radial-gradient(circle at 25% 25%, rgba(174, 213, 129, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255, 183, 195, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(179, 229, 252, 0.08) 0%, transparent 50%),
        linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)
      `,
    backgroundSize: '300% 300%',
    animation: `${lightGradient} 12s ease infinite`,
    position: 'relative',
    overflow: 'hidden',
  }));

  const FloatingElement = styled(Box)(({ delay, size, left, top, duration }) => ({
    position: 'absolute',
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, rgba(174, 213, 129, 0.15), rgba(179, 229, 252, 0.1))'
      : 'linear-gradient(135deg, rgba(174, 213, 129, 0.1), rgba(179, 229, 252, 0.08))',
    animation: `${softMorph} ${duration}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    backdropFilter: 'blur(2px)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(174, 213, 129, 0.1)' : 'rgba(174, 213, 129, 0.05)'}`
  }));

  const EnhancedSignupCard = styled(Paper)(() => ({
    background: theme.palette.mode === 'light'
      ? `
        linear-gradient(135deg,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(255, 255, 255, 0.8) 50%,
          rgba(255, 255, 255, 0.75) 100%
        )
      `
      : `
        linear-gradient(135deg,
          rgba(30, 41, 59, 0.9) 0%,
          rgba(15, 23, 42, 0.8) 50%,
          rgba(30, 41, 59, 0.75) 100%
        )
      `,
    backdropFilter: 'blur(25px) saturate(130%)',
    WebkitBackdropFilter: 'blur(25px) saturate(130%)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '24px',
    padding: theme.spacing(5, 4.5),
    position: 'relative',
    overflow: 'hidden',
    animation: `${gentleSlide} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
    boxShadow: theme.palette.mode === 'light'
      ? `
        0 12px 40px rgba(0, 0, 0, 0.06),
        0 6px 20px rgba(0, 0, 0, 0.03),
        inset 0 1px 0 rgba(255, 255, 255, 0.4)
      `
      : `
        0 12px 40px rgba(0, 0, 0, 0.3),
        0 6px 20px rgba(0, 0, 0, 0.2)
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

  const BrandHeader = styled(Box)(() => ({
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  }));

  const LogoIcon = styled(AutoFixHigh)(() => ({
    fontSize: '4.2rem',
    background: 'linear-gradient(135deg, #81c784, #aed581, #90caf9)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `${softPulse} 3s ease-in-out infinite alternate`,
    filter: 'drop-shadow(0 4px 8px rgba(129, 199, 132, 0.2))',
    marginBottom: theme.spacing(2)
  }));

  const BrandTitle = styled(Typography)(() => ({
    fontSize: '3.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #81c784 0%, #aed581 25%, #90caf9 50%, #f8bbd9 75%, #b3e5fc 100%)',
    backgroundSize: '300% 300%',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `${lightGradient} 6s ease infinite`,
    marginBottom: theme.spacing(1.5),
    letterSpacing: '-0.03em',
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.8rem'
    }
  }));

  const WelcomeSection = styled(Box)(() => ({
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, rgba(174, 213, 129, 0.08), rgba(179, 229, 252, 0.08))'
      : 'linear-gradient(135deg, rgba(174, 213, 129, 0.15), rgba(179, 229, 252, 0.15))',
    borderRadius: '16px',
    padding: theme.spacing(3.5),
    marginBottom: theme.spacing(4),
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(174, 213, 129, 0.15)' : 'rgba(174, 213, 129, 0.3)'}`,
    backdropFilter: 'blur(10px)',
    position: 'relative',
  }));

  const FeatureGrid = styled(Box)(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  }));

  const FeatureItem = ({ icon, text, color, ...props }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        background: theme.palette.mode === 'light'
          ? 'rgba(255, 255, 255, 0.6)'
          : 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)'}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'light'
            ? '0 4px 15px rgba(0, 0, 0, 0.08)'
            : '0 4px 15px rgba(0, 0, 0, 0.3)'
        }
      }}
      {...props}
    >
      {React.cloneElement(icon, { sx: { color, fontSize: '1.25rem' } })}
      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
        {text}
      </Typography>
    </Box>
  );

  const EnhancedTextField = styled(TextField)(({ strength }) => ({
    marginBottom: theme.spacing(3),
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      background: theme.palette.mode === 'light' 
        ? 'rgba(255, 255, 255, 0.85)' 
        : 'rgba(30, 41, 59, 0.85)',
      backdropFilter: 'blur(10px)',
      fontSize: '1.05rem',
      fontWeight: 500,
      minHeight: '58px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1.5px solid transparent',
      color: theme.palette.text.primary,
      '& input': {
        padding: '16px 12px',
        color: theme.palette.text.primary,
      },
      position: 'relative',
      '&:hover': {
        background: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.9)' 
          : 'rgba(30, 41, 59, 0.9)',
        transform: 'translateY(-1px)',
        boxShadow: theme.palette.mode === 'light'
          ? '0 4px 15px rgba(0, 0, 0, 0.06)'
          : '0 4px 15px rgba(0, 0, 0, 0.3)',
        borderColor: 'rgba(174, 213, 129, 0.3)'
      },
      '&.Mui-focused': {
        background: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'rgba(30, 41, 59, 0.95)',
        transform: 'translateY(-1px)',
        boxShadow: '0 6px 20px rgba(174, 213, 129, 0.12)',
        borderColor: '#aed581',
        '&::after': strength && {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          width: `${strength}%`,
          background: strength < 40 ? '#ffab91' : strength < 70 ? '#ffcc02' : '#81c784',
          borderRadius: '0 0 12px 12px',
          transition: 'width 0.3s ease'
        }
      }
    },
    '& .MuiInputLabel-root': {
      fontWeight: 500,
      fontSize: '1rem',
      color: theme.palette.text.secondary,
      '&.Mui-focused': {
        color: '#aed581'
      }
    }
  }));

  const EnhancedButton = styled(Button)(({ variant: buttonVariant }) => ({
    borderRadius: '14px',
    padding: '18px 44px',
    fontSize: '1.1rem',
    fontWeight: 700,
    textTransform: 'none',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '58px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(buttonVariant === 'primary' && {
      background: 'linear-gradient(135deg, #81c784 0%, #aed581 50%, #90caf9 100%)',
      backgroundSize: '150% 150%',
      color: 'white',
      boxShadow: '0 6px 20px rgba(129, 199, 132, 0.25)',
      '&:hover': {
        backgroundPosition: 'right center',
        transform: 'translateY(-2px) scale(1.01)',
        boxShadow: '0 10px 30px rgba(129, 199, 132, 0.35)'
      },
      '&:active': {
        transform: 'translateY(-1px) scale(0.98)'
      }
    }),
    '&:disabled': {
      opacity: 0.6,
      transform: 'none'
    }
  }));

  const ProgressIndicator = styled(LinearProgress)(() => ({
    marginBottom: theme.spacing(3),
    height: '8px',
    borderRadius: '4px',
    background: theme.palette.mode === 'light' 
      ? 'rgba(255, 255, 255, 0.4)' 
      : 'rgba(30, 41, 59, 0.4)',
    '& .MuiLinearProgress-bar': {
      background: 'linear-gradient(90deg, #81c784, #aed581)',
      borderRadius: '4px'
    }
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const calculateProgress = () => {
      const fields = ['email', 'username', 'password', 'confirmPassword'];
      const filledFields = fields.filter(field => formData[field].trim() !== '').length;
      setFormProgress((filledFields / fields.length) * 100);
    };
    calculateProgress();
  }, [formData]);

  useEffect(() => {
    const calculatePasswordStrength = (password) => {
      let strength = 0;
      if (password.length >= 6) strength += 25;
      if (password.match(/[a-z]+/)) strength += 25;
      if (password.match(/[A-Z]+/)) strength += 25;
      if (password.match(/[0-9]+/) || password.match(/[^a-zA-Z0-9]+/)) strength += 25;
      setPasswordStrength(strength);
    };
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

  const features = [
    { icon: <Groups />, text: 'Share & Learn', color: '#81c784' },
    { icon: <Psychology />, text: 'Join Community', color: '#90caf9' },
    { icon: <Shield />, text: 'Privacy First', color: '#ffb74d' },
    { icon: <TrendingUp />, text: 'Growth Tools', color: '#f8bbd9' }
  ];

  return (
    <BackgroundContainer>
      {/* Floating Elements */}
      {[...Array(6)].map((_, i) => (
        <FloatingElement
          key={i}
          delay={i * 0.8}
          size={12 + Math.random() * 8}
          left={Math.random() * 100}
          top={Math.random() * 100}
          duration={8 + Math.random() * 4}
        />
      ))}

      <Container maxWidth="sm" sx={{ py: 6 }}>
        <EnhancedSignupCard elevation={0}>
          <BrandHeader>
            <LogoIcon />
            <BrandTitle variant="h2">
              Join FailFixes
            </BrandTitle>
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
          </BrandHeader>

          <WelcomeSection>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: theme.palette.text.primary,
                textAlign: 'center'
              }}
            >
              🚀 Join 25,000+ Growth Seekers
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 2,
                textAlign: 'center',
                lineHeight: 1.6
              }}
            >
              Transform setbacks into comebacks with our supportive community.
            </Typography>
            <FeatureGrid>
              {features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  text={feature.text}
                  color={feature.color}
                />
              ))}
            </FeatureGrid>
          </WelcomeSection>

          <form onSubmit={handleSubmit}>
            <ProgressIndicator variant="determinate" value={formProgress} />
            
            {errors.general && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {errors.general}
              </Alert>
            )}

            <EnhancedTextField
              fullWidth
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />

            <EnhancedTextField
              fullWidth
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />

            <EnhancedTextField
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              strength={passwordStrength}
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
                        color: 'rgba(0, 0, 0, 0.5)',
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

            <EnhancedTextField
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
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
                        color: 'rgba(0, 0, 0, 0.5)',
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
                  onChange={handleChange}
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

            <EnhancedButton
              type="submit"
              fullWidth
              variant="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PersonAdd />}
              endIcon={!loading && <ArrowForward />}
              sx={{ mb: 4 }}
            >
              {loading ? 'Creating Your Account...' : 'Start My Journey'}
            </EnhancedButton>

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
