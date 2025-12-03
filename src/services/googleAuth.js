
import { OAuth2Client } from 'google-auth-library';
import { getUserByEmail, createUser } from '../mvc/database/db.user.js';
import { generateToken } from '../mvc/database/db.user.js';

import { env } from '../config/env.js';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
export const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    return {
      success: true,
      userInfo: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      }
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return {
      success: false,
      error: 'Invalid Google token'
    };
  }
};

export const authenticateWithGoogle = async (idToken) => {
  try {
    const tokenVerification = await verifyGoogleToken(idToken);
    
    if (!tokenVerification.success) {
      return {
        success: false,
        message: 'Invalid Google token',
        statusCode: 401
      };
    }

    const { userInfo } = tokenVerification;
    
    let user = await getUserByEmail(userInfo.email);
    
    if (user) {
      // User exists, just generate token
      const token = generateToken(user._id);
      
      return {
        success: true,
        message: 'Login successful',
        statusCode: 200,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          refCode: user.refCode,
          isAdmin: user.isAdmin || false
        },
        token
      };
    } else {
      // Create new user with Google OAuth data
      // Generate unique phone number using Google ID and timestamp to ensure uniqueness
      const uniquePhone = `google_${userInfo.googleId}_${Date.now()}`;
      
      const newUserData = {
        fullName: userInfo.name || userInfo.email.split('@')[0], // Use name from Google or email prefix
        email: userInfo.email,
        phone: uniquePhone, // Unique phone for Google users
        // password will be auto-generated in createUser if not provided
      };
      
      const newUser = await createUser(newUserData);
      
      if (newUser) {        
        const token = generateToken(newUser._id);
        
        return {
          success: true,
          message: 'Registration successful',
          statusCode: 201,
          user: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone,
            refCode: newUser.refCode,
            isAdmin: newUser.isAdmin || false
          },
          token
        };
      } else {
        return {
          success: false,
          message: 'Failed to create user',
          statusCode: 500
        };
      }
    }
  } catch (error) {
    console.error('Error in Google authentication:', error);
    return {
      success: false,
      message: 'Authentication failed',
      statusCode: 500,
      error: error.message
    };
  }
};

export default {
  verifyGoogleToken,
  authenticateWithGoogle
};
