import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    otp_code: {
        type: String,
        required: false,
    },
    opt_expiresAt: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    processByWhichAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    claimedAt: {
        type: Date,
        default: Date.now
    },
    workflow: {
        type: String,
        enum: ["student_request", "admin_handover"],
        default: "student_request",
        index: true,
    },
    handoverStatus: {
        type: String,
        enum: ["otp_sent", "verified", "completed", "expired", "locked", "delivery_failed", "cancelled"],
    },
    otpHash: {
        type: String,
        select: false,
    },
    otpExpiresAt: Date,
    otpAttempts: {
        type: Number,
        default: 0,
    },
    otpSendCount: {
        type: Number,
        default: 0,
    },
    otpSentAt: Date,
    otpVerifiedAt: Date,
    verifiedEmail: String,
    initiatedByAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
    handoverActive: {
        type: Boolean,
    },
    handoverCompletionStarted: {
        type: Boolean,
        default: false,
    },
    handoverConfirmed: {
        type: Boolean,
        default: false,
    },
    handoverConfirmedAt: Date,
}, { timestamps: true })

claimSchema.index({ opt_expiresAt: 1 }, { expireAfterSeconds: 3600 });
claimSchema.index(
    { itemId: 1 },
    {
        unique: true,
        partialFilterExpression: { handoverActive: true },
        name: "one_active_handover_per_item",
    }
);

export const Claim = mongoose.model("Claim", claimSchema);