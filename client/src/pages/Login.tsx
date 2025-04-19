import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Alert,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import Loader from '../components/Loader';
import PlantButton from '../components/PlantButton';

// Get the location state with TypeScript
interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Get the redirect path or default to home
  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/planner';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setRedirecting(true);
      // Add a small delay before navigating to ensure all state changes have been processed
      const redirectTimer = setTimeout(() => {
        // Force a page reload instead of using React Router navigation
        window.location.href = from;
      }, 300);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, loading, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    
    // Basic validation
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      // Navigation happens in the useEffect after authentication state changes
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by the auth context
    }
  };

  // Show a redirecting message while transitioning
  if (redirecting) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh' 
      }}>
        <Loader />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Redirecting you...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ 
        maxWidth: '450px',
        mx: 'auto',
        p: { xs: 2, md: 4 },
        mt: { xs: 4, md: 8 }
      }}
    >
      <Paper 
        elevation={3}
        sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main, 
            mb: 4 
          }}
        >
          Welcome Back
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {formError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {formError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            required
            autoFocus
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            required
            disabled={loading}
            sx={{ mt: 2, mb: 3 }}
          />
          
          <PlantButton
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader /> : 'Sign In'}
          </PlantButton>
          
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
              Sign up here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 