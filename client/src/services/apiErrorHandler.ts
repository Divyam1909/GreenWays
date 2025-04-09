// API Error Handler
const apiErrorHandler = (error: any) => {
  // Extract error message from response if available
  const errorMessage = error.response?.data?.message || 
                      error.message || 
                      'An unexpected error occurred';
  
  // Log the error for debugging
  console.error('API Error:', error);
  
  return {
    error: true,
    message: errorMessage
  };
};

export default apiErrorHandler; 