Hello Everyone


# GreenWays - Eco-Friendly Route Planning Application

## ⚠️ Setup Instructions ⚠️

### Prerequisites

1. **Node.js and npm** (v14+ recommended)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **Google Maps API Key**

### API Keys Required

1. **Google Maps API Key** 
   - Visit the [Google Cloud Platform Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Directions API
     - Maps JavaScript API
     - Geocoding API
   - Create an API key with appropriate restrictions
   - **Important**: Set up API key restrictions (HTTP referrers) for security

### Environment Setup

1. **Server Setup**:
   - Navigate to the `server` directory:
     ```bash
     cd server
     npm install
     ```
   - Create/edit the `.env` file with your actual values:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/greenways
     GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY
     ```
   - **MongoDB Options**:
     - Local: Use `mongodb://localhost:27017/greenways`
     - Atlas: Use your connection string from MongoDB Atlas

2. **Client Setup**:
   - Navigate to the `client` directory:
     ```bash
     cd client
     npm install
     ```
   - Create/edit the `.env` file with your actual values:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY
     ```

### Running the Application

1. **Start the Backend**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd client
   npm start
   ```

3. **Access the Application**:
   - Open your browser and navigate to: `http://localhost:3000`

### Troubleshooting

- **API Connection Issues**: 
  - Check that your Google Maps API key is correctly set in both `.env` files
  - Verify that you've enabled all required Google APIs
  - Check browser console for any API-related errors
  - Use the `/api/check` endpoint (http://localhost:5000/api/check) to verify API configuration

- **Backend Connection Issues**:
  - Ensure MongoDB is running if using a local installation
  - Check the server console for connection errors
  - Verify the MONGODB_URI in the server `.env` file is correct

- **Mock Data vs Real Data**:
  - The application uses real API calls by default
  - If you want to use mock data (for testing without API keys), set `MOCK_API=true` in `client/src/services/api.ts`

### Advanced Features

1. **Location Autocomplete**:
   - The app uses Google Places Autocomplete to suggest locations as you type
   - Select from the dropdown menu to automatically fill in location fields
   - When selecting a location, the map will automatically center on that location

2. **Mock Data Mode**:
   - If MongoDB is not available, the app will automatically switch to using mock data
   - All features will still work (route planning, saving routes, etc.)
   - API connections and error handling are designed to gracefully degrade
   
### MongoDB Configuration

The application is now configured to use MongoDB Atlas cloud database:

- **MongoDB Atlas Connection**:
  - The application is connected to a MongoDB Atlas cluster
  - Connection string: `mongodb+srv://Divyam:divyam%401909@greenways1.g0udvju.mongodb.net/?retryWrites=true&w=majority&appName=greenways1`
  - Database name: `test`

- **Local MongoDB (Alternative)**:
  - If you prefer using a local MongoDB instance, update the `MONGODB_URI` in `server/.env` to:
    ```
    MONGODB_URI=mongodb://localhost:27017/greenways
    ```
  - Ensure you have MongoDB installed and running locally

- **Without MongoDB**:
  - The application will work normally but use mock data instead
  - The server will log that it's running in "mock data mode"
  - While features like saving routes will appear to work, data won't be persisted

### Google Maps API Configuration

To enable all map features including autocomplete:

1. Ensure your Google Maps API key has the following APIs enabled:
   - Maps JavaScript API
   - Places API (for location autocomplete)
   - Directions API
   - Geocoding API

2. Set appropriate API restrictions in Google Cloud Console:
   - Add HTTP referrers to restrict usage to your domains
   - Consider adding usage quotas to prevent unexpected billing

---

## About GreenWays

GreenWays is a modern web application that helps users plan and compare different travel routes with a focus on environmental impact. The application integrates with Google Maps API to provide accurate route data while calculating carbon emissions for different transportation methods.

## Features

- **Route Comparison**: Compare multiple transportation modes (driving, transit, biking, walking) for any route
- **Carbon Emission Calculation**: View the CO2 emissions for each route option
- **Route Suggestions**: Get personalized recommendations for reducing your carbon footprint
- **User Accounts**: Create an account to save your favorite routes
- **Route History**: Track your environmental impact over time with saved routes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Material UI, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **APIs**: Google Maps API for directions and geocoding

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 