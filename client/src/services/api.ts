import axios from 'axios';
import handleApiError from '../utils/apiErrorHandler';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  withCredentials: false // Changed to false to prevent CORS issues with credentials
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log detailed error information
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    const processedError = handleApiError(error);
    
    // Handle authentication errors (401) by redirecting to login
    if (error.response?.status === 401) {
      // Force logout on auth errors
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Redirect to login if we're in a browser environment
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    
    return Promise.reject(processedError);
  }
);

// Helper function to retry failed requests
const retryRequest = async (apiCall: () => Promise<any>, maxRetries = 3, delay = 1000) => {
  let retries = 0;
  
  const execute = async (): Promise<any> => {
    try {
      return await apiCall();
    } catch (error: any) {
      if (
        retries < maxRetries && 
        (error.status === 503 || error.status === 504 || error.message.includes('network'))
      ) {
        retries++;
        console.log(`Retrying API call (${retries}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return execute();
      }
      throw error;
    }
  };
  
  return execute();
};

// Routes API
export const getRouteOptions = async (origin: string, destination: string) => {
  try {
    return await retryRequest(async () => {
      const response = await api.post('/routes/options', { origin, destination });
      return response.data;
    });
  } catch (error) {
    console.error('API Error:', error);
    throw error; // Re-throw the error to be handled by the component
  }
};

export const saveRoute = async (userId: string, routeData: any) => {
  try {
    const response = await api.post('/routes/save', { userId, routeData });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getUserRoutes = async (userId: string) => {
  try {
    return await retryRequest(async () => {
      const response = await api.get(`/routes/user/${userId}`);
      return response.data;
    });
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deleteRoute = async (routeId: string) => {
  try {
    const response = await api.delete(`/routes/${routeId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User API
export const registerUser = async (userData: { name: string; email: string; password: string }) => {
  // List of endpoints to try in order
  const endpoints = [
    { baseURL: API_URL, label: 'Primary endpoint' },
    { baseURL: 'http://localhost:5000/api', label: 'Localhost:5000' },
    { baseURL: 'http://127.0.0.1:5000/api', label: '127.0.0.1:5000' },
    { baseURL: 'http://localhost:5001/api', label: 'Localhost:5001' },
    { baseURL: 'http://127.0.0.1:5001/api', label: '127.0.0.1:5001' }
  ];
  
  console.log(`[Registration] Attempting to register user with:`, { ...userData, password: '****' });
  
  let lastError = null;
  
  // Try each endpoint until one works
  for (const endpoint of endpoints) {
    try {
      console.log(`[Registration] Trying ${endpoint.label}: ${endpoint.baseURL}/users/register`);
      
      const instance = axios.create({
        baseURL: endpoint.baseURL,
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      const response = await instance.post('/users/register', userData);
      console.log(`[Registration] SUCCESS with ${endpoint.label}:`, response.status);
      return response.data;
    } catch (error: any) {
      // Capture and log the error, but continue trying other endpoints
      console.log(`[Registration] FAILED with ${endpoint.label}:`, 
                  error.code || error.response?.status || error.message);
      lastError = error;
    }
  }
  
  // If we get here, all endpoints failed
  console.error('[Registration] All endpoints failed. Last error:', lastError);
  throw lastError;
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  // List of endpoints to try in order
  const endpoints = [
    { baseURL: API_URL, label: 'Primary endpoint' },
    { baseURL: 'http://localhost:5000/api', label: 'Localhost:5000' },
    { baseURL: 'http://127.0.0.1:5000/api', label: '127.0.0.1:5000' },
    { baseURL: 'http://localhost:5001/api', label: 'Localhost:5001' },
    { baseURL: 'http://127.0.0.1:5001/api', label: '127.0.0.1:5001' }
  ];
  
  console.log(`[Login] Attempting to login user:`, { email: credentials.email, password: '****' });
  
  let lastError = null;
  
  // Try each endpoint until one works
  for (const endpoint of endpoints) {
    try {
      console.log(`[Login] Trying ${endpoint.label}: ${endpoint.baseURL}/users/login`);
      
      const instance = axios.create({
        baseURL: endpoint.baseURL,
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      const response = await instance.post('/users/login', credentials);
      console.log(`[Login] SUCCESS with ${endpoint.label}:`, response.status);
      return response.data;
    } catch (error: any) {
      // Capture and log the error, but continue trying other endpoints
      console.log(`[Login] FAILED with ${endpoint.label}:`, 
                  error.code || error.response?.status || error.message);
      lastError = error;
    }
  }
  
  // If we get here, all endpoints failed
  console.error('[Login] All endpoints failed. Last error:', lastError);
  throw lastError;
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    return await retryRequest(async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    });
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Check the health of the API and database connection
export const checkApiHealth = async () => {
  try {
    return await retryRequest(async () => {
      // Try both endpoints for compatibility
      try {
        const response = await api.get('/health');
        return response.data;
      } catch (innerError) {
        console.log('Falling back to /check endpoint');
        const response = await api.get('/check');
        return response.data;
      }
    }, 2, 500); // Only retry twice with 500ms delay
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

export default api; 