

import { getUserByEmail, findUserByIdAndUpdate } from '../mvc/database/db.user.js';
import { sendEmail } from './emailService.js';
import User from '../mvc/models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
export const sendPasswordResetEmail = async (req) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return {
        success: false,
        message: 'Email is required',
        statusCode: 400
      };
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    
    if (!user) {
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        statusCode: 200
      };
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);
    
    // Set token expiry (1 hour)
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    
    // Save token to user
    await findUserByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: resetTokenExpires
    });

    // Create reset URL
    const { env } = await import('../config/env.js');
    const frontendUrl = env.FRONTEND_URL;
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    console.log('Password reset URL:', resetUrl);
    
    // Email content
    const emailContent = {
      to: user.email,
      subject: 'Password Reset Request - Dealistaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Dealistaan</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Hello ${user.fullName || user.email},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password for your Dealistaan account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;
                        display: inline-block;">
                Reset Your Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #667eea; word-break: break-all; font-size: 14px;">
              ${resetUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await sendEmail(emailContent);
    
    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      statusCode: 200
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      message: 'Failed to send password reset email',
      statusCode: 500,
      error: error.message
    };
  }
};
export const resetPassword = async (req) => {
  try {
    const { token, password } = req.body;
    
    // Create frontend URL
    const { env } = await import('../config/env.js');
    const frontendUrl = env.FRONTEND_URL;
    
    if (!token || !password) {
      return {
        success: false,
        message: 'Token and password are required',
        statusCode: 400
      };
    }

    // Hash the provided token
    const hashedToken = hashResetToken(token);
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Additional check: see if token exists but expired
      const expiredUser = await User.findOne({
        resetPasswordToken: hashedToken
      });
      
      if (expiredUser) {
        
        return {
          success: false,
          message: 'Reset token has expired. Please request a new password reset link.',
          statusCode: 400
        };
      }
      
   return {
        success: false,
        message: 'Invalid or expired reset token',
        statusCode: 400
      };
    }
    

    // Validate password strength
    if (password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long',
        statusCode: 400
      };
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update password and clear reset token
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
    });

    // Send confirmation email
    const emailContent = {
      to: user.email,
      subject: 'Password Reset Successful - Dealistaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Dealistaan</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset Successful</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Hello ${user.fullName || user.email},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold;
                        display: inline-block;">
                Login to Your Account
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If you didn't make this change, please contact our support team immediately.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    await sendEmail(emailContent);
    
    return {
      success: true,
      message: 'Password reset successful',
      statusCode: 200
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: 'Failed to reset password',
      statusCode: 500,
      error: error.message
    };
  }
};

export default {
  sendPasswordResetEmail,
  resetPassword
};
