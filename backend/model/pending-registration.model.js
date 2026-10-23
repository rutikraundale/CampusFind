import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true, lowercase: true },
        college_id: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true, unique: true },
        mobile: { type: String, required: true, trim: true },
        passwordHash: { type: String, required: true, select: false },
        otpHash: { type: String, select: false },
        otpExpiresAt: Date,
        otpAttempts: { type: Number, default: 0 },
        otpSendCount: { type: Number, default: 0 },
        otpWindowStartedAt: Date,
        otpSentAt: Date,
        status: {
            type: String,
            enum: ["pending", "creating"],
            default: "pending",
            required: true,
        },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PendingRegistration = mongoose.model(
    "PendingRegistration",
    pendingRegistrationSchema
);
