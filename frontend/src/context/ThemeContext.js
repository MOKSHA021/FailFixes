import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || 'light';
  });

  const toggleTheme = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  };

  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        // Light theme colors
        primary: {
          main: '#10b981',
          light: '#34d399',
          dark: '#059669',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#6366f1',
          light: '#8b5cf6',
          dark: '#4338ca',
          contrastText: '#ffffff',
        },
        success: {
          main: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        warning: {
          main: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        error: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        background: {
          default: '#fafbfc',
          paper: '#ffffff',
        },
        text: {
          primary: '#111827',
          secondary: '#6b7280',
        },
        divider: 'rgba(107, 114, 128, 0.12)',
      } : {
        // Dark theme colors
        primary: {
          main: '#10b981',
          light: '#34d399',
          dark: '#059669',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#6366f1',
          light: '#8b5cf6',
          dark: '#4338ca',
          contrastText: '#ffffff',
        },
        success: {
          main: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        warning: {
          main: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        error: {
          main: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        background: {
          default: '#0f172a',
          paper: '#1e293b',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
        },
        divider: 'rgba(148, 163, 184, 0.12)',
      }),
    },
    typography: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif',
      h1: { 
        fontSize: '3.5rem', 
        fontWeight: 900,
        lineHeight: 1.1,
        letterSpacing: '-0.025em'
      },
      h2: { 
        fontSize: '2.75rem', 
        fontWeight: 800,
        lineHeight: 1.2,
        letterSpacing: '-0.025em'
      },
      h3: { 
        fontSize: '2.25rem', 
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.025em'
      },
      h4: { 
        fontSize: '1.875rem', 
        fontWeight: 700,
        lineHeight: 1.3
      },
      h5: { 
        fontSize: '1.5rem', 
        fontWeight: 600,
        lineHeight: 1.4
      },
      h6: { 
        fontSize: '1.25rem', 
        fontWeight: 600,
        lineHeight: 1.4
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.7,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
        fontWeight: 400,
      },
      button: { 
        textTransform: 'none', 
        fontWeight: 700,
        fontSize: '0.875rem',
        letterSpacing: '0.025em'
      },
    },
    shape: { 
      borderRadius: 16 
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f1f5f9' : '#1e293b',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? '#cbd5e1' : '#475569',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: mode === 'light' ? '#94a3b8' : '#64748b',
            },
          },
          '*': {
            boxSizing: 'border-box',
          },
          a: {
            textDecoration: 'none',
            color: 'inherit',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: '0.875rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
            },
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: mode === 'light' 
              ? '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: mode === 'light' 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.05)',
            background: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: mode === 'light'
                ? '0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)'
                : '0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
          },
          elevation2: {
            boxShadow: mode === 'light'
              ? '0 8px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05)'
              : '0 8px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3)',
          },
          elevation3: {
            boxShadow: mode === 'light'
              ? '0 12px 24px rgba(0, 0, 0, 0.1), 0 8px 15px rgba(0, 0, 0, 0.08)'
              : '0 12px 24px rgba(0, 0, 0, 0.5), 0 8px 15px rgba(0, 0, 0, 0.4)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.3s ease',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981',
                  borderWidth: 2,
                },
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(20px)',
            boxShadow: mode === 'light'
              ? '0 1px 3px rgba(0, 0, 0, 0.1)'
              : '0 1px 3px rgba(0, 0, 0, 0.3)',
            color: mode === 'light' ? '#111827' : '#f8fafc',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
    },
  });

  const value = {
    mode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
