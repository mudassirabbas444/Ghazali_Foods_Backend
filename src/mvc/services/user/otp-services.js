import {
    getUserById,
    verifyOTP,
    resendOTP,
    generateOTP,
    saveOTP,
    generateToken
} from "../../database/db.user.js";
import { sendEmail } from "../../../services/emailService.js";

const verifyOTPService = async (req) => {
    try {
        const { userId, otp } = req?.body;
        
        if (!userId || !otp) {
            return {
                success: false,
                message: "User ID and OTP are required",
                statusCode: 400
            };
        }
        
        const user = await verifyOTP(userId, otp);
        
        // Generate token for login
        const token = generateToken(user._id);
        
        return {
            success: true,
            message: "Email verified successfully",
            statusCode: 200,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                role: user.role,
                verified: user.verified,
                emailVerified: user.emailVerified
            },
            token
        };
    }
    catch(error) {
        return {
            success: false,
            message: error.message,
            statusCode: 400
        };
    }
}

const resendOTPService = async (req) => {
    try {
        const { userId } = req?.body;
        
        if (!userId) {
            return {
                success: false,
                message: "User ID is required",
                statusCode: 400
            };
        }
        
        const user = await getUserById(userId);
        if (!user) {
            return {
                success: false,
                message: "User not found",
                statusCode: 404
            };
        }
        
        if (user.emailVerified) {
            return {
                success: false,
                message: "Email is already verified",
                statusCode: 400
            };
        }
        
        const otp = generateOTP();
        await saveOTP(userId, otp);
        
        // Send OTP email
        const emailResult = await sendOTPEmail(user.email, user.name, otp);
        
        if (!emailResult.success) {
            return {
                success: false,
                message: "Failed to send OTP email",
                statusCode: 500
            };
        }
        
        return {
            success: true,
            message: "OTP sent successfully",
            statusCode: 200
        };
    }
    catch(error) {
        return {
            success: false,
            message: error.message,
            statusCode: 500
        };
    }
}

const sendOTPEmail = async (email, name, otp) => {
    try {
        const subject = "Verify Your Email - Dealistaan";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">Dealistaan</h1>
                    <p style="color: #666; margin: 5px 0;">Your trusted marketplace</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                    <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Hello ${name},
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                        Thank you for registering with Dealistaan! To complete your registration, please verify your email address using the OTP below:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background: #007bff; color: white; padding: 20px; border-radius: 8px; display: inline-block;">
                            <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                        </div>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        This OTP will expire in 10 minutes. If you didn't create an account with us, please ignore this email.
                    </p>
                </div>
                
                <div style="text-align: center; color: #999; font-size: 12px;">
                    <p>© 2024 Dealistaan. All rights reserved.</p>
                </div>
            </div>
        `;
        
        return await sendEmail({ to: email, subject, html });
    }
    catch(error) {
        return {
            success: false,
            message: error.message
        };
    }
}

export {
    verifyOTPService,
    resendOTPService,
    sendOTPEmail
};

export default {
    verifyOTPService,
    resendOTPService,
    sendOTPEmail
};
