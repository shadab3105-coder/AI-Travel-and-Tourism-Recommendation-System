import { sequelize, User, Flight, Booking, Hotel, Car, Package } from './models/sqlModels.js';

class RecommendationEngine {
  constructor() {
    this.isTrained = false;
  }

  async trainModel() {
    // Simple collaborative filtering implementation
    try {
      const bookings = await Booking.findAll({
        include: [
          { model: User, attributes: ['id'] },
          { model: Flight, attributes: ['id', 'departureCity', 'arrivalCity', 'airline', 'economyPrice'] }
        ]
      });

      if (bookings.length === 0) {
        console.log('No booking data available for training');
        return;
      }

      // Build user-item matrix (simple frequency-based)
      this.userFlightMatrix = {};
      this.flightFeatures = {};

      bookings.forEach(booking => {
        const userId = booking.userId;
        const flightId = booking.flightId;

        if (!this.userFlightMatrix[userId]) {
          this.userFlightMatrix[userId] = {};
        }
        this.userFlightMatrix[userId][flightId] = (this.userFlightMatrix[userId][flightId] || 0) + 1;

        // Store flight features
        if (!this.flightFeatures[flightId]) {
          this.flightFeatures[flightId] = {
            departureCity: booking.Flight.departureCity,
            arrivalCity: booking.Flight.arrivalCity,
            airline: booking.Flight.airline,
            price: booking.Flight.economyPrice
          };
        }
      });

      this.isTrained = true;
      console.log(`Trained recommendation model with ${bookings.length} bookings`);
    } catch (error) {
      console.error('Error training recommendation model:', error);
    }
  }

  async getRecommendations(userId, limit = 5) {
    if (!this.isTrained) {
      await this.trainModel();
    }

    if (!this.isTrained) {
      return this.getFallbackRecommendations(userId, limit);
    }

    try {
      const userBookings = this.userFlightMatrix[userId];
      if (!userBookings || Object.keys(userBookings).length === 0) {
        return this.getFallbackRecommendations(userId, limit);
      }

      // Simple content-based filtering
      const userPreferredCities = {};
      const userPreferredAirlines = {};

      Object.keys(userBookings).forEach(flightId => {
        const features = this.flightFeatures[flightId];
        if (features) {
          userPreferredCities[features.departureCity] = (userPreferredCities[features.departureCity] || 0) + userBookings[flightId];
          userPreferredCities[features.arrivalCity] = (userPreferredCities[features.arrivalCity] || 0) + userBookings[flightId];
          userPreferredAirlines[features.airline] = (userPreferredAirlines[features.airline] || 0) + userBookings[flightId];
        }
      });

      // Score all flights based on user preferences
      const flightScores = {};
      Object.keys(this.flightFeatures).forEach(flightId => {
        if (!userBookings[flightId]) { // Don't recommend already booked flights
          const features = this.flightFeatures[flightId];
          let score = 0;

          // City preference score
          score += (userPreferredCities[features.departureCity] || 0) * 0.3;
          score += (userPreferredCities[features.arrivalCity] || 0) * 0.3;

          // Airline preference score
          score += (userPreferredAirlines[features.airline] || 0) * 0.4;

          // Price factor (prefer similar price range)
          const avgUserPrice = Object.keys(userBookings).reduce((sum, fid) => {
            return sum + (this.flightFeatures[fid]?.price || 0);
          }, 0) / Object.keys(userBookings).length;

          const priceDiff = Math.abs(features.price - avgUserPrice);
          const priceScore = Math.max(0, 1 - (priceDiff / avgUserPrice));
          score += priceScore * 0.2;

          flightScores[flightId] = score;
        }
      });

      // Sort by score and get top recommendations
      const sortedFlights = Object.keys(flightScores)
        .sort((a, b) => flightScores[b] - flightScores[a])
        .slice(0, limit);

      // Convert to flight objects
      const recommendedFlights = [];
      for (const flightId of sortedFlights) {
        const flight = await Flight.findByPk(flightId);
        if (flight) {
          recommendedFlights.push({
            id: flight.id,
            flightNumber: flight.flightNumber,
            airline: flight.airline,
            departureCity: flight.departureCity,
            arrivalCity: flight.arrivalCity,
            departureDate: flight.departureDate,
            departureTime: flight.departureTime,
            economyPrice: flight.economyPrice,
            score: flightScores[flightId]
          });
        }
      }

      return recommendedFlights;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getFallbackRecommendations(userId, limit);
    }
  }

  async getFallbackRecommendations(userId, limit = 5) {
    try {
      // Get popular flights (most booked) or all available flights if no bookings exist
      let flights = await Booking.findAll({
        attributes: [
          'flightId',
          [sequelize.fn('COUNT', sequelize.col('Booking.id')), 'bookingCount']
        ],
        include: [{ model: Flight }],
        group: ['flightId', 'Flight.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('Booking.id')), 'DESC']],
        limit: limit
      });

      // If no bookings exist, get all available flights
      if (flights.length === 0) {
        flights = await Flight.findAll({
          where: { status: 'scheduled' },
          order: [['departureDate', 'ASC']],
          limit: limit
        });

        return flights.map(flight => ({
          id: flight.id,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          departureCity: flight.departureCity,
          arrivalCity: flight.arrivalCity,
          departureDate: flight.departureDate,
          departureTime: flight.departureTime,
          economyPrice: flight.economyPrice,
          score: 0.8 // Higher score for featured flights
        }));
      }

      return flights.map(item => ({
        id: item.Flight.id,
        flightNumber: item.Flight.flightNumber,
        airline: item.Flight.airline,
        departureCity: item.Flight.departureCity,
        arrivalCity: item.Flight.arrivalCity,
        departureDate: item.Flight.departureDate,
        departureTime: item.Flight.departureTime,
        economyPrice: item.Flight.economyPrice,
        score: 0.5 // Default score for fallback
      }));
    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      // Last resort: return some flights from JSON data
      try {
        const allFlights = await Flight.findAll({
          where: { status: 'scheduled' },
          limit: limit
        });
        return allFlights.map(flight => ({
          id: flight.id,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          departureCity: flight.departureCity,
          arrivalCity: flight.arrivalCity,
          departureDate: flight.departureDate,
          departureTime: flight.departureTime,
          economyPrice: flight.economyPrice,
          score: 0.3 // Lower score for error fallback
        }));
      } catch (dbError) {
        console.error('Database error in fallback:', dbError);
        return [];
      }
    }
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
