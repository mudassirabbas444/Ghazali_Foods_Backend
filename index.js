// Load environment variables FIRST, before any other imports
// Only load .env file in development (Vercel provides env vars automatically)
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const isDev = (process.env.NODE_ENV || 'development') === 'development';

if (isDev) {
  // Get current file directory for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Load .env file from the root directory (only in development)
  dotenv.config({ path: join(__dirname, '.env') });
}

// Now import other modules
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './src/init/routes.js';
import { connectDB } from './src/init/db.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: false
    }
});

// Import environment configuration
import { env, isDevelopment } from './src/config/env.js';

// Vercel automatically sets PORT, use it or fallback to env.PORT or 5000
const PORT = process.env.PORT || env.PORT || 5000;

// Add middleware
app.use(cors({ 
    origin: "*",
    credentials: false
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
    res.send('Hello from server');
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: env.NODE_ENV
    });
});

// MongoDB connection health check endpoint
app.get('/api/health/db', (req, res) => {
    const connectionState = mongoose.connection.readyState;
    const stateNames = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    const health = {
        status: connectionState === 1 ? 'connected' : 'disconnected',
        connectionState: connectionState,
        connectionStateName: stateNames[connectionState] || 'unknown',
        database: mongoose.connection.db?.databaseName || null,
        host: mongoose.connection.host || null,
        port: mongoose.connection.port || null,
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV
    };
    
    console.log(`[${new Date().toISOString()}] 🏥 Health check requested:`, health);
    
    res.status(connectionState === 1 ? 200 : 503).json(health);
});

// Initialize routes
routes(app);


// Start server immediately (don't wait for DB connection)
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`Socket.IO server is ready for connections`);
    
    // Connect to database after server starts
    connectDB().then(() => {
        console.log('Database connected successfully');
        
    }).catch((error) => {
        console.error('Database connection failed:', error);
        // Don't exit - let server run without DB for debugging
    });
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`   Please stop the process using port ${PORT} or change the PORT in .env`);
        console.error(`   To find the process: netstat -ano | findstr :${PORT}`);
        console.error(`   To kill it: taskkill /F /PID <PID>`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        process.exit(1);
    }
});