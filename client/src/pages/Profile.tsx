import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Snackbar,
  useTheme,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { updateUserProfile, getUserProfile } from '../services/api';
import Loader from '../components/Loader';

const Profile: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });
  
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, authLoading, isAuthenticated, navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const updatedData = {
        name
      };
      
      const response = await updateUserProfile(user._id, updatedData);
      
      if (response.success) {
        // Update local context
        updateProfile({ name });
        setSuccessMessage('Profile updated successfully!');
        setNotification({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success'
        });
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                         (err instanceof Error ? err.message : 'An error occurred updating profile');
      setError(errorMessage);
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setIsEditing(false);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: { xs: 2, md: 4 }, 
        mt: 4 
      }}
    >
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          color: theme.palette.primary.main, 
          mb: 4 
        }}
      >
        My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRadius: 2 
            }}
          >
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                bgcolor: theme.palette.primary.main,
                fontSize: '3rem'
              }}
              src={user?.profilePicture}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {user?.email}
            </Typography>
            
            {!isEditing && (
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                fullWidth
              >
                Edit Profile
              </Button>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Account Information
              </Typography>
              
              {isEditing && (
                <Box>
                  <IconButton 
                    color="primary" 
                    onClick={handleUpdateProfile} 
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing || loading}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={email}
                  disabled={true} // Email is not editable
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            
            {isEditing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Paper>
          
          <Card sx={{ mt: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Account Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Member Since
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user?._id
                      ? new Date(parseInt(user._id.substring(0, 8), 16) * 1000).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Routes Planned
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Calculating...
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 