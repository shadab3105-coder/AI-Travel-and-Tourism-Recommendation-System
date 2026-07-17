import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  bookingReference: {
    type: String,
    required: true,
    unique: true
  },
  passengerDetails: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    passportNumber: {
      type: String,
      required: true
    }
  },
  travelClass: {
    type: String,
    enum: ['economy', 'business', 'first'],
    required: true
  },
  numberOfPassengers: {
    type: Number,
    required: true,
    min: 1,
    max: 9
  },
  totalPrice: {
    type: Number,
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'refunded'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded'],
    default: 'paid'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  specialRequests: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique booking reference
bookingSchema.pre('save', function(next) {
  if (this.isNew) {
    this.bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
bookingSchema.index({ userId: 1, bookingDate: -1 });
bookingSchema.index({ bookingReference: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
