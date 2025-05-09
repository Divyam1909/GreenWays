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
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Get the redirect path or default to home
  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/planner';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLoginSuccess(true);
      setRedirecting(true);
      const redirectTimer = setTimeout(() => {
        window.location.href = from;
      }, 700);
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
    } catch (err: any) {
      // Improved error handling for network or unexpected errors
      if (err?.message?.toLowerCase().includes('network')) {
        setFormError('Network error. Please check your connection and try again.');
      } else if (err?.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
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
        
        {loginSuccess && (
          <Alert severity="success" sx={{ mt: 3 }}>
            Login successful! Redirecting...
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
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            required
            disabled={loading}
            sx={{ mt: 2, mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <PlantButton
            type="submit"
            disabled={loading}
          >
            Sign In
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