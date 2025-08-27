import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/login';
import Signup from './pages/Signup';

const theme = createTheme({
  palette: {
    primary: {
      main: '#81c784',
      light: '#b2dfb2',
      dark: '#519657',
      contrastText: '#ffffff', // ✅ Required for Chip component
    },
    secondary: {
      main: '#90caf9',
      light: '#c3fdff',
      dark: '#5d99c6',
      contrastText: '#ffffff', // ✅ Required for Chip component
    },
    error: {
      main: '#ff8a80',
      light: '#ffbcaf',
      dark: '#c85a54',
      contrastText: '#ffffff', // ✅ Required for Chip component
    },
    warning: {
      main: '#ffc046',
      light: '#fff178',
      dark: '#c78f00',
      contrastText: '#000000', // ✅ Required for Chip component
    },
    info: {
      main: '#64b5f6',
      light: '#9be7ff',
      dark: '#2286c3',
      contrastText: '#ffffff', // ✅ Required for Chip component
    },
    success: {
      main: '#81c784',
      light: '#b2dfb2',
      dark: '#519657',
      contrastText: '#ffffff', // ✅ Required for Chip component
    },
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#607d8b',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 500,
    },
    body2: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '12px',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#c8e6c9 #f5f5f5',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 6,
            backgroundColor: '#c8e6c9',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#aed581',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontSize: '0.95rem',
            fontWeight: 500,
          },
        },
      },
    },
    // ✅ Fixed Chip component styling
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

// Soft Dashboard with same styling
const Dashboard = () => (
  <div style={{ 
    padding: '40px 30px', 
    textAlign: 'center',
    background: `
      linear-gradient(135deg, 
        #f0f4ff 0%, 
        #f0fff4 25%,
        #fff8f0 50%,
        #f0f8ff 75%,
        #f5f8ff 100%
      )
    `,
    minHeight: '100vh',
    color: '#2c3e50',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }}>
    <h1 style={{ 
      fontSize: '3rem', 
      marginBottom: '25px',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #81c784, #90caf9)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      🎉 Welcome to FailFixes!
    </h1>
    
    <p style={{ 
      fontSize: '1.2rem', 
      marginBottom: '35px', 
      maxWidth: '600px',
      lineHeight: 1.6,
      color: '#607d8b'
    }}>
      You've successfully joined the FailFixes community! Start sharing your growth stories and learn from others' experiences.
    </p>
    
    <button 
      onClick={() => {
        localStorage.clear();
        window.location.href = '/login';
      }}
      style={{
        padding: '14px 32px',
        background: 'linear-gradient(135deg, #81c784, #90caf9)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(129, 199, 132, 0.3)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px) scale(1.02)';
        e.target.style.boxShadow = '0 8px 25px rgba(129, 199, 132, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0px) scale(1)';
        e.target.style.boxShadow = '0 4px 15px rgba(129, 199, 132, 0.3)';
      }}
    >
      Sign Out
    </button>
  </div>
);

// Soft Browse Page with same styling
const Browse = () => (
  <div style={{ 
    padding: '40px 30px', 
    textAlign: 'center',
    background: `
      linear-gradient(135deg, 
        #f0f8ff 0%, 
        #f0fff4 25%,
        #fff0f5 50%,
        #f5fffa 75%,
        #f0f4ff 100%
      )
    `,
    minHeight: '100vh',
    color: '#2c3e50',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <h1 style={{ 
      fontSize: '3rem', 
      marginBottom: '25px',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #90caf9, #81c784)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      🔍 Explore FailFixes
    </h1>
    
    <p style={{ 
      fontSize: '1.2rem', 
      marginBottom: '35px', 
      maxWidth: '600px',
      lineHeight: 1.6,
      color: '#607d8b'
    }}>
      Discover inspiring transformation stories as a guest. See how others turn challenges into growth opportunities!
    </p>
    
    <button 
      onClick={() => window.location.href = '/login'}
      style={{
        padding: '14px 32px',
        background: 'linear-gradient(135deg, #90caf9, #81c784)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(144, 202, 249, 0.3)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px) scale(1.02)';
        e.target.style.boxShadow = '0 8px 25px rgba(144, 202, 249, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0px) scale(1)';
        e.target.style.boxShadow = '0 4px 15px rgba(144, 202, 249, 0.3)';
      }}
    >
      Join the Community
    </button>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
