/**
 * MongoDB Connection Utilities for Vercel Serverless
 * 
 * ✅ Vercel-compatible: Uses connectDB() which handles caching
 * ❌ NOT ALLOWED: setTimeout polling (not allowed in serverless)
 */

import { connectDB } from '../init/db.js';

/**
 * Ensure MongoDB is connected before proceeding
 * Uses the cached connection pattern from connectDB()
 * @throws {Error} If connection cannot be established
 */
export const ensureConnection = async () => {
    const startTime = Date.now();
    
    console.log(`[${new Date().toISOString()}] 🔒 ensureConnection: Ensuring MongoDB connection`);
    
    try {
        // Use connectDB() which handles caching and connection
        await connectDB();
        
        const elapsed = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ✅ Connection ensured after ${elapsed}ms, proceeding with query`);
    } catch (error) {
        const elapsed = Date.now() - startTime;
        const errorMsg = `MongoDB connection failed after ${elapsed}ms: ${error.message}`;
        console.error(`[${new Date().toISOString()}] ❌ ${errorMsg}`);
        throw new Error(errorMsg);
    }
};

