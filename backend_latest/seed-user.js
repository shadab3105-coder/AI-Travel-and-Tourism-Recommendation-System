import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { sequelize, User } from './models/sqlModels.js';

dotenv.config();

async function seedUser() {
  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('Connected to MySQL');

    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    const email = 'avigyandebnath@gmail.com';
    const password = 'admin@123';
    const firstName = 'Avigyan';
    const lastName = 'Debnath';

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isVerified: true,
      role: 'admin' // Assuming admin role as per password
    });

    console.log('User created successfully:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });

  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedUser();
