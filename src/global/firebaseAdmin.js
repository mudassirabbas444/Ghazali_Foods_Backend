// src/global/firebaseAdmin.js
import admin from 'firebase-admin';
import { env } from '../config/env.js';

if (!admin.apps.length) {
  const json = env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
  }

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

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey,
    }),
    storageBucket: bucketName,
  });
}

export default admin;
export const db = admin.firestore();
export const bucket = admin.storage().bucket();
