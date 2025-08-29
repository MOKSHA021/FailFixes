import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Box, CircularProgress, Typography } from '@mui/material';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{ color: '#64748b' }}
      >
        <CircularProgress 
          sx={{ 
            color: '#81c784',
            mb: 2
          }} 
        />
        <Typography variant="h6">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
