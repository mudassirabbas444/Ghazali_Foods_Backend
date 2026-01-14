/**
 * MongoDB Connection for Vercel Serverless
 * 
 * ✅ Vercel-compatible:
 * - Uses cached connection pattern (global.mongoose)
 * - No setTimeout retries (not allowed in serverless)
 * - No event listeners (repeatedly attached on each request)
 * - No reconnection logic (serverless functions are stateless)
 * 
 * ❌ NOT ALLOWED ON VERCEL:
 * - setTimeout(connectionWithRetry, 5000) - Background retry
 * - mongoose.connection.on(...) - Event listeners
 * - Reconnection logic - Process terminates after request
 */

import mongoose from "mongoose";
import { env, isDevelopment } from "../config/env.js";

// Enable debug mode in development
if (isDevelopment()) {
    mongoose.set("debug", true);
}

// Cache connection globally (works across Vercel serverless function invocations)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

/**
 * Connect to MongoDB with caching for Vercel serverless
 * @returns {Promise<mongoose.Connection>} MongoDB connection
 */
export async function connectDB() {
    const startTime = Date.now();
    
    // Return cached connection if available
    if (cached.conn) {
        console.log(`[${new Date().toISOString()}] ✅ Using cached MongoDB connection`);
        return cached.conn;
    }

    // Validate MONGODB_URI
    if (!env.MONGODB_URI) {
        const error = "❌ MONGODB_URI is not defined in environment variables";
        console.error(`[${new Date().toISOString()}] ${error}`);
        throw new Error(error);
    }

    // Log connection info (masked in production)
    if (isDevelopment()) {
        console.log(`[${new Date().toISOString()}] 🔌 Connecting to MongoDB...`);
        console.log(`[${new Date().toISOString()}] 🔑 MONGO_URI: ${env.MONGODB_URI}`);
    } else {
        const uriParts = env.MONGODB_URI?.split('@');
        if (uriParts && uriParts.length > 1) {
            const hostPart = uriParts[1].split('/')[0];
            console.log(`[${new Date().toISOString()}] 🔌 Connecting to MongoDB...`);
            console.log(`[${new Date().toISOString()}] 🔑 MONGO_URI: ***@${hostPart}`);
        } else {
            console.log(`[${new Date().toISOString()}] 🔌 Connecting to MongoDB...`);
        }
    }

    // Create connection promise if not exists (prevents multiple simultaneous connections)
    if (!cached.promise) {
        const connectionOptions = {
            bufferCommands: false, // Disable mongoose buffering (serverless-friendly)
            maxPoolSize: 10, // Maximum connections in pool
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            connectTimeoutMS: 10000, // 10 seconds connection timeout
        };

        console.log(`[${new Date().toISOString()}] ⚙️  Connection options:`, {
            bufferCommands: connectionOptions.bufferCommands,
            maxPoolSize: connectionOptions.maxPoolSize,
            serverSelectionTimeoutMS: connectionOptions.serverSelectionTimeoutMS,
            socketTimeoutMS: connectionOptions.socketTimeoutMS,
            connectTimeoutMS: connectionOptions.connectTimeoutMS,
        });

        cached.promise = mongoose
            .connect(env.MONGODB_URI, connectionOptions)
            .then((mongoose) => {
                const connectionTime = Date.now() - startTime;
                console.log(`[${new Date().toISOString()}] ✅ MongoDB connected successfully in ${connectionTime}ms`);
                console.log(`[${new Date().toISOString()}] 🗄️  Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
                console.log(`[${new Date().toISOString()}] 🌐 Host: ${mongoose.connection.host || 'unknown'}`);
                return mongoose;
            })
            .catch((error) => {
                const errorTime = Date.now() - startTime;
                console.error(`[${new Date().toISOString()}] ❌ MongoDB connection failed after ${errorTime}ms`);
                console.error(`[${new Date().toISOString()}]    Error: ${error.message}`);
                // Clear promise on error so next request can retry
                cached.promise = null;
                throw error;
            });
    }

    // Wait for connection promise
    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        // Clear cached promise on error
        cached.promise = null;
        throw error;
    }
}
