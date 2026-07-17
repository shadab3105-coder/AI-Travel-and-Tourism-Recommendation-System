import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Flight from './models/Flight.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://avigyandebnath009_db_user:pFgu5QH5JL8wXyKM@user.synb1tb.mongodb.net/flights?retryWrites=true&w=majority';

// Read flights data from JSON file
const flightsDataPath = path.join(__dirname, 'flights-data.json');
const rawFlightsData = fs.readFileSync(flightsDataPath, 'utf8');
const flightsData = JSON.parse(rawFlightsData);

// Convert date strings to Date objects and remove _id field
const sampleFlights = flightsData.map(flight => {
  const { _id, ...flightWithoutId } = flight;
  return {
    ...flightWithoutId,
    departure: {
      ...flight.departure,
      date: new Date(flight.departure.date + 'T' + flight.departure.time + ':00Z')
    },
    arrival: {
      ...flight.arrival,
      date: new Date(flight.arrival.date + 'T' + flight.arrival.time + ':00Z')
    }
  };
});

async function seedFlights() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing flights
    await Flight.deleteMany({});
    console.log('Cleared existing flights');

    // Insert sample flights
    const insertedFlights = await Flight.insertMany(sampleFlights);
    console.log(`Successfully inserted ${insertedFlights.length} flights`);

    // Display inserted flights
    console.log('\nInserted Flights:');
    insertedFlights.forEach(flight => {
      console.log(`${flight.flightNumber}: ${flight.departure.city} -> ${flight.arrival.city} (${flight.departure.date.toDateString()})`);
    });

  } catch (error) {
    console.error('Error seeding flights:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedFlights();
