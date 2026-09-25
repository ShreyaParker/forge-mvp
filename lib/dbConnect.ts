import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forge-mvp';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/forge-mvp';

  if (!cached.promise) {
    console.log('[dbConnect] Connecting to MongoDB:', uri.replace(/:([^:@]+)@/, ':****@'));
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log('[dbConnect] Connected successfully to DB:', mongoose.connection.name);
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
