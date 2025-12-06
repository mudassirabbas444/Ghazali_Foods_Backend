import {
    createUser,
    getUserByEmail,
    getUserByPhone,
    comparePassword,
    generateToken,
    getUserByRefCode
} from "../../database/db.user.js";

const registerUser = async (req) => {
    try {
        const { fullName, email, phone, password } = req.body;

        // Validate required fields
        if (!fullName || !email || !password) {
            return {
                success: false,
                message: "Full name, email, and password are required",
                statusCode: 400
            };
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return {
                success: false,
                message: "User with this email already exists",
                statusCode: 400
            };
        }

        // Check if phone already exists (only if provided)
        if (phone) {
            const existingPhone = await getUserByPhone(phone);
            if (existingPhone) {
                return {
                    success: false,
                    message: "User with this phone number already exists",
                    statusCode: 400
                };
            }
        }

        // Create user (phone is optional)
        const user = await createUser({
            fullName,
            email,
            phone: phone || null,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        return {
            success: true,
            message: "User registered successfully",
            statusCode: 201,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || null,
                avatar: user.avatar || null,
                emailVerified: user.emailVerified || false,
                verified: user.verified || false,
                isActive: user.isActive,
                isAdmin: user.isAdmin
            },
            token
        };
    } catch (error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
};

const loginUser = async (req) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return {
                success: false,
                message: "Email and password are required",
                statusCode: 400
            };
        }

        // Find user by email
        const user = await getUserByEmail(email);
        if (!user) {
            return {
                success: false,
                message: "Invalid email or password",
                statusCode: 401
            };
        }

        // Check if user is active
        if (!user.isActive) {
            return {
                success: false,
                message: "Your account has been deactivated",
                statusCode: 403
            };
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return {
                success: false,
                message: "Invalid email or password",
                statusCode: 401
            };
        }

        // Generate token
        const token = generateToken(user._id);

        return {
            success: true,
            message: "Login successful",
            statusCode: 200,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || null,
                avatar: user.avatar || null,
                emailVerified: user.emailVerified || false,
                verified: user.verified || false,
                isActive: user.isActive,
                isAdmin: user.isAdmin
            },
            token
        };
    } catch (error) {
        return {
            success: false,
            statusCode: 500,
            message: error.message
        };
    }
};

export default {
    registerUser,
    loginUser
};

