import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  useTheme,
  AlertTitle,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FlightIcon from '@mui/icons-material/Flight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import CloudIcon from '@mui/icons-material/Cloud';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { getUserRoutes, deleteRoute } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import Loader from '../components/Loader';
import PlantButton from '../components/PlantButton';

interface SavedRoute {
  _id: string;
  userId: string;
  origin: string;
  destination: string;
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  mode: string;
  carbonEmission: number;
  date: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

const SavedRoutes: React.FC = () => {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<SavedRoute | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, open: boolean, severity: 'success' | 'error' | 'info'}>({
    message: '',
    open: false,
    severity: 'success'
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchSavedRoutes = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const routes = await getUserRoutes(user._id);
      
      if (routes.length === 0) {
        setNotification({
          message: 'You have no saved routes yet. Try planning a route first!',
          open: true,
          severity: 'info'
        });
      } else {
        setNotification({
          message: `Successfully loaded ${routes.length} saved routes.`,
          open: true,
          severity: 'success'
        });
      }
      
      setSavedRoutes(routes);
    } catch (err: any) {
      console.error('Error fetching saved routes:', err);
      
      // Display specific error message if available from the backend
      const errorMessage = err.response?.data?.message || 
                           'Failed to load your saved routes. Please check your internet connection or try again later.';
      
      setError(errorMessage);
      setNotification({
        message: errorMessage,
        open: true,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [user, setNotification]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch saved routes
    fetchSavedRoutes();
  }, [user, navigate, fetchSavedRoutes]);

  useEffect(() => {
    // On component mount, check if we should display a message about empty routes
    const urlParams = new URLSearchParams(window.location.search);
    const justSaved = urlParams.get('justSaved');
    
    if (justSaved === 'true') {
      setNotification({
        message: 'Your route was saved successfully! You can view it below.',
        open: true,
        severity: 'success'
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get icon based on transportation mode
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'driving':
        return <DirectionsCarIcon sx={{ color: theme.palette.primary.main }} />;
      case 'walking':
        return <DirectionsWalkIcon sx={{ color: theme.palette.primary.main }} />;
      case 'bicycling':
        return <DirectionsBikeIcon sx={{ color: theme.palette.primary.main }} />;
      case 'transit':
        return <DirectionsTransitIcon sx={{ color: theme.palette.primary.main }} />;
      case 'train':
        return <TrainIcon sx={{ color: theme.palette.primary.main }} />;
      case 'bus':
        return <DirectionsBusIcon sx={{ color: theme.palette.primary.main }} />;
      case 'airplane':
        return <FlightIcon sx={{ color: theme.palette.primary.main }} />;
      default:
        return <DirectionsCarIcon sx={{ color: theme.palette.primary.main }} />;
    }
  };

  // Format mode name for display
  const formatModeName = (mode: string) => {
    if (mode === 'airplane') return 'Flight';
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  // Calculate total emissions saved
  const calculateTotalSavings = () => {
    if (savedRoutes.length === 0) return 0;

    // Calculate as if all routes were driven with a car
    const carEmissionFactor = 0.192; // kg CO2 per km
    
    let totalSavings = 0;
    savedRoutes.forEach(route => {
      const distanceInKm = route.distance.value / 1000;
      const carEmission = distanceInKm * carEmissionFactor;
      const savings = carEmission - route.carbonEmission;
      
      // Only count positive savings
      if (savings > 0) {
        totalSavings += savings;
      }
    });
    
    return totalSavings.toFixed(2);
  };

  // Handle route deletion
  const handleOpenDeleteDialog = (route: SavedRoute) => {
    setRouteToDelete(route);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRouteToDelete(null);
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await deleteRoute(routeToDelete._id);
      
      if (response.success) {
        // Remove the deleted route from state
        setSavedRoutes(prevRoutes => 
          prevRoutes.filter(route => route._id !== routeToDelete._id)
        );
        
        setNotification({
          message: 'Route deleted successfully',
          open: true,
          severity: 'success'
        });
      } else {
        throw new Error(response.message || 'Unknown error during deletion');
      }
    } catch (err: any) {
      console.error('Error deleting route:', err);
      
      // Display specific error message if available from the backend
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Failed to delete route. Please try again.';
      
      setNotification({
        message: errorMessage,
        open: true,
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({...prev, open: false}));
  };

  const navigateToRoutePlanner = () => {
    navigate('/planner');
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: '1200px', mx: 'auto' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component={motion.h1}
          variants={itemVariants}
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main
          }}
        >
          Your Saved Routes
        </Typography>
        
        {!loading && (
          <Tooltip title="Refresh routes">
            <IconButton 
              color="primary" 
              onClick={fetchSavedRoutes}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <Loader />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <PlantButton onClick={fetchSavedRoutes} disabled={loading}>
              Retry
            </PlantButton>
          }
        >
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      ) : (
        <>
          {savedRoutes.length === 0 ? (
            <Paper
              component={motion.div}
              variants={itemVariants}
              elevation={2}
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                You don't have any saved routes yet
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Plan your first eco-friendly route to start tracking your environmental impact
              </Typography>
              <PlantButton
                onClick={navigateToRoutePlanner}
              >
                Plan Your First Route
              </PlantButton>
            </Paper>
          ) : (
            <>
              {/* Stats Summary Card */}
              <Paper
                component={motion.div}
                variants={itemVariants}
                elevation={2}
                sx={{ 
                  p: 3, 
                  mb: 4,
                  borderRadius: 2,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white'
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={600}>
                        {savedRoutes.length}
                      </Typography>
                      <Typography variant="body2">
                        Total Routes
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={600}>
                        {calculateTotalSavings()} kg
                      </Typography>
                      <Typography variant="body2">
                        CO₂ Emissions Saved
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={600}>
                        {(savedRoutes.reduce((acc, route) => {
                          return acc + route.distance.value;
                        }, 0) / 1000).toFixed(1)} km
                      </Typography>
                      <Typography variant="body2">
                        Total Distance
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Routes List */}
              <Grid container spacing={3} component={motion.div} variants={itemVariants}>
                {savedRoutes.map((route) => (
                  <Grid item xs={12} md={6} key={route._id}>
                    <Card 
                      elevation={2}
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        position: 'relative'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {getModeIcon(route.mode)}
                            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                              {formatModeName(route.mode)}
                            </Typography>
                          </Box>
                          <Tooltip title="Delete route">
                            <IconButton 
                              onClick={() => handleOpenDeleteDialog(route)} 
                              aria-label="delete route"
                              color="error"
                              size="small"
                              disabled={deleteLoading}
                            >
                              {deleteLoading && route._id === routeToDelete?._id ? 
                                <CircularProgress size={20} color="error" /> : 
                                <DeleteIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', mb: 1 }}>
                            <PlaceIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                            <Typography variant="body2" color="textSecondary">
                              From: <strong>{route.origin}</strong>
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex' }}>
                            <PlaceIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                            <Typography variant="body2" color="textSecondary">
                              To: <strong>{route.destination}</strong>
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTimeIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: '1rem' }} />
                              <Typography variant="body2" color="textSecondary">
                                {route.duration.text}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CloudIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: '1rem' }} />
                              <Typography variant="body2" color="textSecondary">
                                {route.carbonEmission} kg CO₂
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(route.date)}
                          </Typography>
                          <Chip 
                            label={route.distance.text} 
                            size="small" 
                            sx={{ 
                              backgroundColor: theme.palette.primary.light,
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Route</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this route from {routeToDelete?.origin} to {routeToDelete?.destination}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <PlantButton 
            onClick={handleDeleteRoute} 
            disabled={deleteLoading}
          >
            Delete
          </PlantButton>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
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

export default SavedRoutes; 