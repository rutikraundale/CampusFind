import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { ApiResponse } from "../utilities/api_response.js";
import { Item } from "../model/items.model.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utilities/cloudinary.js";
import {
    isResponsibilityDeclarationAccepted,
    normalizeIndianMobile,
    normalizeStudentEmail,
    RESPONSIBILITY_DECLARATION_VERSION,
} from "../utilities/student-registration.js";
import { GuestReportVerification } from "../model/guest-report-verification.model.js";
import fs from "fs";
import crypto from "crypto";
import { sendVerificationOtpEmail } from "../services/email.service.js";

// ─── Helper: clean up temp file ───────────────────────────────────────────────
const deleteTempFile = (localPath) => {
    try {
        if (localPath && fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch {
        // Non-critical — log and move on
        console.warn("Could not delete temp file:", localPath);
    }
};

const guestOtpSecret = () => {
    const secret = process.env.GUEST_REPORT_OTP_SECRET || process.env.REGISTRATION_OTP_SECRET || process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new ApiError(500, "Guest report OTP security is not configured");
    return secret;
};

const generateGuestOtp = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
const hashGuestOtp = (otp) => crypto.createHmac("sha256", guestOtpSecret()).update(otp).digest("hex");
const matchesGuestOtpHash = (storedHash, candidateHash) => {
    if (typeof storedHash !== "string" || !/^[\da-f]{64}$/i.test(storedHash)) return false;
    const stored = Buffer.from(storedHash, "hex");
    const candidate = Buffer.from(candidateHash, "hex");
    return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
};
const generateGuestVerificationProof = () => crypto.randomBytes(32).toString("hex");
const hashGuestVerificationProof = (proof) => crypto.createHash("sha256").update(proof).digest("hex");

// ─── POST /api/v1/items  ──────────────────────────────────────────────────────
/**
 * Upload a missing/found item report.
 *
 * Body (multipart/form-data):
 *   title        (string, required)
 *   description  (string, required)
 *   foundAt      (string, required)   — location where item was found
 *   category     (string, optional)   — electronics | clothing | accessories | books | documents | other
 *   declarationAccepted / declarationVersion — required current responsibility statement
 *
 * File:
 *   image        (file, required)     — JPEG / PNG / WebP, max 5 MB
 *
 * Auth: verifyJWT (Student only)
 */
const postItem = asyncHandler(async (req, res,next) => {
    const localImagePath = req.file?.path;

    try {

        const body = req.body || {};
        const {
            title,
            description,
            foundAt,
            reportType,
            category,
            declarationAccepted,
            declarationVersion,
        } = body;

        // ── Validation ────────────────────────────────────────────────────────
        const missing = ["title", "description", "foundAt"].filter(
            (field) => typeof body[field] !== "string" || !body[field].trim()
        );
        if (!localImagePath) missing.push("image");

        if (missing.length > 0) {
            throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
        }
        if (reportType !== undefined && typeof reportType !== "string") {
            throw new ApiError(400, "Report type must be lost or found");
        }
        if (category !== undefined && typeof category !== "string") {
            throw new ApiError(400, "Select a valid item category");
        }
        const normalizedReportType = typeof reportType === "string" ? reportType.trim().toLowerCase() : "found";
        if (!["lost", "found"].includes(normalizedReportType)) {
            throw new ApiError(400, "Report type must be lost or found");
        }
        if (!isResponsibilityDeclarationAccepted(declarationAccepted, declarationVersion)) {
            throw new ApiError(400, "Accept the current responsibility declaration before posting");
        }
        if (title.trim().length > 120 || description.trim().length > 500 || foundAt.trim().length > 120) {
            throw new ApiError(400, "Item title, description, or location exceeds the allowed length");
        }

        // ── Contact identity always comes from the authenticated account ────
        const allowedCategories = [
            "electronics", "clothing", "accessories", "books", "documents",
            "wallet", "id card", "keys", "other",
        ];
        const normalizedCategory = typeof category === "string"
            ? category.trim().toLowerCase()
            : "other";
        if (!allowedCategories.includes(normalizedCategory)) {
            throw new ApiError(400, "Select a valid item category");
        }

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
            reportType: normalizedReportType,
            category: normalizedCategory,
            postedBy: req.user._id,
            contactEmail: req.user.email,
            contactPhone: req.user.mobile,
            responsibilityDeclaration: {
                version: RESPONSIBILITY_DECLARATION_VERSION,
                acceptedAt: new Date(),
                acceptedBy: req.user._id,
            },
        });

        // ── Reflect in user's postedItems array ───────────────────────────────
        await User.findByIdAndUpdate(req.user._id, {
            $push: { postedItems: item._id },
        });

        return res
            .status(201)
            .json(new ApiResponse(201, item, "Item posted successfully"));

    } catch (error) {
        deleteTempFile(localImagePath);
        return next(error);
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
            { title:        { $regex: search, $options: "i" } },
            { description:  { $regex: search, $options: "i" } },
            { foundAt:      { $regex: search, $options: "i" } },
            { reporterEmail:{ $regex: search, $options: "i" } },
            { contactEmail: { $regex: search, $options: "i" } },
        ];
    }

    const items = await Item.find(filter)
        .select("-contactEmail -contactPhone -responsibilityDeclaration")
        .populate("postedBy", "username college_id")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, items, "Items fetched successfully"));
});

const getAdminItems = asyncHandler(async (_req, res) => {
    const items = await Item.find()
        .populate("postedBy", "username email college_id")
        .populate("claimedBy", "username email college_id")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, items, "Administrative item records fetched"));
});

// ─── GET /api/v1/items/:id  ───────────────────────────────────────────────────
/** Get a single item by ID (public). */
const getItemById = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id)
        .select("-contactEmail -contactPhone -responsibilityDeclaration")
        .populate(
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
    const items = await Item.find({
        $or: [
            { postedBy: req.user._id, postedByModel: "User" },
            { reporterEmail: req.user.email },
            { contactEmail: req.user.email },
        ],
    }).sort({
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

    const isOwner = !!item.postedBy && item.postedByModel === "User" && item.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "You are not authorised to delete this item");
    }

    await item.deleteOne();

    // Remove from user's postedItems
    if (item.postedBy && item.postedByModel === "User") {
        await User.findByIdAndUpdate(item.postedBy, {
            $pull: { postedItems: item._id },
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Item deleted successfully"));
});

const sendGuestReportOtp = asyncHandler(async (req, res) => {
    const normalizedEmail = normalizeStudentEmail(req.body?.email);
    if (!normalizedEmail) {
        throw new ApiError(400, "Enter a valid @kbtcoe.org campus email address");
    }

    const now = new Date();
    const otp = generateGuestOtp();
    const otpHash = hashGuestOtp(otp);

    const existing = await GuestReportVerification.findOne({ email: normalizedEmail, purpose: "guest_report" }).select("+otpHash");
    const resendCooldown = existing && existing.otpSentAt && now.getTime() - existing.otpSentAt.getTime() < 60_000;
    if (existing && resendCooldown) {
        throw new ApiError(429, "Wait one minute before requesting another verification code");
    }
    if (existing && existing.otpSendCount >= 3) {
        throw new ApiError(429, "Too many guest-report verification codes requested. Please try again later.");
    }

    const update = {
        email: normalizedEmail,
        purpose: "guest_report",
        otpHash,
        otpExpiresAt: new Date(now.getTime() + 5 * 60 * 1000),
        otpAttempts: 0,
        otpSentAt: now,
        otpSendCount: existing ? existing.otpSendCount + 1 : 1,
        status: "pending",
        verifiedAt: undefined,
        verifiedUntil: undefined,
        verificationProofHash: undefined,
        verificationProofIssuedAt: undefined,
        usedAt: undefined,
    };

    const doc = existing
        ? await GuestReportVerification.findOneAndUpdate(
            { _id: existing._id, purpose: "guest_report" },
            { $set: update },
            { new: true }
        )
        : await GuestReportVerification.create(update);

    try {
        await sendVerificationOtpEmail(normalizedEmail, otp);
    } catch (error) {
        await GuestReportVerification.updateOne(
            { _id: doc._id },
            { $unset: { otpHash: 1, otpExpiresAt: 1, otpSentAt: 1 } }
        );
        throw new ApiError(502, "Could not send the verification email. Please try again.");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Verification code sent to your campus email"));
});

const verifyGuestReportOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body || {};
    const normalizedEmail = normalizeStudentEmail(email);
    if (!normalizedEmail || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
        throw new ApiError(400, "Enter a valid campus email and six-digit verification code");
    }

    const now = new Date();
    const record = await GuestReportVerification.findOne({
        email: normalizedEmail,
        purpose: "guest_report",
        status: { $in: ["pending", "verified"] },
        otpExpiresAt: { $gt: now },
    }).select("+otpHash +verificationProofHash");

    if (!record) {
        throw new ApiError(400, "Invalid or expired verification code");
    }
    if ((record.otpAttempts ?? 0) >= 5) {
        throw new ApiError(429, "Too many incorrect verification codes. Request a new code.");
    }

    const candidateHash = hashGuestOtp(otp.trim());
    if (!matchesGuestOtpHash(record.otpHash, candidateHash)) {
        await GuestReportVerification.updateOne(
            { _id: record._id, otpExpiresAt: { $gt: now } },
            { $inc: { otpAttempts: 1 } }
        );
        throw new ApiError(400, "Invalid or expired verification code");
    }

    const proof = generateGuestVerificationProof();
    const updated = await GuestReportVerification.findOneAndUpdate(
        {
            _id: record._id,
            purpose: "guest_report",
            status: { $in: ["pending", "verified"] },
            otpExpiresAt: { $gt: now },
        },
        {
            $set: {
                status: "verified",
                verifiedAt: now,
                verifiedUntil: new Date(now.getTime() + 15 * 60 * 1000),
                verificationProofHash: hashGuestVerificationProof(proof),
                verificationProofIssuedAt: now,
                usedAt: undefined,
            },
            $unset: { otpHash: 1 },
        },
        { new: true }
    );

    if (!updated) {
        throw new ApiError(400, "Invalid or expired verification code");
    }

    return res.status(200).json(new ApiResponse(200, {
        email: normalizedEmail,
        verificationProof: proof,
        expiresAt: updated.verifiedUntil,
    }, "College email verified successfully"));
});

const createGuestItem = asyncHandler(async (req, res, next) => {
    const localImagePath = req.file?.path;

    try {
        const body = req.body || {};
        const {
            title,
            description,
            foundAt,
            reportType,
            category,
            declarationAccepted,
            declarationVersion,
            reporterName,
            reporterPhone,
            reporterEmail,
            verificationProof,
        } = body;

        const normalizedEmail = normalizeStudentEmail(reporterEmail || body.email);
        const normalizedPhone = normalizeIndianMobile(reporterPhone || body.contactPhone);
        const normalizedName = typeof reporterName === "string" ? reporterName.trim() : "";

        const missing = ["title", "description", "foundAt", "reporterName", "reporterPhone", "reporterEmail"].filter(
            (field) => typeof body[field] !== "string" || !body[field].trim()
        );
        if (!localImagePath) missing.push("image");
        if (!normalizedEmail) missing.push("reporterEmail");
        if (!normalizedPhone) missing.push("reporterPhone");
        if (!normalizedName) missing.push("reporterName");
        if (missing.length > 0) {
            throw new ApiError(400, `Missing or invalid required fields: ${missing.join(", ")}`);
        }
        if (!isResponsibilityDeclarationAccepted(declarationAccepted, declarationVersion)) {
            throw new ApiError(400, "Accept the current responsibility declaration before posting");
        }

        if (reportType !== undefined && typeof reportType !== "string") {
            throw new ApiError(400, "Report type must be lost or found");
        }
        const normalizedReportType = typeof reportType === "string" ? reportType.trim().toLowerCase() : "found";
        if (!["lost", "found"].includes(normalizedReportType)) {
            throw new ApiError(400, "Report type must be lost or found");
        }

        const allowedCategories = [
            "electronics", "clothing", "accessories", "books", "documents",
            "wallet", "id card", "keys", "other",
        ];
        const normalizedCategory = typeof category === "string" ? category.trim().toLowerCase() : "other";
        if (!allowedCategories.includes(normalizedCategory)) {
            throw new ApiError(400, "Select a valid item category");
        }

        if (typeof verificationProof !== "string" || !verificationProof.trim()) {
            throw new ApiError(400, "A valid campus-email verification proof is required");
        }

        const proofHash = hashGuestVerificationProof(verificationProof.trim());
        const verificationRecord = await GuestReportVerification.findOne({
            email: normalizedEmail,
            purpose: "guest_report",
            status: "verified",
            verifiedUntil: { $gt: new Date() },
            verificationProofHash: proofHash,
        }).select("+verificationProofHash");

        if (!verificationRecord) {
            throw new ApiError(401, "Your campus-email verification proof is invalid or expired");
        }

        const cloudinaryResponse = await uploadOnCloudinary(localImagePath);
        if (!cloudinaryResponse?.url) {
            throw new ApiError(500, "Image upload failed. Please try again.");
        }

        const item = await Item.create({
            title: title.trim(),
            description: description.trim(),
            image: cloudinaryResponse.url,
            foundAt: foundAt.trim(),
            reportType: normalizedReportType,
            category: normalizedCategory,
            postedBy: null,
            postedByModel: null,
            contactEmail: normalizedEmail,
            contactPhone: normalizedPhone,
            reporterName: normalizedName,
            reporterEmail: normalizedEmail,
            reporterPhone: normalizedPhone,
            responsibilityDeclaration: {
                version: RESPONSIBILITY_DECLARATION_VERSION,
                acceptedAt: new Date(),
                acceptedBy: null,
            },
        });

        await GuestReportVerification.updateOne(
            { _id: verificationRecord._id },
            { $set: { status: "used", usedAt: new Date(), verifiedUntil: undefined, verificationProofHash: undefined } }
        );

        return res.status(201).json(new ApiResponse(201, item, "Guest item report submitted successfully"));
    } catch (error) {
        deleteTempFile(localImagePath);
        return next(error);
    }
});

export {
    postItem,
    getAllItems,
    getAdminItems,
    getItemById,
    getMyPostedItems,
    deleteItem,
    sendGuestReportOtp,
    verifyGuestReportOtp,
    createGuestItem,
};
