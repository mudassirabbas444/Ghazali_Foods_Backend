import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String,  unique: true },
    password: { type: String, required: true },
    walletInfo: { type: String },
    avatar: { type: String, default: null }, // Profile picture URL

    refCode: { type: String, required: true, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    level1: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level2: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level3: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level4: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    totalInvestment: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },

    rank: { type: String, default: null },
    teamCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    lastSalaryPaidAt: { type: Date, default: null },
    
    // Password reset fields
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
