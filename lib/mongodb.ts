
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Global scope declaration to persist cache across hot reloads in development
// This avoids creating a new connection for every request in dev environment
declare global {
    var mongoose: MongooseCache | undefined;
}

// Initialize cached connection
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
    // If a connection is already established, return it immediately
    if (cached?.conn) {
        return cached.conn;
    }

    // If there is no existing connection promise, create one
    if (!cached?.promise) {
        const opts = {
            bufferCommands: false,
        };

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (e) {
        cached!.promise = null;
        throw e;
    }

    return cached!.conn!;
}

export default dbConnect;
