import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
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
        ref: "User"
    },
    adminHandoverDate: { type: Date, default: Date.now }


}, { timestamps: true })

export const Item = mongoose.model("Item", itemSchema);