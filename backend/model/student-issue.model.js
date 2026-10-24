import crypto from "crypto";
import mongoose from "mongoose";

const ISSUE_ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateIssueId = () =>
    Array.from(
        { length: 10 },
        () => ISSUE_ID_ALPHABET[crypto.randomInt(ISSUE_ID_ALPHABET.length)]
    ).join("");

const studentIssueSchema = new mongoose.Schema({
    issueId: {
        type: String,
        required: true,
        unique: true,
        default: generateIssueId,
        minlength: 10,
        maxlength: 10,
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    submitterName: {
        type: String,
        required: true,
        trim: true,
    },
    submitterEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    category: {
        type: String,
        enum: ["Item handover concern", "Request to remove item", "Other"],
        required: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
    },
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        default: null,
    },
    status: {
        type: String,
        enum: ["Pending", "Solved", "Reject"],
        default: "Pending",
        index: true,
    },
    adminNote: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
    },
}, { timestamps: true });

studentIssueSchema.index({ submittedBy:  1, createdAt: -1 });

export const StudentIssue = mongoose.model("StudentIssue", studentIssueSchema);
