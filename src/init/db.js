import mongoose from "mongoose";
import { env, isDevelopment } from "../config/env.js";

if(isDevelopment()){
    mongoose.set("debug",true);
}

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

const connectDB=async()=>{
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] 🔌 Starting MongoDB connection process...`);
    console.log(`[${new Date().toISOString()}] 📍 Environment: ${env.NODE_ENV}`);
    console.log(`[${new Date().toISOString()}] 🔗 Current connection state: ${getConnectionState()}`);
   
    if(!env.MONGODB_URI){
        console.error(`[${new Date().toISOString()}] ❌ MONGODB_URI is not defined in environment variables`);
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // Log connection string info (masked in production)
    if(isDevelopment()) {
        console.log(`[${new Date().toISOString()}] 🔑 MONGO_URI: ${env.MONGODB_URI}`);
    } else {
        const uriParts = env.MONGODB_URI?.split('@');
        if (uriParts && uriParts.length > 1) {
            const hostPart = uriParts[1].split('/')[0];
            console.log(`[${new Date().toISOString()}] 🔑 MONGO_URI: ***@${hostPart}`);
        } else {
            console.log(`[${new Date().toISOString()}] 🔑 MONGO_URI: Set (hidden for security)`);
        }
    }

    const connectionOptions={
        serverSelectionTimeoutMS:30000, // Increased to 30 seconds
        socketTimeoutMS:45000, // Increased to 45 seconds
        connectTimeoutMS:30000, // Increased to 30 seconds
        maxPoolSize:10,
        minPoolSize:5
    };

    console.log(`[${new Date().toISOString()}] ⚙️  Connection options:`, {
        serverSelectionTimeoutMS: connectionOptions.serverSelectionTimeoutMS,
        socketTimeoutMS: connectionOptions.socketTimeoutMS,
        connectTimeoutMS: connectionOptions.connectTimeoutMS,
        maxPoolSize: connectionOptions.maxPoolSize,
        minPoolSize: connectionOptions.minPoolSize
    });

    let reconnecting=false;
    let attemptCount = 0;
    
    const connectionWithRetry=async()=>{
        attemptCount++;
        const attemptStartTime = Date.now();
        console.log(`[${new Date().toISOString()}] 🔄 Attempt #${attemptCount} to connect to MongoDB...`);
        console.log(`[${new Date().toISOString()}] 📊 Connection state before attempt: ${getConnectionState()}`);
        
        try{
            const connectPromise = mongoose.connect(env.MONGODB_URI,connectionOptions);
            console.log(`[${new Date().toISOString()}] ⏳ Waiting for connection (timeout: ${connectionOptions.connectTimeoutMS}ms)...`);
            
            await connectPromise;
            
            const connectionTime = Date.now() - attemptStartTime;
            console.log(`[${new Date().toISOString()}] ✅ MongoDB connected successfully in ${connectionTime}ms`);
            console.log(`[${new Date().toISOString()}] 📊 Connection state: ${getConnectionState()}`);
            console.log(`[${new Date().toISOString()}] 🗄️  Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
            console.log(`[${new Date().toISOString()}] 🌐 Host: ${mongoose.connection.host || 'unknown'}`);
            console.log(`[${new Date().toISOString()}] 🔌 Port: ${mongoose.connection.port || 'unknown'}`);
            console.log(`[${new Date().toISOString()}] ⏱️  Total connection time: ${Date.now() - startTime}ms`);
        }
        catch(err){
            const errorTime = Date.now() - attemptStartTime;
            console.error(`[${new Date().toISOString()}] ❌ MongoDB connection error after ${errorTime}ms:`);
            console.error(`[${new Date().toISOString()}]    Error name: ${err.name}`);
            console.error(`[${new Date().toISOString()}]    Error message: ${err.message}`);
            console.error(`[${new Date().toISOString()}]    Error code: ${err.code || 'N/A'}`);
            if (err.reason) {
                console.error(`[${new Date().toISOString()}]    Error reason: ${err.reason}`);
            }
            console.log(`[${new Date().toISOString()}] 📊 Connection state after error: ${getConnectionState()}`);
            console.log(`[${new Date().toISOString()}] 🔄 Retrying in 5 seconds...`);
            setTimeout(connectionWithRetry,5000);
        }
    }

    // Set up event listeners with detailed logging
    mongoose.connection.on("connecting", () => {
        console.log(`[${new Date().toISOString()}] 🔄 MongoDB connecting...`);
    });

    mongoose.connection.on("connected", () => {
        console.log(`[${new Date().toISOString()}] ✅ MongoDB connected event fired`);
        console.log(`[${new Date().toISOString()}] 📊 Connection state: ${getConnectionState()}`);
    });

    mongoose.connection.on("open", () => {
        console.log(`[${new Date().toISOString()}] 🟢 MongoDB connection opened`);
    });

    mongoose.connection.on("error", (err) => {
        console.error(`[${new Date().toISOString()}] ❌ MongoDB connection error event:`, err.message);
        console.error(`[${new Date().toISOString()}]    Error details:`, {
            name: err.name,
            message: err.message,
            code: err.code
        });
    });

    mongoose.connection.on("disconnected", () => {
        console.log(`[${new Date().toISOString()}] ⚠️  MongoDB disconnected`);
        console.log(`[${new Date().toISOString()}] 📊 Connection state: ${getConnectionState()}`);
        if(!reconnecting){
            reconnecting=true;
            console.log(`[${new Date().toISOString()}] 🔄 Attempting to reconnect to MongoDB...`);
            connectionWithRetry().finally(()=>{
                reconnecting=false;
                console.log(`[${new Date().toISOString()}] 🔄 Reconnection attempt completed`);
            });
        }
    });

    mongoose.connection.on("reconnected", () => {
        console.log(`[${new Date().toISOString()}] ✅ MongoDB reconnected`);
    });

    mongoose.connection.on("close", () => {
        console.log(`[${new Date().toISOString()}] 🔴 MongoDB connection closed`);
    });

    await connectionWithRetry();
    
    // Log final connection status
    console.log(`[${new Date().toISOString()}] 🎯 Connection process completed. Final state: ${getConnectionState()}`);
}

export { connectDB };
