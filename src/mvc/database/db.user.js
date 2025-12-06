import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from '../../config/env.js';
import { ensureConnection } from '../../utils/waitForConnection.js';

// Generate unique referral code
export const generateRefCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let refCode = '';
    for (let i = 0; i < 8; i++) {
        refCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return refCode;
};

// Check if refCode exists
export const checkRefCodeExists = async (refCode) => {
    try {
        const user = await User.findOne({ refCode });
        return !!user;
    } catch (error) {
        throw new Error("Error checking refCode: " + error.message);
    }
};

// Generate unique refCode (ensures uniqueness)
export const generateUniqueRefCode = async () => {
    let refCode = generateRefCode();
    let exists = await checkRefCodeExists(refCode);
    
    // Keep generating until we get a unique one
    while (exists) {
        refCode = generateRefCode();
        exists = await checkRefCodeExists(refCode);
    }
    
    return refCode;
};

// Get user by refCode
export const getUserByRefCode = async (refCode) => {
    try {
        return await User.findOne({ refCode });
    } catch (error) {
        throw new Error("Error fetching user by refCode: " + error.message);
    }
};

// Add user to referral chain (level1-4) and increment teamCount for uplines
export const addToReferralChain = async (newUserId, sponsorId) => {
    try {
        const uplines = [];
        let currentId = sponsorId;
        let level = 1;
        
        // Traverse up the referral chain to find all uplines (up to level 4)
        while (currentId && level <= 4) {
            const upline = await User.findById(currentId);
            if (!upline) break;
            
            uplines.push({ userId: currentId, level });
            
            // Move to next upline
            currentId = upline.referredBy;
            level++;
        }
        
        // Add new user to each upline's appropriate level array and increment teamCount
        for (const { userId, level } of uplines) {
            const levelField = `level${level}`;
            await User.findByIdAndUpdate(userId, {
                $push: { [levelField]: newUserId },
                $inc: { teamCount: 1 }
            });
        }
        
        // Evaluate ranks for all uplines after teamCount is incremented
        const { evaluateRank } = await import("../../utils/rankService.js");
        for (const { userId } of uplines) {
            try {
                await evaluateRank(userId);
            } catch (error) {
                console.error(`Error evaluating rank for upline ${userId}:`, error);
                // Continue even if rank evaluation fails for one upline
            }
        }
        
        return uplines;
    } catch (error) {
        throw new Error("Error adding to referral chain: " + error.message);
    }
};

// Create user (simplified for e-commerce)
export const createUser = async (userData) => {
    try {
        const { password, ...otherData } = userData;
        
        // Hash password if provided (for regular registration)
        // For Google OAuth users, password may be undefined
        let hashedPassword = null;
        if (password) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        } else {
            // Generate a random password for Google OAuth users (they won't use it)
            // This is required by the User model schema
            const saltRounds = 10;
            const randomPassword = Math.random().toString(36).slice(-12) + Date.now().toString(36);
            hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
        }
        
        // Prepare user data
        const newUserData = {
            ...otherData,
            password: hashedPassword
        };
        
        const user = new User(newUserData);
        const savedUser = await user.save();
        
        return savedUser;
    } catch (error) {
        throw new Error("Error creating user: " + error.message);
    }
}

export const getUserById = async (userId) => {
    try {
        return await User.findById(userId).select("-password");
    }
    catch(error) {
        throw new Error("Error fetching user: " + error.message);
    }
}

export const getUserByEmail = async (email) => {
    try {
        // Ensure MongoDB is connected before executing query
        await ensureConnection();
        return await User.findOne({ email: email.toLowerCase() });
    }
    catch(error) {
        throw new Error("Error fetching user by email: " + error.message);
    }
}

// Get user by phone
export const getUserByPhone = async (phone) => {
    try {
        return await User.findOne({ phone });
    } catch (error) {
        throw new Error("Error fetching user by phone: " + error.message);
    }
}

export const findUserByIdAndUpdate = async (userId, updateData) => {
    try {
        // If password is being updated, hash it
        if (updateData.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }
        
        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch(error) {
        throw new Error("Error updating user: " + error.message);
    }
}

export const getAllUsers = async (options = {}) => {
    try {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Build query with filters
        const query = {};
        
        // Search filter (name, email, phone, refCode)
        if (options.search) {
            query.$or = [
                { fullName: { $regex: options.search, $options: 'i' } },
                { email: { $regex: options.search, $options: 'i' } },
                { phone: { $regex: options.search, $options: 'i' } },
                { refCode: { $regex: options.search, $options: 'i' } }
            ];
        }
        
        // Investment range filter
        if (options.minInvestment !== null || options.maxInvestment !== null) {
            query.totalInvestment = {};
            if (options.minInvestment !== null) {
                query.totalInvestment.$gte = options.minInvestment;
            }
            if (options.maxInvestment !== null) {
                query.totalInvestment.$lte = options.maxInvestment;
            }
        }
        
        // Earnings range filter
        if (options.minEarnings !== null || options.maxEarnings !== null) {
            query.totalEarnings = {};
            if (options.minEarnings !== null) {
                query.totalEarnings.$gte = options.minEarnings;
            }
            if (options.maxEarnings !== null) {
                query.totalEarnings.$lte = options.maxEarnings;
            }
        }
        
        // Build sort object
        const sortBy = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };
        
        const users = await User.find(query)
            .select("-password")
            .sort(sort)
            .skip(skip)
            .limit(limit);
        
        const total = await User.countDocuments(query);
        
        return {
            users,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }
    catch(error) {
        throw new Error("Error fetching users: " + error.message);
    }
}

export const deleteUserById = async (userId) => {
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch(error) {
        throw new Error("Error deleting user: " + error.message);
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    }
    catch(error) {
        throw new Error("Error comparing passwords: " + error.message);
    }
}

export const generateToken = (userId) => {
    try {
        return jwt.sign({ id: userId }, env.JWT_SECRET, {
            expiresIn: "7d"
        });
    }
    catch(error) {
        throw new Error("Error generating token: " + error.message);
    }
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    }
    catch(error) {
        throw new Error("Error verifying token: " + error.message);
    }
}

// OTP related functions
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const saveOTP = async (userId, otp) => {
    try {
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        
        const user = await User.findByIdAndUpdate(userId, {
            otp,
            otpExpires
        }, { new: true }).select("-password");
        
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch(error) {
        throw new Error("Error saving OTP: " + error.message);
    }
}

export const verifyOTP = async (userId, otp) => {
    try {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error("User not found");
        }
        
        if (!user.otp || !user.otpExpires) {
            throw new Error("No OTP found for this user");
        }
        
        if (new Date() > user.otpExpires) {
            throw new Error("OTP has expired");
        }
        
        if (user.otp !== otp) {
            throw new Error("Invalid OTP");
        }
        
        // Clear OTP and mark email as verified
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $unset: { otp: 1, otpExpires: 1 },
            emailVerified: true,
            verified: true
        }, { new: true }).select("-password");
        
        return updatedUser;
    }
    catch(error) {
        throw new Error("Error verifying OTP: " + error.message);
    }
}

export const resendOTP = async (userId) => {
    try {
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error("User not found");
        }
        
        if (user.emailVerified) {
            throw new Error("Email is already verified");
        }
        
        const otp = generateOTP();
        return await saveOTP(userId, otp);
    }
    catch(error) {
        throw new Error("Error resending OTP: " + error.message);
    }
}