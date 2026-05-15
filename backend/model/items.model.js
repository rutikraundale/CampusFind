import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ["electronics", "clothing", "accessories", "books", "documents", "other"],
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
    status: {
        type: String,
        enum: ['available', 'pending', 'claimed'],
        default: "available"
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
    isReturned: {
        type: Boolean,
        default: false
    },
    adminHandoverDate: { type: Date, default: Date.now }


}, { timestamps: true })

export const Item = mongoose.model("Item", itemSchema);