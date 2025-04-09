const axios = require('axios');

// Direct fetch to avoid any interference
async function testRegister() {
  const API_URL = 'http://127.0.0.1:5001/api';
  
  console.log('Testing registration...');
  console.log('API URL:', API_URL);
  
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Password123'
  };
  
  console.log('Request payload:', testUser);
  
  try {
    const response = await axios.post(`${API_URL}/users/register`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds
    });
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Registration failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Request details:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
  }
}

// Run the test
testRegister().then(() => {
  console.log('Test completed');
}); 