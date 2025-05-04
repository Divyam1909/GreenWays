import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Alert,
  useTheme,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import Loader from '../components/Loader';
import PlantButton from '../components/PlantButton';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/planner');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register(name, email, password);
      // Navigation happens in the useEffect after authentication state changes
    } catch (err) {
      console.error('Registration error:', err);
      // Error is handled by the auth context
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ 
        maxWidth: '500px',
        mx: 'auto',
        p: { xs: 2, md: 4 },
        mt: { xs: 4, md: 6 }
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
          Create Your Account
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
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            variant="outlined"
            required
            autoFocus
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            required
            disabled={loading}
            sx={{ mt: 2 }}
          />
          
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                required
                disabled={loading}
              />
            </Grid>
          </Grid>
          
          <PlantButton
            type="submit"
            disabled={loading}
          >
            Create Account
          </PlantButton>
          
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register; 