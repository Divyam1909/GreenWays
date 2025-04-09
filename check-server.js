const http = require('http');

// Simple function to test server connectivity
function checkServer() {
  console.log('Checking server connectivity...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('BODY:', data);
      console.log('\nServer is reachable and responding to requests.');
    });
  });
  
  req.on('error', (e) => {
    console.error('\nError connecting to server:');
    console.error(`Problem: ${e.message}`);
    console.error('\nPossible issues:');
    console.error('1. Server is not running');
    console.error('2. Server is running on a different port');
    console.error('3. Firewall is blocking the connection');
    console.error('4. Network configuration issue');
  });
  
  req.on('timeout', () => {
    console.error('\nTimeout connecting to server');
    req.destroy();
  });
  
  req.end();
}

// Try to register a user
function testRegister() {
  console.log('\nTesting user registration...');
  
  const data = JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    timeout: 5000
  };
  
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('RESPONSE:', responseData);
      
      if (res.statusCode === 201) {
        console.log('\nRegistration successful!');
      } else if (res.statusCode === 400) {
        console.log('\nRegistration failed - check the error message');
      } else {
        console.log('\nUnexpected response code - check the server logs');
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('\nError in registration request:');
    console.error(`Problem: ${e.message}`);
  });
  
  req.on('timeout', () => {
    console.error('\nTimeout in registration request');
    req.destroy();
  });
  
  req.write(data);
  req.end();
}

// Run the tests
checkServer();
setTimeout(testRegister, 1000); // Wait 1 second before trying registration 