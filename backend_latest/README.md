# Travel Booking API - Backend

A comprehensive Node.js/Express backend for a travel booking application with flight search and booking functionality.

## 🚀 Features

- **Authentication System**: JWT-based authentication with email/password and mobile registration
- **Flight Management**: Complete flight search, booking, and management system
- **Database Integration**: MySQL with Sequelize ORM
- **RESTful API**: Well-structured endpoints for all operations
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Password hashing, JWT tokens, input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flights?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3001
   ```

4. **MongoDB Atlas Setup**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string from Atlas
   - Update the connection string in `.env`
   - Make sure your IP address is whitelisted in Atlas

## 🗄️ Database Setup

### Seed the Database with Sample Flights

```bash
# Run the seed script to populate the database with sample flights
node seed-flights.js
```

This will create sample flights between major Indian cities:
- Delhi ↔ Mumbai
- Delhi ↔ Bangalore
- Delhi ↔ Kolkata
- Mumbai ↔ Bangalore

## 🚀 Running the Application

```bash
# Start the server
npm start

# The server will run on http://localhost:3001
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp-mobile` - Send OTP to mobile
- `POST /api/auth/verify-otp-mobile` - Verify mobile OTP
- `POST /api/auth/register-mobile` - Register with mobile OTP
- `GET /api/profile` - Get user profile (protected)

### Flights
- `GET /api/flights/search` - Search flights
- `GET /api/flights/:id` - Get flight details
- `POST /api/flights/book` - Book a flight (protected)

### Bookings
- `GET /api/bookings` - Get user bookings (protected)
- `GET /api/bookings/:id` - Get booking details (protected)

## 🔍 Flight Search API

### Search Parameters
```javascript
GET /api/flights/search?departureCity=Delhi&arrivalCity=Mumbai&departureDate=2024-12-25&returnDate=2024-12-30&passengers=2&travelClass=economy
```

**Required Parameters:**
- `departureCity` - City of departure
- `arrivalCity` - City of arrival
- `departureDate` - Departure date (YYYY-MM-DD)

**Optional Parameters:**
- `returnDate` - Return date for round-trip (YYYY-MM-DD)
- `passengers` - Number of passengers (default: 1)
- `travelClass` - Travel class: economy, business, first (default: economy)

### Response Format
```json
{
  "outboundFlights": [
    {
      "flightNumber": "AI101",
      "airline": "Air India",
      "departure": {
        "city": "Delhi",
        "airport": "DEL",
        "date": "2024-12-25T10:00:00.000Z",
        "time": "10:00"
      },
      "arrival": {
        "city": "Mumbai",
        "airport": "BOM",
        "date": "2024-12-25T12:00:00.000Z",
        "time": "12:00"
      },
      "duration": "2h 0m",
      "class": {
        "economy": {
          "price": 5000,
          "availableSeats": 120
        },
        "business": {
          "price": 15000,
          "availableSeats": 15
        },
        "first": {
          "price": 25000,
          "availableSeats": 8
        }
      }
    }
  ],
  "returnFlights": null,
  "searchCriteria": {
    "departureCity": "Delhi",
    "arrivalCity": "Mumbai",
    "departureDate": "2024-12-25",
    "returnDate": null,
    "passengers": 1,
    "travelClass": "economy"
  }
}
```

## 🎫 Flight Booking API

### Booking Request
```javascript
POST /api/flights/book
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "flightId": "507f1f77bcf86cd799439011",
  "travelClass": "economy",
  "numberOfPassengers": 2,
  "passengerDetails": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dateOfBirth": "1990-01-01",
      "passportNumber": "P1234567"
    }
  ],
  "specialRequests": "Window seat preferred"
}
```

### Booking Response
```json
{
  "message": "Flight booked successfully",
  "booking": {
    "id": "507f1f77bcf86cd799439011",
    "bookingReference": "BK1703123456789ABCD",
    "flight": {
      "flightNumber": "AI101",
      "airline": "Air India",
      "departure": {
        "city": "Delhi",
        "airport": "DEL"
      },
      "arrival": {
        "city": "Mumbai",
        "airport": "BOM"
      }
    },
    "travelClass": "economy",
    "numberOfPassengers": 2,
    "totalPrice": 10000,
    "bookingDate": "2024-12-20T10:30:00.000Z"
  }
}
```

## 🧪 Testing

### Test Flight Search
```bash
# Run the flight search test
node test-flight-search.js
```

### Manual Testing with cURL

1. **Search Flights**
```bash
curl "http://localhost:3001/api/flights/search?departureCity=Delhi&arrivalCity=Mumbai&departureDate=2024-12-25"
```

2. **Register User**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

3. **Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔧 Troubleshooting

### MongoDB Connection Issues

1. **DNS Resolution Error**: `querySrv ENOTFOUND`
   - Check your MongoDB Atlas cluster name
   - Verify the connection string format
   - Ensure your IP is whitelisted in Atlas

2. **Authentication Error**
   - Verify username and password in connection string
   - Check database user permissions in Atlas

3. **Network Access**
   - Add your IP address to Atlas network access
   - Or set 0.0.0.0/0 for testing (not recommended for production)

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3001
   npx kill-port 3001
   ```

2. **Module Not Found**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment Variables Not Loading**
   - Ensure `.env` file exists in backend directory
   - Check variable names match exactly

## 📁 Project Structure

```
backend/
├── models/
│   ├── Flight.js          # Flight data model
│   └── Booking.js         # Booking data model
├── server.js              # Main server file
├── seed-flights.js        # Database seeding script
├── test-flight-search.js  # Flight search testing
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
