import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ["electronics", "clothing", "accessories", "books", "documents", "wallet", "id card", "keys", "other"],
        default: "other",
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    foundAt: {
        type: String,
        required: true
    },
    foundDate: {
        type: Date,
        default: Date.now,
    },
    reportType: {
        type: String,
        enum: ["lost", "found"],
        default: "found",
        index: true,
    },
    status: {
        type: String,
        enum: ['available', 'pending', 'claimed'],
        default: "available"
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "postedByModel",
        required: true,
    },
    postedByModel: {
        type: String,
        enum: ["User", "Admin"],
        default: "User",
        required: true,
    },
    uploadSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoundItemUploadSession",
        unique: true,
        sparse: true,
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    handoverClaim: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Claim",
    },
    handedOverBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
    handoverAt: Date,
    responsibilityDeclaration: {
        version: {
            type: String,
            enum: ["v1"],
        },
        acceptedAt: Date,
        acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    // Denormalised contact info so item pages display it without a populate()
    contactEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    contactPhone: {
        type: String,
        required: true,
        trim: true,
    },
    adminHandoverDate: { type: Date, default: Date.now }


}, { timestamps: true })

export const Item = mongoose.model("Item", itemSchema);