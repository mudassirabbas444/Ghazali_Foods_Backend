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
        const { fullName, email, phone, password, walletInfo, referredBy } = req.body;

        // Validate required fields
        if (!fullName || !email || !phone || !password) {
            return {
                success: false,
                message: "Full name, email, phone, and password are required",
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

        // Check if phone already exists
        const existingPhone = await getUserByPhone(phone);
        if (existingPhone) {
            return {
                success: false,
                message: "User with this phone number already exists",
                statusCode: 400
            };
        }

        // Validate referredBy - NOW REQUIRED
        if (!referredBy) {
            return {
                success: false,
                message: "Referral code is required",
                statusCode: 400
            };
        }

        const sponsor = await getUserByRefCode(referredBy);
        if (!sponsor) {
            return {
                success: false,
                message: "Invalid referral code",
                statusCode: 400
            };
        }
        const sponsorId = sponsor?._id;

        // Create user (this will handle refCode generation and referral chain)
        // referredBy is now required, so sponsorId will always be set
        const user = await createUser({
            fullName,
            email,
            phone,
            password,
            walletInfo: walletInfo || "",
            referredBy: sponsorId
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
                phone: user.phone,
                refCode: user.refCode,
                walletInfo: user.walletInfo,
                totalInvestment: user.totalInvestment,
                totalEarnings: user.totalEarnings,
                availableBalance: user.availableBalance,
                rank: user.rank,
                teamCount: user.teamCount,
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
                phone: user.phone,
                refCode: user.refCode,
                walletInfo: user.walletInfo,
                totalInvestment: user.totalInvestment,
                totalEarnings: user.totalEarnings,
                availableBalance: user.availableBalance,
                rank: user.rank,
                teamCount: user.teamCount,
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

