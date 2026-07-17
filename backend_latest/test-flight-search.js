import http from 'http';

const testFlightSearch = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/flights/search?departureCity=Delhi&arrivalCity=Mumbai&departureDate=2024-12-25',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: JSON.parse(data)
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        error: error.message
      });
    });

    req.end();
  });
};

const testFlightBooking = () => {
  return new Promise((resolve) => {
    const bookingData = {
      flightId: '507f1f77bcf86cd799439011', // Example flight ID
      travelClass: 'economy',
      numberOfPassengers: 2,
      passengerDetails: [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
          passportNumber: 'P1234567'
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '+1234567891',
          dateOfBirth: '1992-01-01',
          passportNumber: 'P1234568'
        }
      ],
      specialRequests: 'Window seat preferred'
    };

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/flights/book',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: JSON.parse(data)
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        error: error.message
      });
    });

    req.write(JSON.stringify(bookingData));
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Testing Flight Search API...\n');

  // Test flight search
  console.log('1. Testing Flight Search:');
  const searchResult = await testFlightSearch();

  if (searchResult.error) {
    console.log('❌ Flight search failed:', searchResult.error);
  } else {
    console.log(`✅ Status: ${searchResult.status}`);
    if (searchResult.data.outboundFlights && searchResult.data.outboundFlights.length > 0) {
      console.log(`📋 Found ${searchResult.data.outboundFlights.length} flights`);
      searchResult.data.outboundFlights.forEach(flight => {
        console.log(`   ✈️  ${flight.flightNumber} - ${flight.airline}`);
        console.log(`      ${flight.departure.city} → ${flight.arrival.city}`);
        console.log(`      ${flight.departure.time} - ${flight.arrival.time}`);
        console.log(`      Economy: ₹${flight.class.economy.price}`);
      });
    } else {
      console.log('📋 No flights found');
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test flight booking (commented out since it requires authentication)
  console.log('2. Flight Booking Test (requires authentication):');
  console.log('   To test booking, you need to:');
  console.log('   1. Register/Login to get JWT token');
  console.log('   2. Replace YOUR_JWT_TOKEN_HERE in the test');
  console.log('   3. Use a valid flight ID from the search results');

  console.log('\n📝 Sample booking curl command:');
  console.log(`curl -X POST http://localhost:3001/api/flights/book \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "flightId": "FLIGHT_ID_HERE",
    "travelClass": "economy",
    "numberOfPassengers": 1,
    "passengerDetails": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dateOfBirth": "1990-01-01",
      "passportNumber": "P1234567"
    }
  }'`);
}

runTests();
