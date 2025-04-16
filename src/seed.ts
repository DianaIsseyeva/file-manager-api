import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from './models/User';

/**
 * Seed script for creating a test user.
 *
 * The script connects to the MongoDB database, checks if a test user
 * exists, and creates one if it does not.
 */
async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file.');
    }
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Define test user credentials.
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';
    const testName = process.env.TEST_USER_NAME || 'Test User';

    // Check if test user already exists.
    const existingUser = await UserModel.findOne({ email: testEmail });
    if (existingUser) {
      console.log('Test user already exists.');
    } else {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const newUser = await UserModel.create({
        email: testEmail,
        password: hashedPassword,
        name: testName,
      });
      console.log('Test user created:', newUser);
    }

    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
