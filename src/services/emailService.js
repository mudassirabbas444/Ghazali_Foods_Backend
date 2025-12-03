/**
 * Email service using nodemailer
 */

import admin, { db } from '../global/firebaseAdmin.js';

// Email is handled solely by Firebase Trigger Email Extension via Firestore

/**
 * Send email using nodemailer
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - Email HTML content
 * @param {string} emailData.text - Email text content (optional)
 * @returns {Promise<Object>} - Send result
 */

export const sendEmail = async (emailData) => {
  try {
    const { to, subject, html, text, cc, bcc, attachments } = emailData;
    if (!to || !subject || !html) {
      throw new Error('Missing required email fields: to, subject, html');
    }

    if (!db) {
      throw new Error('Firestore is not initialized');
    }

    const mailDoc = {
      to,
      message: {
        subject,
        html,
        text: (typeof text === 'string' && text.length > 0) ? text : html.replace(/<[^>]*>/g, '')
      }
    };
    if (Array.isArray(cc) && cc.length > 0) mailDoc.cc = cc;
    if (Array.isArray(bcc) && bcc.length > 0) mailDoc.bcc = bcc;
    if (Array.isArray(attachments) && attachments.length > 0) mailDoc.attachments = attachments;

    const ref = await db.collection('mail').add(mailDoc);
    console.log('Queued email via Firestore mail doc:', ref.id);
    return { success: true, messageId: ref.id, message: 'Email queued' };
  } catch (error) {
    console.error('Error queueing email:', error);
    return { success: false, message: 'Failed to queue email', error: error.message };
  }
};
export const verifyEmailConfig = async () => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    await db.collection('_health').doc('email').set({ ts: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { success: true, message: 'Firestore available for email queue' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, message: 'Email queue unavailable', error: error.message };
  }
};

export default {
  sendEmail,
  verifyEmailConfig
};
