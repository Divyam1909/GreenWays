"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoute = exports.getUserRoutes = exports.saveRoute = exports.getRouteOptions = void 0;
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const Route_1 = __importDefault(require("../models/Route"));
// Constants for carbon emissions estimation (in kg CO2 per km)
const EMISSIONS = {
    DRIVING: 0.192, // Average car
    TRANSIT: 0.050, // Bus
    BICYCLING: 0.0,
    WALKING: 0.0,
    TRAIN: 0.035,
    CARPOOLING: 0.096 // Assuming 2 people in car
};
// Get all possible route options between two locations
const getRouteOptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { origin, destination } = req.body;
        if (!origin || !destination) {
            res.status(400).json({ message: 'Origin and destination are required' });
            return;
        }
        // Get routes for different transportation modes
        const modes = ['driving', 'transit', 'bicycling', 'walking'];
        const routePromises = modes.map(mode => getRouteFromGoogleMaps(origin, destination, mode));
        const routeResults = yield Promise.all(routePromises);
        // Process and enhance routes with carbon emissions data
        const enhancedRoutes = routeResults.map((route, index) => {
            if (!route)
                return null;
            const mode = modes[index];
            const distanceInKm = route.distance.value / 1000;
            const carbonEmission = calculateCarbonEmission(distanceInKm, mode);
            return Object.assign(Object.assign({}, route), { mode,
                carbonEmission, isGreenest: false, isFastest: false // Will be determined later
             });
        }).filter(Boolean);
        // Determine fastest and greenest routes
        if (enhancedRoutes.length > 0) {
            // Find fastest route (min duration)
            const fastestRoute = enhancedRoutes.reduce((min, route) => route.duration.value < min.duration.value ? route : min, enhancedRoutes[0]);
            // Find greenest route (min carbon emission)
            const greenestRoute = enhancedRoutes.reduce((min, route) => route.carbonEmission < min.carbonEmission ? route : min, enhancedRoutes[0]);
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
    }
    catch (error) {
        console.error('Error getting route options:', error);
        res.status(500).json({ message: 'Error getting route options', error: error.message });
    }
});
exports.getRouteOptions = getRouteOptions;
// Check MongoDB connection status
const ensureMongoDBConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    if (mongoose_1.default.connection.readyState !== mongoose_1.default.ConnectionStates.connected) {
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        const currentState = states[mongoose_1.default.connection.readyState] || 'unknown';
        console.log(`MongoDB not properly connected. Current state: ${currentState}`);
        // Attempt to reconnect if disconnected
        if (mongoose_1.default.connection.readyState === mongoose_1.default.ConnectionStates.disconnected) {
            console.log('Attempting to reconnect to MongoDB...');
            try {
                yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenways');
                console.log('Successfully reconnected to MongoDB');
                return true;
            }
            catch (err) {
                console.error('Failed to reconnect to MongoDB:', err);
                return false;
            }
        }
        return false;
    }
    return true;
});
// Save a route selected by the user
const saveRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, routeData } = req.body;
        if (!userId || !routeData) {
            res.status(400).json({ message: 'User ID and route data are required' });
            return;
        }
        // Ensure MongoDB is connected
        const isConnected = yield ensureMongoDBConnection();
        if (!isConnected) {
            res.status(503).json({ message: 'Database connection unavailable. Please try again later.' });
            return;
        }
        const newRoute = new Route_1.default({
            userId,
            origin: routeData.origin,
            destination: routeData.destination,
            distance: routeData.distance,
            duration: routeData.duration,
            mode: routeData.mode,
            carbonEmission: routeData.carbonEmission,
            date: new Date()
        });
        yield newRoute.save();
        console.log(`Route saved to MongoDB: ${newRoute._id}`);
        res.status(201).json({ message: 'Route saved successfully', route: newRoute });
    }
    catch (error) {
        console.error('Error saving route:', error);
        res.status(500).json({ message: 'Failed to save route. Database error.', error: error.message });
    }
});
exports.saveRoute = saveRoute;
// Get routes saved by a specific user
const getUserRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }
        // Ensure MongoDB is connected
        const isConnected = yield ensureMongoDBConnection();
        if (!isConnected) {
            res.status(503).json({ message: 'Database connection unavailable. Please try again later.' });
            return;
        }
        const userRoutes = yield Route_1.default.find({ userId }).sort({ date: -1 });
        console.log(`Found ${userRoutes.length} routes for user ${userId}`);
        res.status(200).json(userRoutes);
    }
    catch (error) {
        console.error('Error getting user routes:', error);
        res.status(500).json({ message: 'Failed to get saved routes. Database error.', error: error.message });
    }
});
exports.getUserRoutes = getUserRoutes;
// Delete a saved route
const deleteRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routeId } = req.params;
        if (!routeId) {
            res.status(400).json({ message: 'Route ID is required' });
            return;
        }
        // Ensure MongoDB is connected
        const isConnected = yield ensureMongoDBConnection();
        if (!isConnected) {
            res.status(503).json({ message: 'Database connection unavailable. Please try again later.' });
            return;
        }
        const deletedRoute = yield Route_1.default.findByIdAndDelete(routeId);
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
    }
    catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete route. Database error.',
            error: error.message
        });
    }
});
exports.deleteRoute = deleteRoute;
// Helper functions
function getRouteFromGoogleMaps(origin, destination, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://maps.googleapis.com/maps/api/directions/json', {
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
        }
        catch (error) {
            console.error(`Error getting ${mode} route from Google Maps:`, error);
            return null;
        }
    });
}
function calculateCarbonEmission(distanceInKm, mode) {
    const modeKey = mode.toUpperCase();
    const emissionFactor = EMISSIONS[modeKey] || EMISSIONS.DRIVING;
    return parseFloat((distanceInKm * emissionFactor).toFixed(2));
}
function generateRecommendations(routes) {
    const recommendations = [];
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
