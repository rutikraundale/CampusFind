import crypto from "crypto";
import fs from "fs/promises";
import { fileTypeFromFile } from "file-type";
import mongoose from "mongoose";
import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { ApiResponse } from "../utilities/api_response.js";
import { Admin } from "../model/admin.model.js";
import { Item } from "../model/items.model.js";
import { FoundItemUploadSession } from "../model/found-item-upload-session.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utilities/cloudinary.js";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const publishLockMs = 2 * 60 * 1000;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const cleanTempFile = async (path) => {
    if (!path) return;
    try {
        await fs.rm(path, { force: true });
    } catch (error) {
        console.error("Could not remove temporary upload file:", error);
    }
};

const getSessionLifetimeMs = () => {
    const minutes = Number(process.env.FOUND_ITEM_UPLOAD_TTL_MINUTES || 8);
    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 10) {
        throw new ApiError(500, "FOUND_ITEM_UPLOAD_TTL_MINUTES must be between 5 and 10");
    }
    return minutes * 60 * 1000;
};

const getLiveSessionByToken = async (token) => {
    if (typeof token !== "string" || token.length < 40 || token.length > 100) {
        throw new ApiError(404, "Upload session is invalid or unavailable");
    }
    const session = await FoundItemUploadSession.findOne({ tokenHash: hashToken(token) })
        .select("+tokenHash");
    if (!session) throw new ApiError(404, "Upload session is invalid or unavailable");

    await expireSession(session);
    if (session.expiresAt <= new Date() && !["expired", "cancelled", "consumed"].includes(session.status)) {
        session.status = "expired";
    }
    return session;
};

const isImageFile = async (path) => {
    const detected = await fileTypeFromFile(path);
    return detected && allowedImageTypes.has(detected.mime);
};

const releaseCloudinaryAsset = async (publicId) => {
    if (!publicId) return false;
    const result = await deleteFromCloudinary(publicId);
    return result?.result === "ok" || result?.result === "not found";
};

const expireSession = async (session) => {
    if (session.expiresAt > new Date()) return;
    if (["pending", "uploaded"].includes(session.status)) {
        await FoundItemUploadSession.updateOne(
            { _id: session._id, status: session.status },
            { $set: { status: "expired" } }
        );
    }
    if (!["expired", "cancelled", "consumed", "publishing"].includes(session.status)) {
        session.status = "expired";
    }
};

const completeImageUpload = async ({ session, file }) => {
    if (!file) throw new ApiError(400, "An image file is required");
    let cloudinaryResponse;
    let uploadClaimed = false;

    try {
        if (!(await isImageFile(file.path))) {
            throw new ApiError(400, "Choose a valid JPEG, PNG, or WebP image");
        }

        const claimed = await FoundItemUploadSession.findOneAndUpdate(
            {
                _id: session._id,
                status: "pending",
                expiresAt: { $gt: new Date() },
            },
            { $set: { status: "uploading", uploadingAt: new Date() } },
            { new: true }
        );
        if (!claimed) {
            await expireSession(session);
            throw new ApiError(409, "This upload session is no longer available");
        }
        uploadClaimed = true;

        cloudinaryResponse = await uploadOnCloudinary(file.path, {
            folder: "campusfind/found-item-staging",
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
        });
        if (!cloudinaryResponse?.secure_url || !cloudinaryResponse?.public_id) {
            throw new ApiError(502, "Image storage failed. Please try again");
        }

        const completed = await FoundItemUploadSession.findOneAndUpdate(
            {
                _id: session._id,
                status: "uploading",
                expiresAt: { $gt: new Date() },
            },
            {
                $set: {
                    status: "uploaded",
                    imageUrl: cloudinaryResponse.secure_url,
                    imagePublicId: cloudinaryResponse.public_id,
                    uploadedAt: new Date(),
                },
                $unset: { uploadingAt: 1 },
            },
            { new: true }
        );

        if (!completed) {
            await FoundItemUploadSession.updateOne(
                { _id: session._id, status: "uploading", expiresAt: { $lte: new Date() } },
                { $set: { status: "expired" } }
            );
            throw new ApiError(409, "This upload session expired or was cancelled during upload");
        }

        return completed;
    } catch (error) {
        if (cloudinaryResponse?.public_id) {
            await releaseCloudinaryAsset(cloudinaryResponse.public_id);
        }
        if (uploadClaimed) {
            await FoundItemUploadSession.updateOne(
                { _id: session._id, status: "uploading", expiresAt: { $gt: new Date() } },
                { $set: { status: "pending" }, $unset: { uploadingAt: 1 } }
            );
        }
        throw error;
    } finally {
        await cleanTempFile(file.path);
    }
};

const validateItemDetails = (body) => {
    const { title, description, category, foundAt, foundDate, reportType, contactEmail, contactPhone } = body;
    const stringFields = { title, description, foundAt, contactEmail, contactPhone };
    if (Object.values(stringFields).some((value) => typeof value !== "string" || !value.trim())) {
        throw new ApiError(400, "Title, description, location, contact email, and contact phone are required");
    }
    if (title.trim().length > 120 || description.trim().length > 2000 || foundAt.trim().length > 160) {
        throw new ApiError(400, "One or more item details exceed the allowed length");
    }
    if (contactEmail.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
        throw new ApiError(400, "Enter a valid contact email");
    }
    if (!/^\d{10}$/.test(contactPhone.trim())) {
        throw new ApiError(400, "Contact phone must be exactly 10 digits");
    }

    const normalizedCategory = String(category || "other").trim().toLowerCase();
    const categories = ["electronics", "clothing", "accessories", "books", "documents", "wallet", "id card", "keys", "other"];
    if (!categories.includes(normalizedCategory)) {
        throw new ApiError(400, "Choose a valid item category");
    }
    const normalizedReportType = String(reportType || "found").trim().toLowerCase();
    if (!["lost", "found"].includes(normalizedReportType)) {
        throw new ApiError(400, "Report type must be lost or found");
    }

    const parsedFoundDate = new Date(foundDate);
    if (
        typeof foundDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(foundDate) ||
        Number.isNaN(parsedFoundDate.getTime()) ||
        parsedFoundDate.toISOString().slice(0, 10) !== foundDate ||
        parsedFoundDate > new Date()
    ) {
        throw new ApiError(400, "Enter a valid date found that is not in the future");
    }

    return {
        title: title.trim(),
        description: description.trim(),
        category: normalizedCategory,
        foundAt: foundAt.trim(),
        foundDate: parsedFoundDate,
        reportType: normalizedReportType,
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone.trim(),
    };
};

export const createUploadSession = asyncHandler(async (req, res) => {
    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + getSessionLifetimeMs());
    const session = await FoundItemUploadSession.create({
        administrator: req.user._id,
        tokenHash: hashToken(token),
        expiresAt,
    });

    return res.status(201).json(new ApiResponse(201, {
        id: session._id,
        token,
        status: session.status,
        expiresAt: session.expiresAt,
    }, "Temporary photo upload session created"));
});

export const getUploadSessionStatus = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Upload session ID is invalid");
    }
    const session = await FoundItemUploadSession.findOne({
        _id: req.params.id,
        administrator: req.user._id,
    });
    if (!session) throw new ApiError(404, "Upload session not found");

    await expireSession(session);
    return res.status(200).json(new ApiResponse(200, {
        id: session._id,
        status: session.status,
        expiresAt: session.expiresAt,
        imageUrl: session.status === "uploaded" ? session.imageUrl : undefined,
    }, "Upload session status fetched"));
});

export const uploadImageFromAdmin = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        await cleanTempFile(req.file?.path);
        throw new ApiError(400, "Upload session ID is invalid");
    }
    const session = await FoundItemUploadSession.findOne({
        _id: req.params.id,
        administrator: req.user._id,
    });
    if (!session) {
        await cleanTempFile(req.file?.path);
        throw new ApiError(404, "Upload session not found");
    }
    await expireSession(session);
    if (session.status !== "pending") {
        await cleanTempFile(req.file?.path);
        throw new ApiError(409, "This upload session is no longer available");
    }

    const completed = await completeImageUpload({ session, file: req.file });
    return res.status(200).json(new ApiResponse(200, {
        id: completed._id,
        status: completed.status,
        imageUrl: completed.imageUrl,
        expiresAt: completed.expiresAt,
    }, "Image uploaded successfully"));
});

export const validateMobileUpload = asyncHandler(async (req, res) => {
    const session = await getLiveSessionByToken(req.params.token);
    await expireSession(session);
    return res.status(200).json(new ApiResponse(200, {
        status: session.status,
        expiresAt: session.expiresAt,
    }, "Upload session validated"));
});

export const uploadImageFromMobile = asyncHandler(async (req, res) => {
    const session = req.mobileUploadSession || await getLiveSessionByToken(req.params.token);
    await expireSession(session);
    if (session.status !== "pending") {
        await cleanTempFile(req.file?.path);
        throw new ApiError(409, "This upload session is no longer available");
    }

    const completed = await completeImageUpload({ session, file: req.file });
    return res.status(200).json(new ApiResponse(200, {
        status: completed.status,
    }, "Image uploaded successfully"));
});

export const cancelUploadSession = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Upload session ID is invalid");
    }
    const session = await FoundItemUploadSession.findOneAndUpdate(
        {
            _id: req.params.id,
            administrator: req.user._id,
            status: { $in: ["pending", "uploading", "uploaded", "expired"] },
        },
        { $set: { status: "cancelled" }, $unset: { uploadingAt: 1 } },
        { new: true }
    );
    if (!session) {
        const existing = await FoundItemUploadSession.findOne({
            _id: req.params.id,
            administrator: req.user._id,
        });
        if (!existing) throw new ApiError(404, "Upload session not found");
        if (existing.status === "consumed") throw new ApiError(409, "A published item's image cannot be cancelled");
        if (existing.status === "cancelled") {
            return res.status(200).json(new ApiResponse(200, { status: "cancelled" }, "Upload session cancelled"));
        }
        if (existing.status === "publishing") throw new ApiError(409, "Item publication is in progress");
        throw new ApiError(409, "Upload is in progress; try cancelling again");
    }

    if (session.imagePublicId && await releaseCloudinaryAsset(session.imagePublicId)) {
        session.imagePublicId = undefined;
        session.imageUrl = undefined;
        await session.save();
    }
    return res.status(200).json(new ApiResponse(200, { status: session.status }, "Upload session cancelled"));
});

const finishPublishedSession = async (session, item) => {
    await FoundItemUploadSession.updateOne(
        { _id: session._id, administrator: session.administrator, status: "publishing" },
        { $set: { status: "consumed", item: item._id }, $unset: { publishingAt: 1 } }
    );
    return item;
};

export const publishFoundItem = asyncHandler(async (req, res) => {
    const details = validateItemDetails(req.body || {});
    if (!mongoose.Types.ObjectId.isValid(req.body?.uploadSessionId)) {
        throw new ApiError(400, "A valid photo upload session is required");
    }
    const session = await FoundItemUploadSession.findOne({
        _id: req.body.uploadSessionId,
        administrator: req.user._id,
    });
    if (!session) throw new ApiError(404, "Uploaded photo session not found");

    let existingItem = await Item.findOne({ uploadSession: session._id });
    if (existingItem) {
        if (session.status !== "consumed") await finishPublishedSession(session, existingItem);
        return res.status(200).json(new ApiResponse(200, existingItem, "Item was already published"));
    }
    if (session.expiresAt <= new Date()) {
        await expireSession(session);
        throw new ApiError(410, "Photo upload session expired. Upload the photo again");
    }
    const publishingStartedAt = session.publishingAt || session.updatedAt;
    if (session.status === "publishing" && publishingStartedAt < new Date(Date.now() - publishLockMs)) {
        await FoundItemUploadSession.updateOne(
            { _id: session._id, status: "publishing", updatedAt: session.updatedAt },
            { $set: { status: "uploaded" }, $unset: { publishingAt: 1 } }
        );
        session.status = "uploaded";
    }

    const publishing = await FoundItemUploadSession.findOneAndUpdate(
        {
            _id: session._id,
            administrator: req.user._id,
            status: "uploaded",
            expiresAt: { $gt: new Date() },
        },
        { $set: { status: "publishing", publishingAt: new Date() } },
        { new: true }
    );
    if (!publishing) {
        if (session.status === "publishing") {
            throw new ApiError(409, "Item publication is already in progress");
        }
        if (session.status === "consumed") {
            existingItem = await Item.findOne({ uploadSession: session._id });
            if (existingItem) return res.status(200).json(new ApiResponse(200, existingItem, "Item was already published"));
        }
        throw new ApiError(409, "Upload a photo before publishing this item");
    }

    try {
        const admin = await Admin.findById(req.user._id).select("email");
        if (!admin) throw new ApiError(401, "Administrator account is no longer available");

        const item = await Item.create({
            ...details,
            image: publishing.imageUrl,
            postedBy: req.user._id,
            postedByModel: "Admin",
            contactEmail: details.contactEmail || admin.email,
            uploadSession: publishing._id,
        });
        await finishPublishedSession(publishing, item);
        return res.status(201).json(new ApiResponse(201, item, "Item report published successfully"));
    } catch (error) {
        const createdItem = await Item.findOne({ uploadSession: session._id });
        if (createdItem) {
            await finishPublishedSession(publishing, createdItem);
            return res.status(200).json(new ApiResponse(200, createdItem, "Item was already published"));
        }
        await FoundItemUploadSession.updateOne(
            { _id: session._id, status: "publishing" },
            { $set: { status: "uploaded" }, $unset: { publishingAt: 1 } }
        );
        throw error;
    }
});

export const cleanupExpiredUploadSessions = async () => {
    const now = new Date();
    const staleUploadCutoff = new Date(now.getTime() - 5 * 60 * 1000);
    await FoundItemUploadSession.updateMany(
        { expiresAt: { $lte: now }, status: { $in: ["pending", "uploaded"] } },
        { $set: { status: "expired" } }
    );
    await FoundItemUploadSession.updateMany(
        { status: "uploading", uploadingAt: { $lte: staleUploadCutoff } },
        { $set: { status: "expired" }, $unset: { uploadingAt: 1 } }
    );

    const orphanedSessions = await FoundItemUploadSession.find({
        status: { $in: ["expired", "cancelled"] },
        imagePublicId: { $exists: true, $ne: null },
    }).select("_id imagePublicId");

    for (const session of orphanedSessions) {
        if (await releaseCloudinaryAsset(session.imagePublicId)) {
            await FoundItemUploadSession.updateOne(
                { _id: session._id, imagePublicId: session.imagePublicId, status: { $in: ["expired", "cancelled"] } },
                { $unset: { imagePublicId: 1, imageUrl: 1 } }
            );
        }
    }

    await FoundItemUploadSession.deleteMany({
        status: { $in: ["expired", "cancelled"] },
        expiresAt: { $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        $or: [{ imagePublicId: { $exists: false } }, { imagePublicId: null }],
    });
};

export { cleanTempFile };

export const requireMobileUploadSession = asyncHandler(async (req, _res, next) => {
    const session = await getLiveSessionByToken(req.params.token);
    if (session.status !== "pending" || session.expiresAt <= new Date()) {
        throw new ApiError(409, "This upload session is no longer available");
    }
    req.mobileUploadSession = session;
    next();
});
