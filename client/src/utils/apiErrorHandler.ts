import axios, { AxiosError } from 'axios';

// Define the expected response data structure
interface ApiResponseData {
  message?: string;
  [key: string]: any;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

/**
 * Standardizes error handling across API calls
 */
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponseData>;
    
    // Handle authentication errors
    if (axiosError.response?.status === 401) {
      // Clear user session on authentication failure
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      return {
        message: 'Your session has expired. Please log in again.',
        status: 401,
        details: axiosError.response?.data?.message || 'Authentication failed'
      };
    }
    
    // Handle server errors
    if (axiosError.response?.status && axiosError.response.status >= 500) {
      return {
        message: 'Server error. Please try again later.',
        status: axiosError.response.status,
        details: axiosError.response?.data?.message || axiosError.message
      };
    }
    
    // Handle database connection errors
    if (axiosError.response?.status === 503) {
      return {
        message: 'Database connection unavailable. Please try again later.',
        status: 503,
        details: axiosError.response?.data?.message || 'Service unavailable'
      };
    }
    
    // Handle other API errors with response
    if (axiosError.response?.data) {
      return {
        message: axiosError.response.data.message || 'An error occurred',
        status: axiosError.response.status,
        details: JSON.stringify(axiosError.response.data)
      };
    }
    
    // Handle network errors
    if (axiosError.code === 'ECONNABORTED' || !axiosError.response) {
      return {
        message: 'Network error. Please check your internet connection.',
        details: axiosError.message
      };
    }
  }
  
  // Handle non-Axios errors
  return {
    message: error?.message || 'An unexpected error occurred',
    details: error?.toString()
  };
};

/**
 * Check if an error is a DB connection error
 */
export const isDbConnectionError = (error: any): boolean => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponseData>;
    return axiosError.response?.status === 503 || 
           (axiosError.response?.data?.message?.includes('database') ?? false) ||
           (axiosError.response?.data?.message?.includes('MongoDB') ?? false);
  }
  return false;
};

export default handleApiError; 