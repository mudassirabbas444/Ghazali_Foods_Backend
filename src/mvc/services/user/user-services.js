import {
    createUser,
    getUserById,
    getUserByEmail,
    findUserByIdAndUpdate,
    getAllUsers,
    deleteUserById,
    comparePassword,
    generateToken,
    generateOTP,
    saveOTP
} from "../../database/db.user.js";
import User from "../../models/User.js";
import { sendOTPEmail } from "./otp-services.js";
import { validateAvatarUrl } from "../../../utils/firebaseValidation.js";
import { cleanupUserAvatar } from "../../../services/imageCleanup.js";

const registerUser = async (req) => {
    try {
        const { email, phone } = req?.body;
        
        // Check if user already exists
        const existingUserByEmail = await getUserByEmail(email);
        if (existingUserByEmail) {
            return {
                success: false,
                message: "User with this email already exists",
                statusCode: 400,
                user: null
            };
        }
        
        const existingUserByPhone = await User.findOne({ phone });
        if (existingUserByPhone) {
            return {
                success: false,
                message: "User with this phone already exists",
                statusCode: 400,
                user: null
            };
        }
        
        const user = await createUser(req?.body);
        if (user) {
            // Generate OTP and save it
            const otp = generateOTP();
            await saveOTP(user._id, otp);
            
            // Send OTP email
            const emailResult = await sendOTPEmail(user.email, user.name, otp);
            
            if (!emailResult.success) {
                return {
                    success: false,
                    message: "User created but failed to send verification email",
                    statusCode: 500,
                    user: null
                };
            }
            
            // Generate token
            const token = generateToken(user._id);
            
            return {
                success: true,
                message: "User registered successfully. Please check your email for verification code.",
                statusCode: 201,
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
                token,
                requiresVerification: true
            };
        } else {
            return {
                success: false,
                message: "Failed to create user",
                statusCode: 400,
                user: null
            };
        }
    }
    catch(error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
}

const loginUser = async (req) => {
    try {
        const { email, password } = req?.body;
        
        // Find user by email
        const user = await getUserByEmail(email);
        if (!user) {
            return {
                success: false,
                message: "Invalid email or password",
                statusCode: 401,
                user: null
            };
        }
        
        // Check password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: "Invalid email or password",
                statusCode: 401,
                user: null
            };
        }
        
        // Check if email is verified (only if emailVerified field exists in schema)
        // Skip this check for admin users or if emailVerified field doesn't exist
        if (user.emailVerified === false && !user.isAdmin) {
            // Generate new OTP and send email
            const otp = generateOTP();
            await saveOTP(user._id, otp);
            
            // Send OTP email
            const emailResult = await sendOTPEmail(user.email, user.fullName || user.name, otp);
            
            return {
                success: false,
                message: "Please verify your email address. A new verification code has been sent to your email.",
                statusCode: 403,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    name: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    emailVerified: user.emailVerified
                },
                requiresVerification: true
            };
        }
        
        // Update last login
        await findUserByIdAndUpdate(user._id, { lastLogin: new Date() });
        
        // Generate token
        const token = generateToken(user._id);
        
        return {
            success: true,
            message: "Login successful",
            statusCode: 200,
            user: {
                id: user._id,
                fullName: user.fullName,
                name: user.fullName,
                email: user.email,
                phone: user.phone,
                city: user.city,
                isActive: user.isActive,
                isAdmin: user.isAdmin,
                verified: user.verified,
                emailVerified: user.emailVerified
            },
            token
        };
    }
    catch(error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
}

const getUserProfile = async (req) => {
    try {
        const userId = req?.user?.id || req?.query?.id;
        const user = await getUserById(userId);
        
        if (user) {
            return {
                success: true,
                message: "User profile fetched successfully",
                statusCode: 200,
                user: user
            };
        } else {
            return {
                success: false,
                message: "User not found",
                statusCode: 404,
                user: null
            };
        }
    }
    catch(error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
}

const updateUserProfile = async (req) => {
    try {
        const userId = req?.user?.id || req?.query?.id;
        const updateData = { ...req?.body };
        
        delete updateData.role;
        delete updateData.verified;
        delete updateData._id;
        
        // Handle avatar file upload if provided
        if (req?.file) {
            try {
                const { uploadImage } = await import("../../../services/uploadService.js");
                const uploadResult = await uploadImage(
                    req.file.buffer,
                    'avatars',
                    userId,
                    req.file.originalname
                );
                updateData.avatar = uploadResult.url;
            } catch (uploadError) {
                console.error('Avatar upload error:', uploadError);
                return {
                    success: false,
                    message: `Failed to upload avatar: ${uploadError.message}`,
                    statusCode: 500
                };
            }
        } else if (updateData.avatar) {
            // Validate avatar URL if provided as string
            const avatarValidation = validateAvatarUrl(updateData.avatar);
            if (!avatarValidation.isValid) {
                return {
                    success: false,
                    message: "Invalid avatar URL",
                    statusCode: 400,
                    errors: avatarValidation.errors
                };
            }
            updateData.avatar = avatarValidation.validUrl;
        }
        
        const user = await findUserByIdAndUpdate(userId, updateData);
        if (user) {
            return {
                success: true,
                message: "User profile updated successfully",
                statusCode: 200,
                user: user
            };
        } else {
            return {
                success: false,
                message: "Failed to update user profile",
                statusCode: 400,
                user: null
            };
        }
    }
    catch(error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
}

const getAllUsersService = async (req) => {
    try {
        const options = {
            page: req?.query?.page || 1,
            limit: req?.query?.limit || 20,
            search: req?.query?.search || '',
            sortBy: req?.query?.sortBy || 'createdAt',
            sortOrder: req?.query?.sortOrder || 'desc',
            minInvestment: req?.query?.minInvestment ? parseFloat(req.query.minInvestment) : null,
            maxInvestment: req?.query?.maxInvestment ? parseFloat(req.query.maxInvestment) : null,
            minEarnings: req?.query?.minEarnings ? parseFloat(req.query.minEarnings) : null,
            maxEarnings: req?.query?.maxEarnings ? parseFloat(req.query.maxEarnings) : null,
        };
        const result = await getAllUsers(options);
        return {
            success: true,
            message: "Users fetched successfully",
            statusCode: 200,
            users: result.users || [],
            total: result.total || 0,
            page: result.page || 1,
            pages: result.pages || 1,
            data: result // Keep for backward compatibility
        };
    }
    catch(error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
}

const changePassword = async (req) => {
    try {
        const userId = req?.user?.id;
        const { currentPassword, newPassword } = req?.body;
        
        if (!userId) {
            return {
                success: false,
                message: "User not authenticated",
                statusCode: 401
            };
        }
        
        if (!currentPassword || !newPassword) {
            return {
                success: false,
                message: "Current password and new password are required",
                statusCode: 400
            };
        }
        
        // Get user with password
        const user = await User.findById(userId);
        if (!user) {
            return {
                success: false,
                message: "User not found",
                statusCode: 404
            };
        }
        
        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return {
                success: false,
                message: "Current password is incorrect",
                statusCode: 400
            };
        }
        
        // Validate new password
        if (newPassword.length < 6) {
            return {
                success: false,
                message: "New password must be at least 6 characters long",
                statusCode: 400
            };
        }
        
        // Update password
        const updatedUser = await findUserByIdAndUpdate(userId, { password: newPassword });
        if (updatedUser) {
            return {
                success: true,
                message: "Password changed successfully",
                statusCode: 200
            };
        } else {
            return {
                success: false,
                message: "Failed to change password",
                statusCode: 500
            };
        }
    }
    catch(error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
}

const deleteUser = async (req) => {
    try {
        const userId = req?.query?.id;
        
        if (!userId) {
            return {
                success: false,
                message: "User ID is required",
                statusCode: 400
            };
        }

        // Get user first to cleanup avatar
        const userToDelete = await getUserById(userId);
        
        const user = await deleteUserById(userId);
        if (user) {
            // Cleanup Firebase avatar
            if (userToDelete) {
                await cleanupUserAvatar(userToDelete);
            }
            
            return {
                success: true,
                message: "User deleted successfully",
                statusCode: 200,
                user: user
            };
        } else {
            return {
                success: false,
                message: "Failed to delete user",
                statusCode: 400,
                user: null
            };
        }
    }
    catch(error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
}

export default {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsersService,
    deleteUser,
    changePassword
}
