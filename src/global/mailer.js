import { sendEmail as sendEmailService } from "../services/emailService.js";

// Re-export the standardized email service for backward compatibility
export const sendEmail = async (receiverEmail, subject, html) => {
    try {
        const emailData = {
            to: receiverEmail,
            subject: subject,
            html: html
        };
        
        const result = await sendEmailService(emailData);
        return {
            success: result.success,
            message: result.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};