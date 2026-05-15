import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { ApiResponse } from "../utilities/api_response.js";
import { Item } from "../model/items.model.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utilities/cloudinary.js";
import fs from "fs";

// ─── Helper: clean up temp file ───────────────────────────────────────────────
const deleteTempFile = (localPath) => {
    try {
        if (localPath && fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch {
        // Non-critical — log and move on
        console.warn("Could not delete temp file:", localPath);
    }
};

// ─── POST /api/v1/items  ──────────────────────────────────────────────────────
/**
 * Upload a missing/found item report.
 *
 * Body (multipart/form-data):
 *   title        (string, required)
 *   description  (string, required)
 *   foundAt      (string, required)   — location where item was found
 *   category     (string, optional)   — electronics | clothing | accessories | books | documents | other
 *   contactEmail (string, optional)   — defaults to the logged-in user's email
 *   contactPhone (string, required)
 *
 * File:
 *   image        (file, required)     — JPEG / PNG / WebP, max 5 MB
 *
 * Auth: verifyJWT (Student only)
 */
const postItem = asyncHandler(async (req, res) => {
    const localImagePath = req.file?.path;

    try {
        const {
            title,
            description,
            foundAt,
            category,
            contactPhone,
        } = req.body;

        // ── Validation ────────────────────────────────────────────────────────
        const missing = [];
        if (!title?.trim())       missing.push("title");
        if (!description?.trim()) missing.push("description");
        if (!foundAt?.trim())     missing.push("foundAt");
        if (!contactPhone?.trim()) missing.push("contactPhone");
        if (!localImagePath)      missing.push("image");

        if (missing.length > 0) {
            throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
        }

        // ── Contact email: use body value or fall back to account email ───────
        const contactEmail = req.body.contactEmail?.trim()
            ? req.body.contactEmail.trim().toLowerCase()
            : req.user.email;

        // ── Upload image to Cloudinary ─────────────────────────────────────────
        const cloudinaryResponse = await uploadOnCloudinary(localImagePath);
        if (!cloudinaryResponse?.url) {
            throw new ApiError(500, "Image upload failed. Please try again.");
        }

        // ── Create the item document ──────────────────────────────────────────
        const item = await Item.create({
            title: title.trim(),
            description: description.trim(),
            image: cloudinaryResponse.url,
            foundAt: foundAt.trim(),
            category: category || "other",
            postedBy: req.user._id,
            contactEmail,
            contactPhone: contactPhone.trim(),
        });

        // ── Reflect in user's postedItems array ───────────────────────────────
        await User.findByIdAndUpdate(req.user._id, {
            $push: { postedItems: item._id },
        });

        return res
            .status(201)
            .json(new ApiResponse(201, item, "Item posted successfully"));

    } catch (error) {
        // Clean up temp file on any error
        deleteTempFile(localImagePath);
        throw error;
    }
});

// ─── GET /api/v1/items  ───────────────────────────────────────────────────────
/**
 * Get all available items (public).
 * Supports optional query filters:
 *   ?category=electronics
 *   ?status=available
 *   ?search=wallet        (searches title + description)
 */
const getAllItems = asyncHandler(async (req, res) => {
    const { category, status, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    if (search) {
        filter.$or = [
            { title:       { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { foundAt:     { $regex: search, $options: "i" } },
        ];
    }

    const items = await Item.find(filter)
        .populate("postedBy", "username college_id")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, items, "Items fetched successfully"));
});

// ─── GET /api/v1/items/:id  ───────────────────────────────────────────────────
/** Get a single item by ID (public). */
const getItemById = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id).populate(
        "postedBy",
        "username college_id"
    );

    if (!item) throw new ApiError(404, "Item not found");

    return res
        .status(200)
        .json(new ApiResponse(200, item, "Item fetched successfully"));
});

// ─── GET /api/v1/items/my-posts  ─────────────────────────────────────────────
/** Get all items posted by the logged-in user. Auth required. */
const getMyPostedItems = asyncHandler(async (req, res) => {
    const items = await Item.find({ postedBy: req.user._id }).sort({
        createdAt: -1,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, items, "Your posted items fetched"));
});

// ─── DELETE /api/v1/items/:id  ───────────────────────────────────────────────
/**
 * Delete an item.
 * - Student: can only delete their own item
 * - Admin: can delete any item
 */
const deleteItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (!item) throw new ApiError(404, "Item not found");

    const isOwner   = item.postedBy.toString() === req.user._id.toString();
    const isAdmin   = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "You are not authorised to delete this item");
    }

    await item.deleteOne();

    // Remove from user's postedItems
    await User.findByIdAndUpdate(item.postedBy, {
        $pull: { postedItems: item._id },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Item deleted successfully"));
});

export { postItem, getAllItems, getItemById, getMyPostedItems, deleteItem };
