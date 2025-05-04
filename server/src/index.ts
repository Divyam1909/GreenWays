import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import routeRoutes from './routes/routes';
import userRoutes from './routes/userRoutes';
import flightsRouter from './routes/flights';

dotenv.config();

const app: Express = express();
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
  app.use(cors(corsOptions));
} else {
  // In development, allow all origins for easier debugging
  app.use(cors());
  console.log('CORS: Allowing all origins in development mode');
}
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/greenways';
console.log(`Attempting to connect to MongoDB at: ${mongoURI.split('@')[1] || 'localhost'}`);

// Configure mongoose settings
mongoose.set('bufferTimeoutMS', 30000); // Increase timeout for Atlas connections
mongoose.set('strictQuery', true);      // Strict schema validation

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
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(mongoURI, mongooseOptions);
    console.log('✅ Connected to MongoDB successfully');
    if (mongoose.connection.db) {
      console.log('Database name:', mongoose.connection.db.databaseName);
    }
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', (err as Error).message);
    console.log('The server will continue running, but database operations will fail');
    return false;
  }
};

// Initial connection
connectToMongoDB();

// Properly handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
  setTimeout(connectToMongoDB, 5000); // Try to reconnect after 5 seconds
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  console.log('Will attempt to reconnect automatically');
});

// Set up a periodic connection check
setInterval(async () => {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    try {
      // Check if connection is really working with a simple operation
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        console.log('MongoDB connection is healthy');
      } else {
        console.log('MongoDB connection exists but database reference is undefined');
        // Force reconnect
        mongoose.connection.close(true).catch(console.error);
      }
    } catch (err) {
      console.log('MongoDB connection check failed:', (err as Error).message);
      // Force close the connection to trigger a reconnect
      mongoose.connection.close(true).catch(console.error);
    }
  } else if (mongoose.connection.readyState !== mongoose.ConnectionStates.connecting) {
    console.log('MongoDB not connected. Current state:', mongoose.connection.readyState);
    connectToMongoDB().catch(console.error);
  }
}, 60000); // Every 60 seconds

// Clean up MongoDB connection on app termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB connection close:', err);
    process.exit(1);
  }
});

// Routes
app.use('/api/routes', routeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flights', flightsRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API check endpoint
app.get('/api/check', async (req: Request, res: Response) => {
  try {
    // Check if Google Maps API key is configured
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const hasValidGoogleMapsKey = googleMapsApiKey && googleMapsApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';
    
    // Check MongoDB connection
    const isMongoConnected = mongoose.connection.readyState === mongoose.ConnectionStates.connected;
    
    // Get MongoDB connection details
    let mongoDetails = {
      status: isMongoConnected ? 'connected' : 'disconnected',
      host: 'Not available',
      database: 'Not available'
    };

    if (isMongoConnected && mongoose.connection.db) {
      mongoDetails.host = mongoose.connection.host || 'Unknown';
      mongoDetails.database = mongoose.connection.db.databaseName;
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
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error checking API configuration',
      error: (error as Error).message
    });
  }
});

// Start server
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server URL: http://localhost:${port}`);
});

export default app; 