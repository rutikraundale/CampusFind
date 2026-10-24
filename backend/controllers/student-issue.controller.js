import mongoose from "mongoose";
import { StudentIssue } from "../model/student-issue.model.js";
import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { ApiResponse } from "../utilities/api_response.js";

const ISSUE_CATEGORIES = ["Item handover concern", "Request to remove item", "Other"];
const ISSUE_STATUSES = ["Pending", "Solved", "Reject"];

export const createStudentIssue = asyncHandler(async (req, res) => {
    const { category, subject, description, relatedItem } = req.body || {};
    if (!ISSUE_CATEGORIES.includes(category)) {
        throw new ApiError(400, "Select a valid issue category");
    }
    if (typeof subject !== "string" || !subject.trim() || subject.trim().length > 120) {
        throw new ApiError(400, "Enter a subject of 1 to 120 characters");
    }
    if (typeof description !== "string" || !description.trim() || description.trim().length > 2000) {
        throw new ApiError(400, "Enter issue details of 1 to 2000 characters");
    }
    if (relatedItem && !mongoose.isValidObjectId(relatedItem)) {
        throw new ApiError(400, "Enter a valid related item ID");
    }

    const issue = await StudentIssue.create({
        submittedBy: req.user._id,
        submitterName: req.user.username,
        submitterEmail: req.user.email,
        category,
        subject: subject.trim(),
        description: description.trim(),
        relatedItem: relatedItem || null,
    });

    return res.status(201).json(new ApiResponse(201, issue, "Issue submitted successfully"));
});

export const getMyStudentIssues = asyncHandler(async (req, res) => {
    const issues = await StudentIssue.find({ submittedBy: req.user._id })
        .populate("relatedItem", "title")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, issues, "Your issues fetched successfully"));
});

export const getAllStudentIssues = asyncHandler(async (_req, res) => {
    const issues = await StudentIssue.find()
        .populate("submittedBy", "username email college_id")
        .populate("relatedItem", "title")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, issues, "Student issues fetched successfully"));
});

export const updateStudentIssueStatus = asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body || {};
    if (!ISSUE_STATUSES.includes(status)) {
        throw new ApiError(400, "Status must be Pending, Solved, or Reject");
    }
    if (adminNote !== undefined && (typeof adminNote !== "string" || adminNote.trim().length > 1000)) {
        throw new ApiError(400, "Admin note must be 1000 characters or fewer");
    }

    const issue = await StudentIssue.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                status,
                ...(adminNote !== undefined ? { adminNote: adminNote.trim() } : {}),
            },
        },
        { new: true, runValidators: true }
    )
        .populate("submittedBy", "username email college_id")
        .populate("relatedItem", "title");

    if (!issue) throw new ApiError(404, "Issue not found");
    return res.status(200).json(new ApiResponse(200, issue, "Issue status updated successfully"));
});
