import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RoutePlanner from './pages/RoutePlanner';
import SavedRoutes from './pages/SavedRoutes';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Loader from './components/Loader';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from './utils/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import { ThemeProvider } from './utils/ThemeContext';
// @ts-ignore
import ErrorBoundary from './components/ErrorBoundary';
import { checkApiHealth } from './services/api';
import './App.css';

function AppContent() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isServerConnected, setIsServerConnected] = useState(true);
  const [isCheckingServer, setIsCheckingServer] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [lastAuthState, setLastAuthState] = useState(isAuthenticated);

  // Force rerender when auth state changes
  useEffect(() => {
    if (lastAuthState !== isAuthenticated) {
      setLastAuthState(isAuthenticated);
      // Force a component update
      console.log("Authentication state changed, triggering update");
    }
  }, [isAuthenticated, lastAuthState]);

  useEffect(() => {
    // Check server connection
    const checkServerConnection = async () => {
      setIsCheckingServer(true);
      try {
        console.log("Checking server connection...");
        const response = await checkApiHealth();
        console.log("Server check response:", response);
        
        if (response && response.status === 'ok') {
          setIsServerConnected(true);
        } else {
          console.warn("Server response did not include 'ok' status", response);
          setIsServerConnected(false);
        }
      } catch (error) {
        console.error('Server connection error:', error);
        setIsServerConnected(false);
      } finally {
        setIsCheckingServer(false);
      }
    };

    // Retry logic for server connection
    if (retryCount > 0) {
      const retryDelay = Math.min(2000 * retryCount, 10000); // Exponential backoff with cap
      console.log(`Retry attempt ${retryCount} after ${retryDelay}ms`);
      
      const timer = setTimeout(() => {
        checkServerConnection();
      }, retryDelay);
      
      return () => clearTimeout(timer);
    } else {
      checkServerConnection();
    }
    
    // Add a slight delay to ensure smooth loading experience but don't wait too long
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500); // Reduced from 1000ms to 500ms for faster startup

    return () => clearTimeout(timer);
  }, [retryCount]);

  // Only show loader when really needed (initial app load or server check)
  // Don't include authLoading here to prevent the infinite loading issue
  const isLoading = isInitialLoading || isCheckingServer;

  const handleRetryConnection = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          width: '100%',
          flexDirection: 'column'
        }}
      >
        <Loader size="large" text="Loading GreenWays..." fullScreen={true} />
      </Box>
    );
  }

  if (!isServerConnected) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          width: '100%',
          flexDirection: 'column',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Box 
          component="img"
          src="/assets/error-illustration.svg" 
          alt="Server Error"
          sx={{ maxWidth: 300, mb: 4 }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Server Connection Error
        </Typography>
        <Typography variant="body1" paragraph>
          We're having trouble connecting to our servers. This could be due to:
        </Typography>
        <Box sx={{ textAlign: 'left', mb: 4, maxWidth: 500 }}>
          <Typography component="ul" sx={{ listStylePosition: 'inside' }}>
            <li>The server may be down or undergoing maintenance</li>
            <li>Your internet connection may have issues</li>
            <li>Server might be experiencing high traffic</li>
          </Typography>
        </Box>
        <Button 
          onClick={handleRetryConnection} 
          variant="contained"
          color="primary"
          size="large"
          className="retry-button"
          sx={{ my: 2 }}
        >
          {retryCount > 0 ? `Retry Connection (Attempt ${retryCount})` : 'Retry Connection'}
        </Button>
        <Typography variant="body2" color="text.secondary">
          If this problem persists, please contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/planner" element={<RoutePlanner />} />
              <Route path="/saved-routes" element={
                <ProtectedRoute>
                  <SavedRoutes />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
