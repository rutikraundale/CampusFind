import mongoose from "mongoose";

const foundItemUploadSessionSchema = new mongoose.Schema(
    {
        administrator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
            index: true,
        },
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },
        status: {
            type: String,
            enum: ["pending", "uploading", "uploaded", "publishing", "consumed", "expired", "cancelled"],
            default: "pending",
            required: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        uploadingAt: {
            type: Date,
        },
        imageUrl: {
            type: String,
        },
        imagePublicId: {
            type: String,
        },
        uploadedAt: {
            type: Date,
        },
        publishingAt: {
            type: Date,
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        },
    },
    { timestamps: true }
);

foundItemUploadSessionSchema.index({ expiresAt: 1, status: 1 });

export const FoundItemUploadSession = mongoose.model(
    "FoundItemUploadSession",
    foundItemUploadSessionSchema
);
