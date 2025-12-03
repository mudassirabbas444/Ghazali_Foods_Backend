/**
 * Environment Configuration
 * Centralized access to environment variables with validation
 * Ready for Vercel deployment - no hardcoded values
 */
import dotenv from 'dotenv';
dotenv.config();
const isDev = (process.env.NODE_ENV || 'development') === 'development';
const isProd = process.env.NODE_ENV === 'production';

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_KEY'
];

// Check for missing required variables
const missingVars = requiredEnvVars.filter(varName => {
  const value = process.env[varName] || process.env[varName.replace('MONGODB_URI', 'MONGO_URI')];
  return !value;
});

// In production, throw error if required vars are missing
if (isProd && missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}\n` +
    `Please set these in your Vercel project settings.`
  );
}

// In development, only warn
if (isDev && missingVars.length > 0) {
  console.warn('Warning: Missing environment variables:', missingVars.join(', '));
  console.warn('Some features may not work correctly without these variables.');
  console.warn('Create a .env file in the backend root with these variables.');
}

// Environment configuration object with hardcoded fallback values
export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  
  // Database - Required
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI ,
  
  // JWT - Required
  JWT_SECRET: process.env.JWT_SECRET || process.env.JWT_KEY,
  JWT_KEY: process.env.JWT_KEY || process.env.JWT_SECRET ,
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL ,
  
  // Google OAuth - Optional
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID ,
  
  // Firebase - Optional (for file uploads)
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT?.trim() ,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET?.trim() || 
                          process.env.STORAGEBUCKET || 
                          process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ,
  
  // Email (optional)
  SMTP_HOST: process.env.SMTP_HOST || undefined,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_USER: process.env.SMTP_USER || undefined,
  SMTP_PASS: process.env.SMTP_PASS || undefined,
  SMTP_FROM: process.env.SMTP_FROM || undefined,
};

// Validation helpers
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Log environment info (only in development)
if (isDevelopment()) {
  console.log('Environment Configuration:');
  console.log(`   NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   PORT: ${env.PORT || 'Not set (will use Vercel default)'}`);
  console.log(`   MONGODB_URI: ${env.MONGODB_URI ? 'Set' : 'Missing (Required)'}`);
  console.log(`   JWT_SECRET: ${env.JWT_SECRET ? 'Set' : 'Missing (Required)'}`);
  console.log(`   JWT_KEY: ${env.JWT_KEY ? 'Set' : 'Missing (Required)'}`);
  console.log(`   FRONTEND_URL: ${env.FRONTEND_URL || 'Not set'}`);
  console.log(`   GOOGLE_CLIENT_ID: ${env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing (Optional)'}`);
  console.log(`   FIREBASE_SERVICE_ACCOUNT: ${env.FIREBASE_SERVICE_ACCOUNT ? 'Set' : 'Missing (Optional)'}`);
  console.log(`   FIREBASE_STORAGE_BUCKET: ${env.FIREBASE_STORAGE_BUCKET || 'Missing (Optional)'}`);
}

export default env;