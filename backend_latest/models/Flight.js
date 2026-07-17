import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true
  },
  airline: {
    type: String,
    required: true
  },
  departure: {
    airport: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  },
  arrival: {
    airport: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  },
  duration: {
    type: String,
    required: true
  },
  aircraft: {
    type: String,
    required: true
  },
  class: {
    economy: {
      price: {
        type: Number,
        required: true
      },
      seats: {
        type: Number,
        required: true
      },
      availableSeats: {
        type: Number,
        required: true
      }
    },
    business: {
      price: {
        type: Number,
        required: true
      },
      seats: {
        type: Number,
        required: true
      },
      availableSeats: {
        type: Number,
        required: true
      }
    },
    first: {
      price: {
        type: Number,
        required: true
      },
      seats: {
        type: Number,
        required: true
      },
      availableSeats: {
        type: Number,
        required: true
      }
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'delayed', 'cancelled', 'departed', 'arrived'],
    default: 'scheduled'
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

// Update the updatedAt field before saving
flightSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Flight = mongoose.model('Flight', flightSchema);

export default Flight;
