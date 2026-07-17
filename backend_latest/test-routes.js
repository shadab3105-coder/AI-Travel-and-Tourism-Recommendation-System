const express = require('express');
const app = express();

// Add the routes from server.js
app.get('/', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register endpoint hit');
  res.json({ message: 'Register endpoint works!' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login endpoint hit');
  res.json({ message: 'Login endpoint works!' });
});

// Test the routes
const testServer = app.listen(3002, () => {
  console.log('Test server running on port 3002');
  
  // Test the routes
  const http = require('http');
  
  // Test root endpoint
  http.get('http://localhost:3002/', (res) => {
    console.log('Root endpoint status:', res.statusCode);
  });
  
  // Test register endpoint
  const req = http.request('http://localhost:3002/api/auth/register', {method: 'POST'}, (res) => {
    console.log('Register endpoint status:', res.statusCode);
    testServer.close();
  });
  req.end();
});
