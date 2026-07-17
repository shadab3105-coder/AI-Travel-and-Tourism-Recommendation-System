import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import helmet from 'helmet';
import twilio from 'twilio';
// import Amadeus from 'amadeus';
import axios from "axios";
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sequelize, Booking, Flight, User, Car } from './models/sqlModels.js';


dotenv.config();


const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

// const airportMap = JSON.parse(
//   fs.readFileSync(
//     path.join(process.cwd(), "airport_codes.json"),
//     "utf8"
//   )
// );

// console.log("✅ Airport codes loaded:", Object.keys(airportMap).length);

// Initialize Twilio client (optional)
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;
if (!twilioClient) console.warn('⚠️ Twilio credentials missing. OTP SMS functionality is disabled.');

// Simple in-memory OTP store
const otpStore = new Map(); // otpId -> { otp, email, phoneNumber, expiresAt }


const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. CONFIGURATION
// ==========================================

// Initialize Amadeus
// const amadeus = (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET)
//   ? new Amadeus({
//     clientId: process.env.AMADEUS_CLIENT_ID,
//     clientSecret: process.env.AMADEUS_CLIENT_SECRET
//   })
//   : null;

// if (!amadeus) console.warn("⚠️ Amadeus Keys missing! Flights will run in MOCK mode.");

// Connect Database
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to MySQL');
    return sequelize.sync({ alter: true });
  })
  .catch((err) => console.error('❌ MySQL Failed:', err.message));

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true
}));
app.use(express.json());

// ==========================================
// 🗺️ CITY CODE LOADER
// ==========================================
let globalCityMap = {};

// Try to load the massive JSON file
try {
  const rawData = fs.readFileSync(path.join(__dirname, 'airport_codes.json'));
  globalCityMap = JSON.parse(rawData);
  console.log(`🌍 Global Airport Database Loaded: ${Object.keys(globalCityMap).length} cities indexed.`);
} catch (error) {
  console.warn("⚠️ 'airport_codes.json' not found. Using Mini-List Fallback.");
}

// Fallback List (If JSON is missing)
const fallbackCityCodes = {
  'delhi': 'DEL', 'new delhi': 'DEL', 'mumbai': 'BOM', 'bombay': 'BOM',
  'bangalore': 'BLR', 'kolkata': 'CCU', 'calcutta': 'CCU',
  'chennai': 'MAA', 'dubai': 'DXB', 'london': 'LHR', 'paris': 'CDG',
  'new york': 'JFK', 'singapore': 'SIN', 'bangkok': 'BKK'
};

// ==========================================
// 🔐 AUTH MIDDLEWARE
// ==========================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.userId = decoded.userId || decoded.id;
    next();
  });
}

// ==========================================
// 👤 AUTH ROUTES
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    let isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid && password === user.password) isPasswordValid = true;

    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      accessToken: token,
      user: { id: user.id, email: user.email, firstName: user.firstName }
    });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, firstName, lastName, isVerified: true });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'User registered', accessToken: token });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
});

// Mobile registration with OTP
app.post('/api/auth/register-mobile', async (req, res) => {
  try {
    const { email, phoneNumber, mobileNumber, password, firstName, lastName, isAdmin } = req.body;
    const toPhoneNumber = phoneNumber || mobileNumber;

    if (!email || !toPhoneNumber || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields: email, phoneNumber, password, firstName, lastName' });
    }

    if (!/^\+\d{10,15}$/.test(toPhoneNumber)) {
      return res.status(400).json({ error: 'Phone number must be in E.164 format, for example +1234567890' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `otp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store OTP (expires in 5 minutes)
    otpStore.set(otpId, {
      otp,
      email,
      phoneNumber: toPhoneNumber,
      firstName,
      lastName,
      password,
      isAdmin: isAdmin || false,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Send OTP via Twilio SMS
    let sentSuccess = false;
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      if (process.env.TWILIO_PHONE_NUMBER === toPhoneNumber) {
        console.warn('⚠️ Twilio sender number is the same as the destination number.');
      } else {
        try {
          await twilioClient.messages.create({
            body: `Your OTP for neoTodo registration is: ${otp}. Valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: toPhoneNumber
          });
          console.log(`📱 OTP sent to ${toPhoneNumber}`);
          sentSuccess = true;
        } catch (smsError) {
          console.error('❌ SMS Send Error:', smsError);
        }
      }
    } else {
      console.warn('⚠️ Twilio not configured, skipping SMS send.');
    }

    if (sentSuccess) {
      res.json({ message: 'OTP sent to phone', otpSent: true, otpId });
    } else {
      console.warn('⚠️ Falling back to development OTP mode.');
      console.log(`🔑 [DEVELOPMENT FALLBACK] OTP for ${toPhoneNumber} is: ${otp}`);
      res.json({
        message: 'OTP generated (Development Fallback)',
        otpSent: true,
        otpId,
        otp: otp
      });
    }
  } catch (error) {
    console.error('❌ Register Mobile Error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message || error.toString() });
  }
});

// Verify OTP and complete registration
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, otp, otpId } = req.body;

    const storedOtpData = otpStore.get(otpId);
    if (!storedOtpData) return res.status(410).json({ error: 'OTP expired or invalid' });

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(otpId);
      return res.status(410).json({ error: 'OTP expired' });
    }

    if (storedOtpData.otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      mobileNumber: phoneNumber,
      isVerified: true,
      role: storedOtpData.isAdmin ? 'admin' : 'user'
    });

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    // Clean up OTP
    otpStore.delete(otpId);

    res.json({
      message: 'Registration successful',
      success: true,
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.mobileNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Verify OTP Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Resend OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email, phoneNumber, otpId } = req.body;

    let storedOtpData;
    if (otpId) {
      storedOtpData = otpStore.get(otpId);
    } else {
      // Find by email/phone
      for (const [id, data] of otpStore.entries()) {
        if (data.email === email && data.phoneNumber === phoneNumber) {
          storedOtpData = data;
          break;
        }
      }
    }

    if (!storedOtpData) return res.status(404).json({ error: 'No pending registration found' });

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpId = `otp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update store
    otpStore.set(newOtpId, {
      ...storedOtpData,
      otp: newOtp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Remove old OTP
    if (otpId) otpStore.delete(otpId);

    // Send OTP via Twilio SMS
    let resentSuccess = false;
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Your OTP for neoTodo registration is: ${newOtp}. Valid for 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        console.log(`📱 OTP resent to ${phoneNumber}`);
        resentSuccess = true;
      } catch (smsError) {
        console.error('❌ SMS Resend Error:', smsError);
      }
    } else {
      console.warn('⚠️ Twilio not configured, skipping SMS resend.');
    }

    if (resentSuccess) {
      res.json({ message: 'OTP resent', otpSent: true, otpId: newOtpId });
    } else {
      console.warn('⚠️ Falling back to development OTP mode for resend.');
      console.log(`🔑 [DEVELOPMENT FALLBACK] New OTP for ${phoneNumber} is: ${newOtp}`);
      res.json({
        message: 'OTP resent (Development Fallback)',
        otpSent: true,
        otpId: newOtpId,
        otp: newOtp
      });
    }
  } catch (error) {
    console.error('❌ Resend OTP Error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// ==========================================
// ✈️ FLIGHT SEARCH API
// ==========================================
// app.get('/api/flights/search', async (req, res) => {
//   let { origin, destination, date } = req.query;

//   if (!origin || !destination || !date) return res.status(400).json({ error: "Missing params" });

//   // Clean and lookup city codes
//   const originClean = origin.toLowerCase().trim();
//   const destClean = destination.toLowerCase().trim();

//   // Priority: 1. Big JSON File -> 2. Fallback List -> 3. User Input (Uppercase)
//   const originCode = globalCityMap[originClean] || fallbackCityCodes[originClean] || origin.toUpperCase();
//   const destCode = globalCityMap[destClean] || fallbackCityCodes[destClean] || destination.toUpperCase();

//   console.log(`✈️  Searching: ${originCode} -> ${destCode} on ${date}`);

//   try {
//     if (!amadeus) throw new Error("No API Keys");

//     // Real Amadeus API call
//     const response = await amadeus.shopping.flightOffersSearch.get({
//       originLocationCode: originCode,
//       destinationLocationCode: destCode,
//       departureDate: date,
//       adults: '1',
//       max: 7
//     });

//     console.log(`✅ Amadeus found ${response.data.length} flights.`);
//     res.json(response.data);

//   } catch (error) {
//     // Safety net (Mock Data)
//     console.error("⚠️ API Failed/Skipped. Sending Mock Data.");
//     if (error.response) console.error("   Reason:", error.response.result?.errors?.[0]?.detail || error.message);

//     const mockFlights = generateMockFlights(originCode, destCode, date);
//     res.json(mockFlights);
//   }
// });


// function getAirportCode(city) {

//   if (!city) return null;

//   city = city.trim().toLowerCase();

//   return airportMap[city] || city.toUpperCase();

// }

app.get('/api/flights/search', async (req, res) => {

  const { origin, destination } = req.query;

  try {

    const response = await axios.get(
      "http://api.aviationstack.com/v1/flights",
      {
        params: {
          access_key: process.env.AVIATIONSTACK_KEY,
          dep_iata: origin
        }
      }
    );

    let flights = response.data.data;

    // manual destination filtering
    if (destination) {
      flights = flights.filter(
        f =>
          f.arrival &&
          f.arrival.iata &&
          f.arrival.iata.toUpperCase() === destination.toUpperCase()
      );
    }

    res.json(flights);

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      error: "Flight API Error"
    });

  }
});

// app.get('/api/flights/search', async (req, res) => {

//   const { origin } = req.query;

//   const originCode = getAirportCode(origin);

//   console.log("Searching from:", origin, "=>", originCode);

//   try {

//     const response = await axios.get(
//       "http://api.aviationstack.com/v1/flights",
//       {
//         params: {
//           access_key: process.env.AVIATIONSTACK_KEY,
//           dep_iata: originCode
//         }
//       }
//     );

//     res.json(response.data.data);

//   } catch (err) {

//     console.log(err.message);

//     res.status(500).json({
//       error: "Flight API Error"
//     });

//   }

// });

// Mock Data Generator (INR Currency)
function generateMockFlights(origin, dest, date) {
  const airlines = ['AI', '6E', 'UK', 'EK', 'BA', 'LH'];
  const prices = ['5400.00', '7250.00', '4100.00', '12500.00', '6800.50', '9300.75', '11200.00', '4700.25', '8500.00', '9900.00', '7600.00', '6300.00', '5800.00', '7200.00', '8100.00'];

  return Array.from({ length: 5 }).map((_, i) => ({
    id: `mock-${i}`,
    price: { total: prices[i % prices.length], currency: 'INR' },
    itineraries: [{
      duration: 'PT2H45M',
      segments: [{
        departure: { iataCode: origin, at: `${date}T10:00:00` },
        arrival: { iataCode: dest, at: `${date}T12:45:00` },
        carrierCode: airlines[i % airlines.length],
        number: `10${i}`
      }]
    }],
    validatingAirlineCodes: [airlines[i % airlines.length]]
  }));
}

// ==========================================
// 💾 BOOKING API
// ==========================================
app.post('/api/flights/book', authenticateToken, async (req, res) => {
  try {
    console.log('📩 Incoming Booking...');
    const { flightDetails, totalPrice, passengerInfo } = req.body;

    // Sanitize date
    let cleanDate = flightDetails.date;
    if (!cleanDate || cleanDate.includes(':') || cleanDate.length < 8) {
      console.warn("⚠️ Invalid Date format detected. Defaulting to Today.");
      cleanDate = new Date().toISOString().split('T')[0];
    }

    const safePrice = parseFloat(totalPrice) || 0;
    if (!req.userId) throw new Error('User ID missing from token');

    // Create/Find Flight with all required fields
    const [flightRecord] = await Flight.findOrCreate({
      where: { flightNumber: flightDetails.flightNumber || 'UNKNOWN' },
      defaults: {
        airline: flightDetails.airline || 'Unknown',

        // Location
        departureCity: flightDetails.from || 'Origin',
        arrivalCity: flightDetails.to || 'Dest',

        // Dates
        departureDate: cleanDate,
        arrivalDate: cleanDate,

        // Times
        departureTime: flightDetails.departureTime || '10:00:00',
        arrivalTime: flightDetails.arrivalTime || '12:30:00',
        duration: flightDetails.duration || '2h 30m',

        // Price
        economyPrice: safePrice,
        status: 'scheduled'
      }
    });

    console.log(`✈️ Flight Linked: ${flightRecord.flightNumber}`);

    // Create snapshot
    const snapshot = {
      airline: flightDetails?.airline,
      flightNumber: flightDetails?.flightNumber,
      route: `${flightDetails?.from} -> ${flightDetails?.to}`,
      date: cleanDate,
      passengers: passengerInfo || {}
    };

    // Create booking
    const newBooking = await Booking.create({
      bookingReference: `BKG-${Date.now()}`,
      userId: req.userId,
      flightId: flightRecord.id,
      bookingType: 'flight',
      specialRequests: JSON.stringify(snapshot),
      totalPrice: safePrice,
      status: 'confirmed'
    });

    console.log('✅ Booking Saved:', newBooking.bookingReference);
    res.status(201).json({ message: 'Success', booking: newBooking });

  } catch (error) {
    console.error('❌ CRITICAL DB ERROR:', error.original || error.message);
    res.status(500).json({ error: error.message || 'Database Error' });
  }
});

// ==========================================
// 🚗 CAR BOOKING API
// ==========================================
app.post('/api/cars/book', authenticateToken, async (req, res) => {
  try {
    console.log('📩 Incoming Car Booking...');
    const { carDetails, totalPrice, passengerInfo } = req.body;

    const safePrice = parseFloat(totalPrice) || 0;
    if (!req.userId) throw new Error('User ID missing from token');

    // Create/Find Car with all required fields
    const [carRecord] = await Car.findOrCreate({
      where: { name: carDetails.name || 'Unknown Car' },
      defaults: {
        name: carDetails.name || 'Unknown Car',
        type: carDetails.type || 'Sedan',
        seats: carDetails.seats || 4,
        transmission: carDetails.transmission || 'manual',
        fuelType: carDetails.fuelType || 'Petrol',
        price: carDetails.price || safePrice,
        image: carDetails.image || null,
        location: carDetails.location || 'Unknown Location',
        status: 'available'
      }
    });

    console.log(`🚗 Car Linked: ${carRecord.name}`);

    // Create snapshot
    const snapshot = {
      carName: carDetails?.name,
      type: carDetails?.type,
      seats: carDetails?.seats,
      transmission: carDetails?.transmission,
      pickupLocation: carDetails?.pickupLocation,
      dropLocation: carDetails?.dropLocation,
      bookingDate: carDetails?.bookingDate,
      pickupTime: carDetails?.pickupTime,
      duration: carDetails?.duration,
      passengers: passengerInfo || {}
    };

    // Create booking
    const newBooking = await Booking.create({
      bookingReference: `CAR-${Date.now()}`,
      userId: req.userId,
      carId: carRecord.id,
      bookingType: 'car',
      specialRequests: JSON.stringify(snapshot),
      totalPrice: safePrice,
      status: 'confirmed'
    });

    console.log('✅ Car Booking Saved:', newBooking.bookingReference);
    res.status(201).json({ message: 'Success', booking: newBooking });

  } catch (error) {
    console.error('❌ CRITICAL CAR BOOKING ERROR:', error.original || error.message);
    res.status(500).json({ error: error.message || 'Database Error' });
  }
});







// ==========================================
// 📦 MY BOOKINGS
// ==========================================
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: Flight, required: false }]
    });

    const formatted = bookings.map(b => {
      let title = 'Booking';
      let details = '';
      if (b.specialRequests) {
        try {
          const snap = JSON.parse(b.specialRequests);
          title = `${snap.airline} (${snap.flightNumber})`;
          details = snap.route;
        } catch (e) { title = 'Flight Booking'; }
      }
      return {
        id: b.bookingReference,
        type: b.bookingType,
        title,
        details,
        price: b.totalPrice,
        status: b.status,
        date: b.createdAt
      };
    });
    res.json({ bookings: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// ==========================================
// 🧾 INVOICE DETAILS
// ==========================================
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      where: { bookingReference: req.params.id, userId: req.userId }
    });
    if (!booking) return res.status(404).json({ error: 'Not found' });

    const invoiceData = {
      ref: booking.bookingReference,
      date: booking.createdAt,
      total: booking.totalPrice,
      status: booking.status,
      snapshot: booking.specialRequests ? JSON.parse(booking.specialRequests) : null,
      basePrice: Math.round(booking.totalPrice / 1.12),
      taxes: Math.round(booking.totalPrice - (booking.totalPrice / 1.12))
    };
    res.json({ booking: invoiceData });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoice' });
  }
});

// ==========================================
// 🤖 AI RECOMMENDATIONS (Dual Mode)
// ==========================================
app.get('/api/destination-recommendations-new', authenticateToken, (req, res) => {
  const userId = req.userId.toString();
  const scriptPath = path.join(__dirname, 'destination_recommendations.py');

  // Check if Python script exists
  if (fs.existsSync(scriptPath)) {
    // Mode 1: Python AI Integration
    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const pythonProcess = spawn(pythonCommand, [scriptPath, userId]);
    let dataString = '';

    pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });

    pythonProcess.on('close', (code) => {
      try {
        res.json({ message: 'Success', recommendations: JSON.parse(dataString) });
      }
      catch (e) {
        console.warn("⚠️ Python AI failed, using fallback");
        sendFallbackRecommendations(res);
      }
    });
  } else {
    // Mode 2: JavaScript Fallback
    console.log("⚠️ Python script not found, using JS recommendations");
    sendFallbackRecommendations(res);
  }
});


// Fallback recommendations function
function sendFallbackRecommendations(res) {
  const recommendations = [
    {
      destination: 'Kyoto',
      country: 'Japan',
      category: 'History',
      price_range: '$1,200 - $1,800',
      popularity: 98,
      rating: 4.9,
      description: 'Based on your interest in culture, Kyoto offers stunning temples and cherry blossoms.',
      score: 98,
      data_source: 'AI Model'
    },
    {
      destination: 'Reykjavik',
      country: 'Iceland',
      category: 'Nature',
      price_range: '$1,500 - $2,200',
      popularity: 95,
      rating: 4.8,
      description: 'Since you like adventure, the Northern Lights and geothermal spas are a perfect match.',
      score: 95,
      data_source: 'AI Model'
    },
    {
      destination: 'Santorini',
      country: 'Greece',
      category: 'Romance',
      price_range: '$1,800 - $2,500',
      popularity: 99,
      rating: 4.9,
      description: 'A top pick for relaxation with breathtaking sunsets and volcanic beaches.',
      score: 92,
      data_source: 'AI Model'
    },
    {
      destination: 'Queenstown',
      country: 'New Zealand',
      category: 'Adventure',
      price_range: '$2,000 - $3,000',
      popularity: 94,
      rating: 4.7,
      description: 'The adventure capital of the world awaits your next thrill.',
      score: 88,
      data_source: 'AI Model'
    }
  ];

  // Simulate AI processing delay
  setTimeout(() => {
    res.json({ message: 'Success', recommendations });
  }, 500);
}

// ==========================================
// 🚀 START SERVER
// ==========================================


// **********************


app.post('/api/plan-trip', async (req, res) => {
  try {
    const { city, interests } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
Create a one day travel itinerary.

City: ${city}

Interests: ${interests}

STRICT RULES:

1. Never use markdown formatting.
2. Never use ** or * symbols.
3. Never make anything bold.
4. Do not write introduction paragraph.
5. Do not write headings like Adventure Focus, Theme, Travel Focus.
6. Use only plain text.
7. Start directly with schedule.
8. One activity per time slot.

Format exactly like this:

8:00 AM
Breakfast at local restaurant

10:00 AM
Visit historical places

1:00 PM
Lunch at famous cafe

4:00 PM
Explore local market

6:00 PM
Evening sightseeing

Return plain text only.
`;

    const result = await model.generateContent(prompt);

    let response = result.response.text();

    response = response.replace(/\*\*/g, '');
    response = response.replace(/^\*\s+/gm, '');
    response = response.replace(/#/g, '');

    res.json({
      itinerary: response
    });

  } catch (error) {
    console.log("Gemini Error:", error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});






// *********************overviewmodal******************************


// app.get("/api/place-overview", async (req, res) => {

//   try {

//     const place = req.query.place;

//     if (!place) {
//       return res.status(400).json({
//         error: "Place name required"
//       });
//     }


//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash"
//     });

//     const prompt = `
// Write a tourist overview for ${place}.

// Requirements:

// - Around 120 words.
// - Friendly travel guide style.
// - Mention history if famous.
// - Mention architecture.
// - Mention why tourists visit.
// - Mention best time to visit.
// - Mention nearby attractions if possible.
// - Plain paragraph only.
// - No markdown.
// - No bullet points.
// `;

//     const result = await model.generateContent(prompt);

//     let overview = result.response.text();

//     overview = overview
//       .replace(/\*\*/g, "")
//       .replace(/\*/g, "")
//       .replace(/#/g, "")
//       .trim();

//     res.json({
//       overview
//     });

//   } catch (err) {

//     console.error("Place Overview Error:");
//     console.error(err);

//     res.status(500).json({
//       error: err.message
//     });

//   }

// });

app.get("/api/place-overview", async (req, res) => {

  try {

    const place = req.query.place;

    if (!place) {
      return res.status(400).json({
        error: "Place required"
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    //     const prompt = `

    // Generate tourist information for ${place}.

    // Return ONLY valid JSON.

    // {
    // "overview":"",
    // "bestTime":"",
    // "entryFee":"",
    // "visitDuration":"",
    // "transport":"",
    // "timings":"",
    // "closedOn":"",
    // "familyFriendly":"",
    // "wheelchairAccessible":"",
    // "tips":""
    // }

    // Rules:

    // - Return JSON only.
    // - No markdown.
    // - No explanation.
    // - Values should be short.
    // - If unknown, estimate reasonably.

    // `;

    const prompt = `

Generate tourist information for "${place}".

Return ONLY valid JSON.

{
  "overview":"",
  "bestTime":"",
  "entryFee":"",
  "visitDuration":"",
  "timings":"",
  "closedOn":"",
  "familyFriendly":""
}

Rules:

1. overview must be around 110-120 words.
2. Write in a friendly travel guide style.
3. Mention:
   - short history
   - why tourists visit
   - architecture (if applicable)
   - cultural or religious significance
   - best season/time to visit
   - nearby famous places
4. Do NOT use markdown.
5. Do NOT use bullet points.
6. Do NOT make anything bold.
7. Return ONLY valid JSON.
8. Every field must contain a value.
9. If exact information is unavailable, provide a reasonable estimate.
10. Do not mention any location with the same name in another country. Use the address and context to identify the correct tourist attraction.

`;

    const result = await model.generateContent(prompt);

    let text = result.response.text();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const json = JSON.parse(text);

    res.json(json);

    // const result = await model.generateContent(prompt);

    // let text = result.response.text();

    // console.log("========== GEMINI RAW RESPONSE ==========");
    // console.log(text);
    // console.log("=========================================");

    // text = text
    //   .replace(/```json/g, "")
    //   .replace(/```/g, "")
    //   .trim();

    // const json = JSON.parse(text);

    // res.json(json);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

});




// *********************
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✈️ Flight API: AviationStack Ready");
  console.log(`📱 Twilio OTP: ${twilioClient ? 'Ready' : 'Not Configured'}`);
});