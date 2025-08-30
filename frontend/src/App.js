import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Import Components
import Header from './components/layout/header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Home from './pages/Home';
import Login from './pages/login';
import Signup from './pages/Signup';
import Browse from './pages/Browse';
import CreateStory from './pages/CreateStory';
import ViewStory from './pages/ViewStory';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import FollowersPage from './pages/Followers';
import FollowingPage from './pages/Following';

// App component that uses the theme context
const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          }}>
            <Header />
            
            <main style={{ 
              flex: 1,
              position: 'relative',
              zIndex: 1
            }}>
              <Routes>
                {/* 🏠 Home Route - Landing + Feed combined */}
                <Route path="/" element={<Home />} />
                
                {/* 🔐 Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* 📚 Story Routes */}
                <Route path="/browse" element={<Browse />} />
                <Route path="/stories" element={<Browse />} />
                
                {/* ✍️ Create Story Routes */}
                <Route path="/write" element={
                  <ProtectedRoute>
                    <CreateStory />
                  </ProtectedRoute>
                } />
                <Route path="/create" element={
                  <ProtectedRoute>
                    <CreateStory />
                  </ProtectedRoute>
                } />
                <Route path="/create-story" element={
                  <ProtectedRoute>
                    <CreateStory />
                  </ProtectedRoute>
                } />
                
                {/* 📖 View Story Route */}
                <Route path="/story/:id" element={<ViewStory />} />
                
                {/* 📊 Dashboard Route */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                {/* 👤 User Profile Routes */}
                <Route path="/profile/:username" element={<UserProfile />} />
                <Route path="/profile/:username/followers" element={<FollowersPage />} />
                <Route path="/profile/:username/following" element={<FollowingPage />} />
                
                {/* 🔄 Redirects for legacy routes */}
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/stories/:id" element={<Navigate to="/story/:id" replace />} />
                
                {/* 🚫 Catch-all route - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
