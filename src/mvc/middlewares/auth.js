import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

const auth = (req, res, next) => {
    try {
        // Try multiple ways to get the token
        let token = req?.headers?.authorization || 
                   req?.headers?.Authorization || 
                   req?.get?.('Authorization') ||
                   req?.get?.('authorization');

        // Remove 'Bearer ' prefix if present
        if (token) {
            token = token.replace(/^Bearer\s+/i, '');
        }

        if (token) {
            req.token = token;
            // Use JWT_SECRET to match token generation (or JWT_KEY as fallback)
            const jwtSecret = env.JWT_SECRET || env.JWT_KEY;
            jwt.verify(token, jwtSecret, function (err, decoded) {
                if (err) {
                    return res.status(403).send({
                        success: false,
                        message: 'Please, Login.',
                    });
                }
                req.user = decoded;
                // Ensure req.user.id is set (in case decoded uses _id or userId)
                if (!req.user.id && req.user._id) {
                  req.user.id = req.user._id;
                }
                if (!req.user.id && req.user.userId) {
                  req.user.id = req.user.userId;
                }
                next();
            });
        } else {
            return res.status(403).send({
                success: false,
                unAuthorized: true,
                message: 'Unauthorized - No token provided',
            });
        }
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Authentication error occurred',
        });
    }
};

export default auth;