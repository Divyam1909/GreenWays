// Direct script to fix registration issues
const axios = require('axios');

// Test registration on both ports
async function testBothPorts() {
  const endpoints = [
    'http://localhost:5000/api/users/register',
    'http://127.0.0.1:5000/api/users/register',
    'http://localhost:5001/api/users/register',
    'http://127.0.0.1:5001/api/users/register'
  ];
  
  console.log('TESTING ALL POSSIBLE REGISTRATION ENDPOINTS');
  console.log('===========================================');
  
  // Random email to avoid duplicates
  const email = `test${Date.now()}@example.com`;
  
  const testUser = {
    name: 'Test User',
    email: email,
    password: 'Password123'
  };
  
  // Try each endpoint
  for (const endpoint of endpoints) {
    console.log(`\nTESTING ENDPOINT: ${endpoint}`);
    console.log('----------------------------------------');
    
    try {
      console.log('Sending registration request...');
      const response = await axios.post(endpoint, testUser, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5 second timeout
      });
      
      console.log('SUCCESS! Registration worked.');
      console.log('Status code:', response.status);
      console.log('Response data:', response.data);
      
      // We found a working endpoint, let's update the client's .env file
      console.log('\nRECOMMENDATION: Update client/.env to use:');
      console.log(`REACT_APP_API_URL=${endpoint.replace('/users/register', '')}`);
      
      return {
        success: true,
        endpoint: endpoint.replace('/users/register', ''),
        response: response.data
      };
    } catch (error) {
      console.log('FAILED with error:');
      if (error.code === 'ECONNREFUSED') {
        console.log('Server not running or not accepting connections');
      } else if (error.code === 'ECONNABORTED') {
        console.log('Connection timed out');
      } else if (error.response) {
        console.log('Status code:', error.response.status);
        console.log('Response data:', error.response.data);
      } else {
        console.log('Error message:', error.message);
      }
    }
  }
  
  // None of the endpoints worked
  console.log('\nALL ENDPOINTS FAILED!');
  console.log('Try starting the server with:');
  console.log('cd server && npm run dev');
  
  return { success: false };
}

// Run the test
testBothPorts().then(result => {
  if (result.success) {
    console.log('\nTest completed successfully. Found working endpoint!');
  } else {
    console.log('\nTest failed. No working endpoints found.');
  }
}); 