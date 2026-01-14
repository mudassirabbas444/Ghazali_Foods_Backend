import mongoose from "mongoose";

// Connection state names for logging
const connectionStateNames = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
};

const getConnectionState = () => {
    const state = mongoose.connection.readyState;
    return `${state} (${connectionStateNames[state] || 'unknown'})`;
};

/**
 * Wait for MongoDB connection to be established
 * @param {number} maxWaitTime - Maximum time to wait in milliseconds (default: 30000)
 * @returns {Promise<boolean>} - Returns true if connected, false if timeout
 */
export const waitForConnection = async (maxWaitTime = 30000) => {
    const startTime = Date.now();
    const initialState = mongoose.connection.readyState;
    
    console.log(`[${new Date().toISOString()}] ⏳ waitForConnection: Starting wait (max: ${maxWaitTime}ms)`);
    console.log(`[${new Date().toISOString()}] 📊 Initial connection state: ${getConnectionState()}`);
    
    // If already connected, return immediately
    if (initialState === 1) {
        console.log(`[${new Date().toISOString()}] ✅ Already connected, returning immediately`);
        return true;
    }
    
    // Wait for connection
    return new Promise((resolve) => {
        let checkCount = 0;
        const checkConnection = () => {
            checkCount++;
            const currentState = mongoose.connection.readyState;
            const elapsed = Date.now() - startTime;
            
            if (checkCount % 10 === 0 || currentState === 1) {
                console.log(`[${new Date().toISOString()}] 🔍 Check #${checkCount}: State=${getConnectionState()}, Elapsed=${elapsed}ms`);
            }
            
            if (currentState === 1) {
                console.log(`[${new Date().toISOString()}] ✅ Connection established after ${elapsed}ms (${checkCount} checks)`);
                resolve(true);
                return;
            }
            
            // Check if timeout
            if (elapsed > maxWaitTime) {
                console.error(`[${new Date().toISOString()}] ❌ Connection timeout after ${elapsed}ms (${checkCount} checks)`);
                console.error(`[${new Date().toISOString()}] 📊 Final state: ${getConnectionState()}`);
                resolve(false);
                return;
            }
            
            // Check again in 100ms
            setTimeout(checkConnection, 100);
        };
        
        checkConnection();
    });
};

/**
 * Ensure MongoDB is connected before proceeding
 * @throws {Error} If connection cannot be established
 */
export const ensureConnection = async () => {
    const startTime = Date.now();
    const initialState = mongoose.connection.readyState;
    
    console.log(`[${new Date().toISOString()}] 🔒 ensureConnection: Checking connection before query`);
    console.log(`[${new Date().toISOString()}] 📊 Current state: ${getConnectionState()}`);
    
    if (initialState === 1) {
        console.log(`[${new Date().toISOString()}] ✅ Connection verified, proceeding with query`);
        return; // Already connected
    }
    
    console.log(`[${new Date().toISOString()}] ⏳ Connection not ready, waiting up to 15 seconds...`);
    
    // Wait up to 15 seconds for connection (increased for Vercel serverless cold starts)
    const connected = await waitForConnection(15000);
    
    if (!connected) {
        const finalState = mongoose.connection.readyState;
        const elapsed = Date.now() - startTime;
        const errorMsg = `MongoDB is not connected after ${elapsed}ms. Connection state: ${getConnectionState()}. Please ensure the database connection is established before executing queries.`;
        console.error(`[${new Date().toISOString()}] ❌ ${errorMsg}`);
        throw new Error(errorMsg);
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ✅ Connection ensured after ${elapsed}ms, proceeding with query`);
};

