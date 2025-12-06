import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: null, sparse: true }, // Optional, no unique constraint
    password: { type: String, required: true },
    avatar: { type: String, default: null }, // Profile picture URL
    
    // Email verification
    emailVerified: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    
    // Account status
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    
    // Password reset fields
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
