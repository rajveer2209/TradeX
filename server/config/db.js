import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabase } from '../seeds/stockSeed.js';
import Stock from '../models/Stock.js';

let mongoMemoryServer = null;

const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tradex';

  try {
    console.log(`[MongoDB] Attempting connection to: ${targetUri}`);
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);

    // Check if initial stock data exists, auto-seed if empty
    const count = await Stock.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] Database is empty. Auto-seeding initial market assets...');
      await seedDatabase(false);
    }
  } catch (error) {
    console.warn(`[MongoDB] Local MongoDB connection unavailable (${error.message}).`);
    console.log('[MongoDB] Initializing in-memory MongoMemoryServer fallback...');

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      console.log(`[MongoDB] In-memory MongoDB initialized at: ${memoryUri}`);

      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to in-memory instance: ${conn.connection.host}`);

      console.log('[MongoDB] Seeding sample stocks and default user accounts into in-memory store...');
      await seedDatabase(false);
    } catch (memError) {
      console.error(`[MongoDB] Failed to start in-memory MongoDB fallback: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
