import { Sequelize, DataTypes, Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.SQL_DATABASE_URL || 'mysql://root:@localhost:3306/tavels_1', {
  dialect: 'mysql',
  logging: false,
});

// 1. USER MODEL (Matches your Original DB)
const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  mobileNumber: { type: DataTypes.STRING, allowNull: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
});

// 2. FLIGHT MODEL
const Flight = sequelize.define('Flight', {
  flightNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  airline: { type: DataTypes.STRING, allowNull: false },
  departureCity: { type: DataTypes.STRING, allowNull: false },
  arrivalCity: { type: DataTypes.STRING, allowNull: false },
  departureDate: { type: DataTypes.DATEONLY, allowNull: false },
  departureTime: { type: DataTypes.TIME, allowNull: false },
  arrivalDate: { type: DataTypes.DATEONLY, allowNull: false },
  arrivalTime: { type: DataTypes.TIME, allowNull: false },
  duration: { type: DataTypes.STRING, allowNull: false },
  economyPrice: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('scheduled', 'delayed'), defaultValue: 'scheduled' },
});

// 3. HOTEL & PACKAGE MODELS (For Future Features)
const Hotel = sequelize.define('Hotel', {
  name: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  pricePerNight: { type: DataTypes.FLOAT, allowNull: false },
  rating: { type: DataTypes.FLOAT, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true }
});

const Package = sequelize.define('Package', {
  name: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING, allowNull: false },
  duration: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true }
});

// 3. CAR MODEL
const Car = sequelize.define('Car', {
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  seats: { type: DataTypes.INTEGER, allowNull: false },
  transmission: { type: DataTypes.ENUM('manual', 'automatic'), allowNull: false },
  fuelType: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('available', 'booked', 'maintenance'), defaultValue: 'available' },
});

// 4. BOOKING MODEL (Polymorphic - Supports all types)
const Booking = sequelize.define('Booking', {
  bookingReference: { type: DataTypes.STRING, allowNull: false, unique: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  bookingType: { type: DataTypes.ENUM('flight', 'hotel', 'package', 'car'), allowNull: false, defaultValue: 'flight' },
  flightId: { type: DataTypes.INTEGER, allowNull: true },
  hotelId: { type: DataTypes.INTEGER, allowNull: true },
  packageId: { type: DataTypes.INTEGER, allowNull: true },
  carId: { type: DataTypes.INTEGER, allowNull: true },
  specialRequests: { type: DataTypes.TEXT, allowNull: true },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('confirmed', 'cancelled', 'pending'), defaultValue: 'confirmed' },
});

// Associations
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Flight.hasMany(Booking, { foreignKey: 'flightId' });
Booking.belongsTo(Flight, { foreignKey: 'flightId' });

Hotel.hasMany(Booking, { foreignKey: 'hotelId' });
Booking.belongsTo(Hotel, { foreignKey: 'hotelId' });

Package.hasMany(Booking, { foreignKey: 'packageId' });
Booking.belongsTo(Package, { foreignKey: 'packageId' });

Car.hasMany(Booking, { foreignKey: 'carId' });
Booking.belongsTo(Car, { foreignKey: 'carId' });

export { sequelize, User, Flight, Booking, Hotel, Package, Car, Op };
