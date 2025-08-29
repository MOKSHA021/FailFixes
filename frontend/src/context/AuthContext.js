import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  Backdrop,
  Box,
  Avatar,
  Typography,
  CircularProgress,
} from '@mui/material';
import { AutoFixHigh } from '@mui/icons-material';
import { keyframes } from '@mui/material/styles';
import axios from 'axios';

const AuthContext = createContext();

const perfectFloat = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-8px) rotate(2deg) scale(1.02); }
`;

const cosmicPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.4);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 80px rgba(16, 185, 129, 0.6);
    transform: scale(1.05);
  }
`;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('ff_token');
        const userData = localStorage.getItem('ff_user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser({
            ...parsedUser,
            displayUsername: parsedUser.username || parsedUser.name || `user_${parsedUser._id?.slice(-6)}`,
            stats: {
              storiesCount: 0,
              totalViews: 0,
              totalLikes: 0,
              totalComments: 0,
              followersCount: 0,
              followingCount: 0,
              ...parsedUser.stats
            }
          });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_user');
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('ff_token', token);
        localStorage.setItem('ff_user', JSON.stringify(userData));
        
        setUser({
          ...userData,
          displayUsername: userData.username || userData.name || `user_${userData._id?.slice(-6)}`,
          stats: {
            storiesCount: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            followersCount: 0,
            followingCount: 0,
            ...userData.stats
          }
        });
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      if (response.data.success) {
        const { token, user: newUser } = response.data;
        
        localStorage.setItem('ff_token', token);
        localStorage.setItem('ff_user', JSON.stringify(newUser));
        
        setUser({
          ...newUser,
          displayUsername: newUser.username || newUser.name || `user_${newUser._id?.slice(-6)}`,
          stats: {
            storiesCount: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            followersCount: 0,
            followingCount: 0,
            ...newUser.stats
          }
        });
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const signup = async (userData) => {
    return await register(userData);
  };

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const enhanced = {
      ...updatedUser,
      displayUsername: updatedUser.username || updatedUser.name || user?.displayUsername,
      stats: {
        ...user?.stats,
        ...updatedUser.stats
      }
    };
    setUser(enhanced);
    localStorage.setItem('ff_user', JSON.stringify(enhanced));
  };

  if (loading) {
    return (
      <Backdrop open sx={{ 
        zIndex: 9999, 
        background: 'linear-gradient(135deg, #fafbfc, #f1f5f9)',
        backdropFilter: 'blur(20px)',
      }}>
        <Box textAlign="center">
          <Avatar sx={{ 
            width: 100, 
            height: 100, 
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            margin: '0 auto 32px',
            animation: `${perfectFloat} 3s ease-in-out infinite, ${cosmicPulse} 4s ease-in-out infinite`,
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)',
          }}>
            <AutoFixHigh sx={{ fontSize: '3rem' }} />
          </Avatar>
          
          <Typography variant="h2" sx={{ 
            fontWeight: 900, 
            mb: 2,
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            FailFixes
          </Typography>
          
          <Typography variant="h5" sx={{ 
            color: 'text.secondary', 
            mb: 4,
            fontWeight: 500,
          }}>
            Transforming setbacks into comebacks
          </Typography>
          
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: '#10b981',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
        </Box>
      </Backdrop>
    );
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading: false,
    login,
    register,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
