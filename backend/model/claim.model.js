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
        required: true
    },
    opt_expiresAt: {
        type: Date,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    claimedAt: {
        type: Date,
        default: Date.now
    },
    processByWhichAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    }
}, { timestamps: true })
claimSchema.index({ opt_expiresAt: 1 }, { expireAfterSeconds: 3600 });

export const Claim = mongoose.model("Claim", claimSchema);