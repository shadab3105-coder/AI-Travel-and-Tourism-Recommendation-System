const http = require('http');

const endpoints = [
  '/',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/register-mobile',
  '/api/profile'
];

function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          endpoint,
          method,
          status: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint,
        method,
        error: error.message
      });
    });

    if (data && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('Testing endpoints on localhost:3001...\n');
  
  for (const endpoint of endpoints) {
    const method = endpoint === '/' ? 'GET' : 'POST';
    let data = null;
    
    if (endpoint === '/api/auth/register') {
      data = { email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' };
    }
    
    const result = await testEndpoint(endpoint, method, data);
    console.log(`${method} ${endpoint}: ${result.status || 'ERROR'}`);
    
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    
    console.log('---');
  }
}

testAllEndpoints();
