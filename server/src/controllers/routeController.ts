import { Request, Response } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import Route from '../models/Route';

// Constants for carbon emissions estimation (in kg CO2 per km)
const EMISSIONS = {
  DRIVING: 0.192, // Average car
  TRANSIT: 0.050, // Bus
  BICYCLING: 0.0,
  WALKING: 0.0,
  TRAIN: 0.035,
  BUS: 0.068, // Specific bus emission value
  AIRPLANE: 0.255, // Airplane/flight emission
  CARPOOLING: 0.096 // Assuming 2 people in car
};

// Transportation mode mapping (Google API supported modes and our custom modes)
const MODE_MAPPING = {
  DRIVING: 'driving',
  WALKING: 'walking',
  BICYCLING: 'bicycling',
  TRANSIT: 'transit',
  TRAIN: 'train',      // Custom mode (will use transit API + filtering)
  BUS: 'bus',          // Custom mode (will use transit API + filtering)
  AIRPLANE: 'airplane' // Custom mode (will use direct distance calculation)
};

// Route response interface
interface RouteResponse {
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
  steps: any[];
  polyline: string;
  mode: string;
  carbonEmission: number;
  isGreenest: boolean;
  isFastest: boolean;
}

// Helper function declarations
function calculateFlightDuration(distanceKm: number): string {
  // Assume average flight speed of 800 km/h
  // Add 1.5 hours for boarding, taxiing, etc.
  const flightHours = distanceKm / 800;
  const totalHours = flightHours + 1.5;
  
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  
  return `${hours} h ${minutes} min`;
}

function calculateFlightDurationSeconds(distanceKm: number): number {
  const flightHours = distanceKm / 800;
  const totalHours = flightHours + 1.5;
  
  return Math.round(totalHours * 3600); // Convert to seconds
}

// Get all possible route options between two locations
export const getRouteOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
      res.status(400).json({ message: 'Origin and destination are required' });
      return;
    }

    // Get routes for different transportation modes
    const googleApiModes = ['driving', 'transit', 'bicycling', 'walking'];
    const routePromises = googleApiModes.map(mode => 
      getRouteFromGoogleMaps(origin, destination, mode)
    );

    const routeResults = await Promise.all(routePromises);
    
    // Initialize enhanced routes array
    let enhancedRoutes: RouteResponse[] = [];
    
    // Process and enhance routes with carbon emissions data
    enhancedRoutes = routeResults.map((route, index) => {
      if (!route) return null;
      
      const mode = googleApiModes[index];
      const distanceInKm = route.distance.value / 1000;
      const carbonEmission = calculateCarbonEmission(distanceInKm, mode);
      
      return {
        ...route,
        mode,
        carbonEmission,
        isGreenest: false, // Will be determined later
        isFastest: false   // Will be determined later
      };
    }).filter(Boolean) as RouteResponse[];
    
    // Add train route if transit data is available
    const transitRoute = enhancedRoutes.find(route => route.mode === 'transit');
    if (transitRoute) {
      // Create a train route based on the transit route
      const trainRoute: RouteResponse = {
        ...JSON.parse(JSON.stringify(transitRoute)),
        mode: 'train',
        carbonEmission: calculateCarbonEmission(transitRoute.distance.value / 1000, 'train')
      };
      enhancedRoutes.push(trainRoute);
      
      // Create a bus route based on the transit route
      const busRoute: RouteResponse = {
        ...JSON.parse(JSON.stringify(transitRoute)),
        mode: 'bus',
        carbonEmission: calculateCarbonEmission(transitRoute.distance.value / 1000, 'bus')
      };
      enhancedRoutes.push(busRoute);
    }
    
    // Add airplane route for longer distances (over 100km)
    const drivingRoute = enhancedRoutes.find(route => route.mode === 'driving');
    if (drivingRoute && drivingRoute.distance.value > 100000) { // 100km threshold
      // Create an airplane route with direct distance (slightly shorter than driving)
      const flightDistanceKm = (drivingRoute.distance.value * 0.8) / 1000; // Estimate as 80% of driving distance
      const airplaneRoute: RouteResponse = {
        ...JSON.parse(JSON.stringify(drivingRoute)),
        mode: 'airplane',
        distance: {
          text: `${Math.round(flightDistanceKm)} km`,
          value: Math.round(flightDistanceKm * 1000)
        },
        duration: {
          text: calculateFlightDuration(flightDistanceKm),
          value: calculateFlightDurationSeconds(flightDistanceKm)
        },
        carbonEmission: calculateCarbonEmission(flightDistanceKm, 'airplane')
      };
      enhancedRoutes.push(airplaneRoute);
    }
    
    // Determine fastest and greenest routes
    if (enhancedRoutes.length > 0) {
      // Find fastest route (min duration)
      const fastestRoute = enhancedRoutes.reduce((min, route) => 
        route.duration.value < min.duration.value ? route : min, enhancedRoutes[0]);
      
      // Find greenest route (min carbon emission)
      const greenestRoute = enhancedRoutes.reduce((min, route) => 
        route.carbonEmission < min.carbonEmission ? route : min, enhancedRoutes[0]);
      
      // Mark routes
      enhancedRoutes.forEach(route => {
        if (route.duration.value === fastestRoute.duration.value) {
          route.isFastest = true;
        }
        if (route.carbonEmission === greenestRoute.carbonEmission) {
          route.isGreenest = true;
        }
      });
    }

    // Add recommendations for reducing carbon footprint
    const recommendations = generateRecommendations(enhancedRoutes);

    res.status(200).json({
      routes: enhancedRoutes,
      recommendations
    });
  } catch (error) {
    console.error('Error getting route options:', error);
    res.status(500).json({ message: 'Error getting route options', error: (error as Error).message });
  }
};

// Check MongoDB connection status
const ensureMongoDBConnection = async () => {
  if (mongoose.connection.readyState !== mongoose.ConnectionStates.connected) {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const currentState = states[mongoose.connection.readyState] || 'unknown';
    
    console.log(`MongoDB not properly connected. Current state: ${currentState}`);
    
    // Attempt to reconnect if disconnected
    if (mongoose.connection.readyState === mongoose.ConnectionStates.disconnected) {
      console.log('Attempting to reconnect to MongoDB...');
      try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenways');
        console.log('Successfully reconnected to MongoDB');
        return true;
      } catch (err) {
        console.error('Failed to reconnect to MongoDB:', err);
        return false;
      }
    }
    
    return false;
  }
  return true;
};

// Save a route selected by the user
export const saveRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, routeData } = req.body;
    
    if (!userId || !routeData) {
      res.status(400).json({ message: 'User ID and route data are required' });
      return;
    }

    // Ensure MongoDB is connected
    const isConnected = await ensureMongoDBConnection();
    if (!isConnected) {
      res.status(503).json({ message: 'Database connection unavailable. Please try again later.' });
      return;
    }

    const newRoute = new Route({
      userId,
      origin: routeData.origin,
      destination: routeData.destination,
      distance: routeData.distance,
      duration: routeData.duration,
      mode: routeData.mode,
      carbonEmission: routeData.carbonEmission,
      date: new Date()
    });

    await newRoute.save();
    console.log(`Route saved to MongoDB: ${newRoute._id}`);
    res.status(201).json({ message: 'Route saved successfully', route: newRoute });
  } catch (error) {
    console.error('Error saving route:', error);
    res.status(500).json({ message: 'Failed to save route. Database error.', error: (error as Error).message });
  }
};

// Get routes saved by a specific user
export const getUserRoutes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    // Ensure MongoDB is connected
    const isConnected = await ensureMongoDBConnection();
    if (!isConnected) {
      res.status(503).json({ message: 'Database connection unavailable. Please try again later.' });
      return;
    }

    const userRoutes = await Route.find({ userId }).sort({ date: -1 });
    console.log(`Found ${userRoutes.length} routes for user ${userId}`);
    res.status(200).json(userRoutes);
  } catch (error) {
    console.error('Error getting user routes:', error);
    res.status(500).json({ message: 'Failed to get saved routes. Database error.', error: (error as Error).message });
  }
};

// Delete a saved route
export const deleteRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { routeId } = req.params;
    
    if (!routeId) {
      res.status(400).json({ message: 'Route ID is required' });
      return;
    }

    // Ensure MongoDB is connected
    const isConnected = await ensureMongoDBConnection();
    if (!isConnected) {
      res.status(503).json({ message: 'Database connection unavailable. Please try again later.' });
      return;
    }

    const deletedRoute = await Route.findByIdAndDelete(routeId);
    
    if (!deletedRoute) {
      res.status(404).json({ message: 'Route not found' });
      return;
    }

    console.log(`Route deleted from MongoDB: ${routeId}`);
    res.status(200).json({ 
      success: true, 
      message: 'Route deleted successfully',
      deletedRoute
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete route. Database error.', 
      error: (error as Error).message 
    });
  }
};

// Helper functions
async function getRouteFromGoogleMaps(origin: string, destination: string, mode: string) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        mode,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        origin: leg.start_address,
        destination: leg.end_address,
        distance: leg.distance,
        duration: leg.duration,
        steps: leg.steps,
        polyline: route.overview_polyline
      };
    }
    return null;
  } catch (error) {
    console.error(`Error getting ${mode} route from Google Maps:`, error);
    return null;
  }
}

function calculateCarbonEmission(distanceInKm: number, mode: string): number {
  // Convert mode to uppercase for matching with EMISSIONS keys
  const modeKey = mode.toUpperCase() as keyof typeof EMISSIONS;
  
  // Get emission factor or default to driving if not found
  const emissionFactor = EMISSIONS[modeKey] || EMISSIONS.DRIVING;
  
  // Return emission with 2 decimal places
  return Number((distanceInKm * emissionFactor).toFixed(2));
}

function generateRecommendations(routes: RouteResponse[]): string[] {
  const recommendations: string[] = [];
  
  // Default recommendations
  recommendations.push('Consider carpooling to reduce per-person carbon emissions.');
  recommendations.push('Working from home, when possible, can eliminate commute emissions entirely.');
  
  // Mode-specific recommendations
  const hasDriving = routes.some(r => r.mode === 'driving');
  const hasTransit = routes.some(r => r.mode === 'transit');
  const hasTrain = routes.some(r => r.mode === 'train');
  const hasBiking = routes.some(r => r.mode === 'bicycling');
  const hasWalking = routes.some(r => r.mode === 'walking');
  const hasAirplane = routes.some(r => r.mode === 'airplane');
  
  if (hasDriving && (hasBiking || hasWalking)) {
    const bikingOrWalking = hasBiking ? 'biking' : 'walking';
    recommendations.push(`Switching from driving to ${bikingOrWalking} could eliminate your carbon emissions for this route.`);
  }
  
  if (hasDriving && (hasTransit || hasTrain)) {
    const transitRoute = routes.find(r => r.mode === 'transit') || routes.find(r => r.mode === 'train');
    const drivingRoute = routes.find(r => r.mode === 'driving');
    
    if (transitRoute && drivingRoute) {
      const emissionsSaved = drivingRoute.carbonEmission - transitRoute.carbonEmission;
      if (emissionsSaved > 0) {
        const transitMode = transitRoute.mode === 'transit' ? 'public transit' : 'train';
        recommendations.push(`Taking ${transitMode} instead of driving could save approximately ${emissionsSaved.toFixed(2)} kg of CO2 emissions.`);
      }
    }
  }
  
  if (hasAirplane && hasTrain) {
    const airplaneRoute = routes.find(r => r.mode === 'airplane');
    const trainRoute = routes.find(r => r.mode === 'train');
    
    if (airplaneRoute && trainRoute) {
      const emissionsSaved = airplaneRoute.carbonEmission - trainRoute.carbonEmission;
      if (emissionsSaved > 0) {
        recommendations.push(`Taking a train instead of flying could save approximately ${emissionsSaved.toFixed(2)} kg of CO2 emissions.`);
      }
    }
  }
  
  return recommendations;
} 