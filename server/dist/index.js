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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes/routes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Configure CORS with proper options
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourproductionsite.com', 'https://www.yourproductionsite.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // Changed to false to avoid CORS preflight issues
    maxAge: 86400 // Cache preflight requests for 24 hours
};
// Middleware
if (process.env.NODE_ENV === 'production') {
    app.use((0, cors_1.default)(corsOptions));
}
else {
    // In development, allow all origins for easier debugging
    app.use((0, cors_1.default)());
    console.log('CORS: Allowing all origins in development mode');
}
app.use(express_1.default.json());
// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/greenways';
console.log(`Attempting to connect to MongoDB at: ${mongoURI.split('@')[1] || 'localhost'}`);
// Configure mongoose settings
mongoose_1.default.set('bufferTimeoutMS', 30000); // Increase timeout for Atlas connections
mongoose_1.default.set('strictQuery', true); // Strict schema validation
// Create connection options
const mongooseOptions = {
    serverSelectionTimeoutMS: 10000, // Increase for cloud connections
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10, // Maximum number of sockets
    retryWrites: true
};
// Function to connect to MongoDB
const connectToMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(mongoURI, mongooseOptions);
        console.log('✅ Connected to MongoDB successfully');
        if (mongoose_1.default.connection.db) {
            console.log('Database name:', mongoose_1.default.connection.db.databaseName);
        }
        return true;
    }
    catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('The server will continue running, but database operations will fail');
        return false;
    }
});
// Initial connection
connectToMongoDB();
// Properly handle connection events
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected! Attempting to reconnect...');
    setTimeout(connectToMongoDB, 5000); // Try to reconnect after 5 seconds
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    console.log('Will attempt to reconnect automatically');
});
// Set up a periodic connection check
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    if (mongoose_1.default.connection.readyState === mongoose_1.default.ConnectionStates.connected) {
        try {
            // Check if connection is really working with a simple operation
            if (mongoose_1.default.connection.db) {
                yield mongoose_1.default.connection.db.admin().ping();
                console.log('MongoDB connection is healthy');
            }
            else {
                console.log('MongoDB connection exists but database reference is undefined');
                // Force reconnect
                mongoose_1.default.connection.close(true).catch(console.error);
            }
        }
        catch (err) {
            console.log('MongoDB connection check failed:', err.message);
            // Force close the connection to trigger a reconnect
            mongoose_1.default.connection.close(true).catch(console.error);
        }
    }
    else if (mongoose_1.default.connection.readyState !== mongoose_1.default.ConnectionStates.connecting) {
        console.log('MongoDB not connected. Current state:', mongoose_1.default.connection.readyState);
        connectToMongoDB().catch(console.error);
    }
}), 60000); // Every 60 seconds
// Clean up MongoDB connection on app termination
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    }
    catch (err) {
        console.error('Error during MongoDB connection close:', err);
        process.exit(1);
    }
}));
// Routes
app.use('/api/routes', routes_1.default);
app.use('/api/users', userRoutes_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// API check endpoint
app.get('/api/check', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if Google Maps API key is configured
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const hasValidGoogleMapsKey = googleMapsApiKey && googleMapsApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';
        // Check MongoDB connection
        const isMongoConnected = mongoose_1.default.connection.readyState === mongoose_1.default.ConnectionStates.connected;
        // Get MongoDB connection details
        let mongoDetails = {
            status: isMongoConnected ? 'connected' : 'disconnected',
            host: 'Not available',
            database: 'Not available'
        };
        if (isMongoConnected && mongoose_1.default.connection.db) {
            mongoDetails.host = mongoose_1.default.connection.host || 'Unknown';
            mongoDetails.database = mongoose_1.default.connection.db.databaseName;
        }
        res.status(200).json({
            status: 'ok',
            services: {
                mongodb: {
                    connected: isMongoConnected,
                    details: mongoDetails
                },
                googleMaps: {
                    configured: hasValidGoogleMapsKey,
                    key: hasValidGoogleMapsKey ? 'Configured' : 'Not configured or using placeholder'
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error checking API configuration',
            error: error.message
        });
    }
}));
// Start server
app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Server URL: http://localhost:${port}`);
});
exports.default = app;
