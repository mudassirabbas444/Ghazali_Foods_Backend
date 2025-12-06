// src/global/firebaseAdmin.js
import admin from 'firebase-admin';
import { env } from '../config/env.js';

if (!admin.apps.length) {
  const json = env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) {
    console.error('[firebaseAdmin] Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
  }

  try {
    const parsed = JSON.parse(json);

    const privateKey = parsed.private_key?.includes('\\n')
      ? parsed.private_key.replace(/\\n/g, '\n')
      : parsed.private_key;

    const bucketName =
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.STORAGEBUCKET ||
      process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
      env.FIREBASE_STORAGE_BUCKET ||
      `${parsed.project_id}.firebasestorage.app`;

    console.log('[firebaseAdmin] Initializing Firebase Admin with bucket:', bucketName);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey,
      }),
      storageBucket: bucketName,
    });

    console.log('[firebaseAdmin] Firebase Admin initialized successfully');
  } catch (error) {
    console.error('[firebaseAdmin] Error initializing Firebase Admin:', error);
    throw error;
  }
}

export default admin;
export const db = admin.firestore();

// Initialize bucket with error handling
let bucketInstance = null;
try {
  if (admin.apps.length > 0) {
    bucketInstance = admin.storage().bucket();
    console.log('[firebaseAdmin] Bucket initialized:', bucketInstance?.name || 'Unknown');
  } else {
    console.warn('[firebaseAdmin] Firebase Admin not initialized, bucket will be null');
  }
} catch (error) {
  console.error('[firebaseAdmin] Error initializing bucket:', error);
  console.error('[firebaseAdmin] Error details:', {
    message: error.message,
    stack: error.stack
  });
}

export const bucket = bucketInstance;
