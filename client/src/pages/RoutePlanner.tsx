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
  AlertTitle,
  Modal,
  Button,
  CircularProgress
} from '@mui/material';
import { GoogleMap, LoadScript, DirectionsRenderer, Autocomplete as GoogleAutocomplete } from '@react-google-maps/api';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FlightIcon from '@mui/icons-material/Flight';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import NatureIcon from '@mui/icons-material/Nature';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';
import { getRouteOptions, saveRoute, getGeminiFeedback } from '../services/api';
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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [directionsLoading, setDirectionsLoading] = useState(false);
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
  
  // Track if Google Maps script is loaded
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  // Check if API key is valid
  const [mapApiError, setMapApiError] = useState<string | null>(null);
  
  const [flightsModalOpen, setFlightsModalOpen] = useState(false);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [flightsError, setFlightsError] = useState<string | null>(null);
  const [flightOriginAirport, setFlightOriginAirport] = useState<any>(null);
  const [flightDestAirport, setFlightDestAirport] = useState<any>(null);
  
  const [geminiFeedback, setGeminiFeedback] = useState<string>('');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  
  // Add state for feedback modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  
  useEffect(() => {
    if (!googleMapsApiKey || googleMapsApiKey === 'YOUR_GOOGLE_MAPS_API_KEY' || googleMapsApiKey === 'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY') {
      setMapApiError('Google Maps API key is missing or using a placeholder value. Please add your API key to the .env file.');
    } else {
      setMapApiError(null);
    }
  }, [googleMapsApiKey]);

  // Handle Google Maps script loading
  const handleMapsLoaded = useCallback(() => {
    console.log("Google Maps Script loaded successfully");
    setMapsLoaded(true);
  }, []);

  // Handle script error
  const handleMapsError = useCallback((error: Error) => {
    console.error("Error loading Google Maps Script:", error);
    setMapApiError("Failed to load Google Maps. Please refresh and try again.");
  }, []);

  // Reset all state data
  const resetState = useCallback(() => {
    setOrigin('');
    setDestination('');
    setLoading(false);
    setDirectionsLoading(false);
    setError(null);
    setRouteOptions([]);
    setSelectedRoute(null);
    setDirections(null);
    setRecommendations([]);
    setSavedMessage(null);
    setSaveError(null);
    setNotificationOpen(false);
    setMapCenter(defaultCenter);
    setOriginAutocomplete(null);
    setDestAutocomplete(null);
    setFlightsModalOpen(false);
    setFlightsLoading(false);
    setFlights([]);
    setFlightsError(null);
    setFlightOriginAirport(null);
    setFlightDestAirport(null);
    setGeminiFeedback('');
    setGeminiLoading(false);
    setGeminiError(null);
    setFeedbackModalOpen(false);
  }, []);

  // Initialize/reset component state on first load
  useEffect(() => {
    // Reset state when component mounts
    resetState();
    
    // Clean up when component unmounts
    return () => {
      resetState();
    };
  }, [resetState]);

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
      case 'train':
        return <TrainIcon />;
      case 'bus':
        return <DirectionsBusIcon />;
      case 'airplane':
        return <FlightIcon />;
      default:
        return <DirectionsCarIcon />;
    }
  };

  // Format the mode name for display
  const formatModeName = (mode: string) => {
    if (mode === 'airplane') return 'Flight';
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
    if (!window.google || !mapsLoaded) {
      console.error("Google Maps not loaded yet. Please try again.");
      setError("Google Maps not loaded yet. Please try again.");
      return;
    }
    setDirectionsLoading(true);
    if (mode === 'airplane') {
      setDirections(null);
      setDirectionsLoading(false);
      return;
    }
    const googleMode = (mode === 'train' || mode === 'bus') ? 'transit' : mode;
    let transitOptions: any = undefined;
    if (googleMode === 'transit') {
      if (mode === 'train') {
        transitOptions = { modes: ['TRAIN'] };
      } else if (mode === 'bus') {
        transitOptions = { modes: ['BUS'] };
      }
    }
    try {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          travelMode: googleMode.toUpperCase() as google.maps.TravelMode,
          ...(transitOptions ? { transitOptions } : {})
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
          } else {
            console.error(`Error fetching directions: ${status}`);
            setError(`Could not display route map: ${status}`);
          }
          setDirectionsLoading(false);
        }
      );
    } catch (err) {
      console.error("Error calling directions service:", err);
      setError("Failed to get directions. Please try again.");
      setDirectionsLoading(false);
    }
  }, [mapsLoaded]);

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

  // Fetch Gemini feedback when routeOptions or user changes
  useEffect(() => {
    if (routeOptions.length > 0) {
      setGeminiLoading(true);
      setGeminiError(null);
      getGeminiFeedback(routeOptions, user)
        .then((feedback) => setGeminiFeedback(feedback))
        .catch((err) => {
          setGeminiError('Could not fetch personalized feedback.');
          setGeminiFeedback('');
        })
        .finally(() => setGeminiLoading(false));
    } else {
      setGeminiFeedback('');
    }
  }, [routeOptions, user]);

  // Now, after all hooks:
  if (authLoading) {
    return <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '70vh' 
      }}
    >
      <Loader />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Preparing your route planner...
      </Typography>
    </Box>;
  }
  
  const handleShowFlights = async () => {
    setFlightsModalOpen(true);
    setFlightsLoading(true);
    setFlightsError(null);
    setFlights([]);
    try {
      const res = await fetch(`/api/flights?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
      const data = await res.json();
      setFlights(data.flights);
      setFlightOriginAirport(data.originAirport);
      setFlightDestAirport(data.destAirport);
    } catch (err) {
      setFlightsError('Failed to fetch flights.');
    } finally {
      setFlightsLoading(false);
    }
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
      <LoadScript 
        googleMapsApiKey={googleMapsApiKey} 
        libraries={libraries as any}
        loadingElement={<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><Loader /></Box>}
        onLoad={handleMapsLoaded}
        onError={handleMapsError}
      >
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
                Find Routes
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
                <>
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
                  {/* Eco-Friendly Recommendations below Environmental Impact */}
                  {recommendations.length > 0 && (
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
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
                </>
              )}
            </Grid>

            {/* Route Options & Recommendations */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Available Routes
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {/* Button to show Gemini Personalized Feedback in a modal */}
                {routeOptions.length > 0 && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <PlantButton onClick={() => setFeedbackModalOpen(true)}>
                      Show Personalized Feedback
                    </PlantButton>
                  </Box>
                )}
                {/* Filter out 'transit' mode from route options */}
                {routeOptions.filter(route => route.mode !== 'transit').map((route, index) => (
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
                    Save Route
                  </PlantButton>
                </Box>
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

      <Modal open={flightsModalOpen} onClose={() => setFlightsModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <Typography variant="h6" gutterBottom>
            Available Flights
          </Typography>
          {flightOriginAirport && flightDestAirport && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {flightOriginAirport.name} ({flightOriginAirport.iata}) → {flightDestAirport.name} ({flightDestAirport.iata})
            </Typography>
          )}
          {flightsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : flightsError ? (
            <Alert severity="error">{flightsError}</Alert>
          ) : flights.length === 0 ? (
            <Typography>No flights found for this route.</Typography>
          ) : (
            <List>
              {flights.map((flight, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={`${flight.airline} ${flight.flight_number || ''}`}
                    secondary={
                      <>
                        <div>Departure: {flight.departure ? new Date(flight.departure).toLocaleString() : 'N/A'}</div>
                        <div>Arrival: {flight.arrival ? new Date(flight.arrival).toLocaleString() : 'N/A'}</div>
                        <div>Status: {flight.status}</div>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Button onClick={() => setFlightsModalOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>

      {/* Gemini Feedback Modal */}
      <Modal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)}>
        <Box>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid',
            borderColor: theme.palette.primary.main,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '80vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Personalized Feedback
            </Typography>
            {geminiLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                <CircularProgress size={24} />
                <Typography>Getting personalized insights...</Typography>
              </Box>
            ) : geminiError ? (
              <Alert severity="error">{geminiError}</Alert>
            ) : geminiFeedback ? (
              <Typography sx={{ whiteSpace: 'pre-line', textAlign: 'left', my: 2 }}>{geminiFeedback}</Typography>
            ) : null}
            <Button onClick={() => setFeedbackModalOpen(false)} sx={{ mt: 2 }} variant="outlined" color="primary">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RoutePlanner; 