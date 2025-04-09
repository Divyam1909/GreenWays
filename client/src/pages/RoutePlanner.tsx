import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  useTheme,
  Snackbar,
  AlertTitle
} from '@mui/material';
import { GoogleMap, LoadScript, DirectionsRenderer, Autocomplete as GoogleAutocomplete } from '@react-google-maps/api';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import NatureIcon from '@mui/icons-material/Nature';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';
import { getRouteOptions, saveRoute } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import PlantButton from '../components/PlantButton';

// Animation variants
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

// Google Maps container style
const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

// Default map center (can be adjusted)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

interface RouteOption {
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
  steps: any[];
  polyline: string;
  carbonEmission: number;
  isGreenest: boolean;
  isFastest: boolean;
}

interface RoutePlannerProps {}

const RoutePlanner: React.FC<RoutePlannerProps> = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  
  // References for Google Autocomplete
  const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destAutocomplete, setDestAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // API key should be in an environment variable
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  // Libraries needed for Places API
  const libraries = useMemo(() => ['places'], []);
  
  // Check if API key is valid
  const [mapApiError, setMapApiError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!googleMapsApiKey || googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY' || googleMapsApiKey === 'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY') {
      setMapApiError('Google Maps API key is missing or using a placeholder value. Please add your API key to the .env file.');
    } else {
      setMapApiError(null);
    }
  }, [googleMapsApiKey]);

  // Get mode icon based on transportation mode
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'driving':
        return <DirectionsCarIcon />;
      case 'walking':
        return <DirectionsWalkIcon />;
      case 'bicycling':
        return <DirectionsBikeIcon />;
      case 'transit':
        return <DirectionsTransitIcon />;
      default:
        return <DirectionsCarIcon />;
    }
  };

  // Format the mode name for display
  const formatModeName = (mode: string) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination) {
      setError('Please enter both origin and destination.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRouteOptions([]);
    setSelectedRoute(null);
    setDirections(null);
    setSavedMessage(null);
    setSaveError(null);

    try {
      const response = await getRouteOptions(origin, destination);
      setRouteOptions(response.routes);
      setRecommendations(response.recommendations);

      // Select the greenest route by default
      const greenestRoute = response.routes.find((route: RouteOption) => route.isGreenest);
      if (greenestRoute) {
        setSelectedRoute(greenestRoute);
        // Get directions for the selected route
        fetchDirections(greenestRoute.origin, greenestRoute.destination, greenestRoute.mode);
      }
    } catch (err: any) {
      console.error('Error fetching route options:', err);
      // Display specific error message if available from the backend
      const errorMessage = err.response?.data?.message || 
                           'Failed to fetch route options. Please check your internet connection or try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch directions from Google Maps API
  const fetchDirections = useCallback((origin: string, destination: string, mode: string) => {
    if (!window.google) return;
    
    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin,
        destination,
        travelMode: mode.toUpperCase() as google.maps.TravelMode
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  }, []);

  // Handle route selection
  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    fetchDirections(route.origin, route.destination, route.mode);
  };

  // Handle save route
  const handleSaveRoute = async () => {
    if (!user || !selectedRoute) {
      setError('You must be logged in to save routes.');
      return;
    }

    try {
      setSaveError(null);
      const response = await saveRoute(user._id, selectedRoute);
      
      if (response && response.route) {
        setSavedMessage(`Route successfully saved! Redirecting to saved routes...`);
        setNotificationOpen(true);
        
        // Navigate to saved routes page after a short delay
        setTimeout(() => {
          navigate('/saved-routes?justSaved=true');
        }, 2000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Error saving route:', err);
      // Display specific error message if available from the backend
      const errorMessage = err.response?.data?.message || 
                        'Failed to save route. Please check your internet connection or try again later.';
      setSaveError(errorMessage);
      setNotificationOpen(true);
    }
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  // Memoized map options
  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
  }), []);

  // Handle autocomplete origin selection
  const onOriginPlaceChanged = () => {
    if (originAutocomplete) {
      const place = originAutocomplete.getPlace();
      if (place && place.formatted_address) {
        setOrigin(place.formatted_address);
        
        // Update map center if coordinates are available
        if (place.geometry?.location) {
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
        }
      }
    }
  };

  // Handle autocomplete destination selection
  const onDestinationPlaceChanged = () => {
    if (destAutocomplete) {
      const place = destAutocomplete.getPlace();
      if (place && place.formatted_address) {
        setDestination(place.formatted_address);
        
        // Update map center if coordinates are available
        if (place.geometry?.location) {
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
        }
      }
    }
  };

  // Load autocomplete references
  const originAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setOriginAutocomplete(autocomplete);
  };

  const destAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setDestAutocomplete(autocomplete);
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: '1200px', mx: 'auto' }}
    >
      <Typography 
        variant="h3" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          color: theme.palette.primary.main,
          mb: 4
        }}
        component={motion.h1}
        variants={itemVariants}
      >
        Plan Your Green Route
      </Typography>

      {/* Search Form */}
      <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries as any}>
        <Paper 
          component={motion.form}
          variants={itemVariants}
          onSubmit={handleSubmit}
          elevation={2}
          sx={{ p: 3, mb: 4, borderRadius: 2 }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <GoogleAutocomplete
                onLoad={originAutocompleteLoad}
                onPlaceChanged={onOriginPlaceChanged}
                options={{ types: ['geocode'] }}
              >
                <TextField
                  fullWidth
                  label="Starting Point"
                  variant="outlined"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Enter a location"
                  disabled={loading}
                />
              </GoogleAutocomplete>
            </Grid>
            <Grid item xs={12} md={5}>
              <GoogleAutocomplete
                onLoad={destAutocompleteLoad}
                onPlaceChanged={onDestinationPlaceChanged}
                options={{ types: ['geocode'] }}
              >
                <TextField
                  fullWidth
                  label="Destination"
                  variant="outlined"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter a location"
                  disabled={loading}
                />
              </GoogleAutocomplete>
            </Grid>
            <Grid item xs={12} md={2}>
              <PlantButton
                type="submit"
                disabled={!origin || !destination || loading || !!mapApiError}
              >
                {loading ? <Loader /> : 'Find Routes'}
              </PlantButton>
            </Grid>
            
            {/* Display API key error if present */}
            {mapApiError && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {mapApiError}
                </Alert>
              </Grid>
            )}

            {error && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              </Grid>
            )}
            
            {savedMessage && (
              <Grid item xs={12}>
                <Alert severity="success" sx={{ mt: 2 }}>
                  {savedMessage}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Loader />
          </Box>
        )}

        {/* Results Section */}
        {routeOptions.length > 0 && (
          <Grid container spacing={4} component={motion.div} variants={itemVariants}>
            {/* Map Section */}
            <Grid item xs={12} md={7}>
              <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={12}
                  options={mapOptions}
                >
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: theme.palette.primary.main,
                          strokeWeight: 5,
                        }
                      }}
                    />
                  )}
                </GoogleMap>
              </Paper>

              {/* Environmental Impact Section */}
              {selectedRoute && (
                <Paper 
                  elevation={2} 
                  sx={{ mt: 3, p: 3, borderRadius: 2, borderLeft: `6px solid ${theme.palette.primary.main}` }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Environmental Impact
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocalGasStationIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography>
                          <strong>CO2 Emission:</strong> {selectedRoute.carbonEmission} kg
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SpeedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography>
                          <strong>Distance:</strong> {selectedRoute.distance.text}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography>
                          <strong>Duration:</strong> {selectedRoute.duration.text}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NatureIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography>
                          <strong>Mode:</strong> {formatModeName(selectedRoute.mode)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Grid>

            {/* Route Options & Recommendations */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Available Routes
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {routeOptions.map((route, index) => (
                  <Card 
                    key={index}
                    elevation={selectedRoute === route ? 3 : 1}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      transform: selectedRoute === route ? 'scale(1.02)' : 'scale(1)',
                      border: selectedRoute === route ? `2px solid ${theme.palette.primary.main}` : 'none'
                    }}
                    onClick={() => handleRouteSelect(route)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getModeIcon(route.mode)}
                          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                            {formatModeName(route.mode)}
                          </Typography>
                        </Box>
                        <Box>
                          {route.isGreenest && (
                            <Chip 
                              label="Greenest" 
                              size="small" 
                              color="primary" 
                              icon={<NatureIcon />} 
                              sx={{ mr: 1 }}
                            />
                          )}
                          {route.isFastest && (
                            <Chip 
                              label="Fastest" 
                              size="small" 
                              color="secondary" 
                              icon={<SpeedIcon />} 
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Distance: {route.distance.text}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Time: {route.duration.text}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            CO2 Emission: {route.carbonEmission} kg
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {user && selectedRoute && (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2, mb: 3 }}>
                  <PlantButton
                    onClick={handleSaveRoute}
                    disabled={!selectedRoute || loading}
                  >
                    {loading ? <Loader /> : 'Save Route'}
                  </PlantButton>
                </Box>
              )}

              {recommendations.length > 0 && (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Eco-Friendly Recommendations
                  </Typography>
                  <List dense>
                    {recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: '40px' }}>
                          <NatureIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </LoadScript>

      {/* Notification Snackbar */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification}
          severity={saveError ? "error" : "success"}
          sx={{ width: '100%' }}
          elevation={6}
        >
          <AlertTitle>{saveError ? "Error" : "Success"}</AlertTitle>
          {saveError || savedMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RoutePlanner; 