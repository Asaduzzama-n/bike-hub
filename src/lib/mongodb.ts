import mongoose from 'mongoose';
import { MongoClient, Db } from 'mongodb';
import { createDefaultAdmin } from './db/init';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
let isInitialized = false;

// Mongoose connection
let isMongooseConnected = false;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Connect Mongoose if not already connected
  if (!isMongooseConnected) {
    try {
      await mongoose.connect(uri);
      isMongooseConnected = true;
      console.log('Mongoose connected successfully');
    } catch (error) {
      console.error('Mongoose connection failed:', error);
      throw error;
    }
  }

  // Also maintain native MongoDB connection for admin operations
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('bikehub');
  
  // Run one-time setup on first connection
  if (!isInitialized) {
    try {
      await createDefaultAdmin(db);
      isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }
  
  return { client, db };
}

// For backwards compatibility
export default mongoose;
