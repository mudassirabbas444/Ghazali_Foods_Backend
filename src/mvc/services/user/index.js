import userServices from "./user-services.js";
import otpServices from "./otp-services.js";

export const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAllUsersService,
    deleteUser
} = userServices;

export const {
    verifyOTPService,
    resendOTPService,
    sendOTPEmail
} = otpServices;
