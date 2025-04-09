const axios = require('axios');

const API_URL = 'http://127.0.0.1:5001/api';

async function testRegister() {
  console.log('Testing registration...');
  
  try {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // Use timestamp to make email unique
      password: 'Password123'
    };
    
    console.log('Test user data:', testUser);
    
    const response = await axios.post(`${API_URL}/users/register`, testUser);
    
    console.log('Registration successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Registration failed!');
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    return null;
  }
}

async function testLogin(email, password) {
  console.log('Testing login...');
  
  try {
    const loginData = { email, password };
    console.log('Login data:', loginData);
    
    const response = await axios.post(`${API_URL}/users/login`, loginData);
    
    console.log('Login successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    return null;
  }
}

async function testHealthCheck() {
  console.log('Testing API health check...');
  
  try {
    const response = await axios.get(`${API_URL}/health`);
    
    console.log('Health check successful!');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Health check failed!');
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('=======================================');
  console.log('Starting API tests for port 5001');
  console.log('=======================================');
  
  // First test the health endpoint
  await testHealthCheck();
  
  console.log('\n---------------------------------------\n');
  
  // Test registration
  const regData = await testRegister();
  
  if (regData && regData.user && regData.user.email) {
    console.log('\n---------------------------------------\n');
    
    // Test login with the newly registered user
    await testLogin(regData.user.email, 'Password123');
  }
  
  console.log('\n=======================================');
  console.log('Tests completed');
  console.log('=======================================');
}

// Run the tests
runTests().catch(console.error); 