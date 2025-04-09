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
  CARPOOLING: 0.096 // Assuming 2 people in car
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

// Get all possible route options between two locations
export const getRouteOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
      res.status(400).json({ message: 'Origin and destination are required' });
      return;
    }

    // Get routes for different transportation modes
    const modes = ['driving', 'transit', 'bicycling', 'walking'];
    const routePromises = modes.map(mode => 
      getRouteFromGoogleMaps(origin, destination, mode)
    );

    const routeResults = await Promise.all(routePromises);
    
    // Process and enhance routes with carbon emissions data
    const enhancedRoutes = routeResults.map((route, index) => {
      if (!route) return null;
      
      const mode = modes[index];
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
  const modeKey = mode.toUpperCase() as keyof typeof EMISSIONS;
  const emissionFactor = EMISSIONS[modeKey] || EMISSIONS.DRIVING;
  return parseFloat((distanceInKm * emissionFactor).toFixed(2));
}

function generateRecommendations(routes: RouteResponse[]): string[] {
  const recommendations: string[] = [];
  
  // Default recommendations
  recommendations.push('Consider carpooling to reduce per-person carbon emissions.');
  recommendations.push('Working from home, when possible, can eliminate commute emissions entirely.');
  
  // Mode-specific recommendations
  const hasDriving = routes.some(r => r.mode === 'driving');
  const hasTransit = routes.some(r => r.mode === 'transit');
  const hasBiking = routes.some(r => r.mode === 'bicycling');
  const hasWalking = routes.some(r => r.mode === 'walking');
  
  if (hasDriving && (hasBiking || hasWalking)) {
    const bikingOrWalking = hasBiking ? 'biking' : 'walking';
    recommendations.push(`Switching from driving to ${bikingOrWalking} could eliminate your carbon emissions for this route.`);
  }
  
  if (hasDriving && hasTransit) {
    const transitRoute = routes.find(r => r.mode === 'transit');
    const drivingRoute = routes.find(r => r.mode === 'driving');
    
    if (transitRoute && drivingRoute) {
      const emissionsSaved = drivingRoute.carbonEmission - transitRoute.carbonEmission;
      if (emissionsSaved > 0) {
        recommendations.push(`Taking public transit instead of driving could save approximately ${emissionsSaved.toFixed(2)} kg of CO2 emissions.`);
      }
    }
  }
  
  return recommendations;
} 