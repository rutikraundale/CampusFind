import mongoose from "mongoose";

const guestReportVerificationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        purpose: {
            type: String,
            enum: ["guest_report"],
            default: "guest_report",
            index: true,
        },
        otpHash: {
            type: String,
            required: true,
            select: false,
        },
        otpExpiresAt: {
            type: Date,
            required: true,
        },
        otpAttempts: {
            type: Number,
            default: 0,
        },
        otpSentAt: {
            type: Date,
            required: true,
        },
        otpSendCount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["pending", "verified", "used", "expired"],
            default: "pending",
        },
        verifiedAt: {
            type: Date,
        },
        verifiedUntil: {
            type: Date,
        },
        verificationProofHash: {
            type: String,
            select: false,
        },
        verificationProofIssuedAt: {
            type: Date,
        },
        usedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

guestReportVerificationSchema.index({ email: 1, purpose: 1 }, { unique: true });

export const GuestReportVerification = mongoose.model(
    "GuestReportVerification",
    guestReportVerificationSchema
);
