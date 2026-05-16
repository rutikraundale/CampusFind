import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { ApiResponse } from "../utilities/api_response.js";
import { Item } from "../model/items.model.js";
import { Claim } from "../model/claim.model.js";
import { User } from "../model/user.model.js";
import { Admin } from "../model/admin.model.js";
import crypto from "crypto";
import { sendClaimOtpEmail } from "../services/email.service.js";

// ─── Helper: generate a 6-digit OTP ──────────────────────────────────────────
const generateOTP = () =>
    crypto.randomInt(100000, 999999).toString();

// ─── POST /api/v1/claims/:itemId  ─────────────────────────────────────────────
/**
 * Student initiates a claim on an available item.
 * Generates a 6-digit OTP valid for 1 hour.
 * In production: send OTP to student's email / phone.
 */
const initiateClaim = asyncHandler(async (req, res) => {
    const {itemId,email}=req.params;
    if(!itemId || !email){
        throw new ApiError(400,"Item ID and email are required");
    }
    const item = await Item.findById(itemId);
    const user=await User.findById(email);
    if (!item) throw new ApiError(404, "Item not found");
    if (!user) throw new ApiError(404, "User not found");
    if (item.status !== "available") {
        throw new ApiError(400, `Item is already ${item.status}`);
    }

    // Prevent poster from claiming their own item
    if (item.postedBy.toString() === user._id.toString()) {
        throw new ApiError(400, "You cannot claim an item you posted");
    }

    // Cancel any existing unverified claim for this student + item
    await Claim.deleteMany({
        itemId: item._id,
        student_id: user._id,
        isVerified: false,
    });

    const otp_code = generateOTP();
    const opt_expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const claim = await Claim.create({
        itemId: item._id,
        student_id: user._id,
        otp_code,
        opt_expiresAt,
    });

    await sendClaimOtpEmail(email,otp_code);

    // Mark item as pending
    item.status = "pending";
    await item.save();

    return res.status(201).json(
        new ApiResponse(201, {
            claimId: claim._id,
            itemId: item._id,
            message: "OTP generated. Show it to the admin to complete your claim.",
            otp_code: process.env.NODE_ENV !== "production" ? otp_code : undefined,
            expiresAt: opt_expiresAt,
        }, "Claim initiated successfully")
    );
});

// ─── POST /api/v1/claims/:claimId/verify  ────────────────────────────────────
/**
 * Admin verifies the OTP the student presents in person.
 * On success: marks claim as verified, item as claimed, logs admin and date.
 */
const verifyClaim = asyncHandler(async (req, res) => {
    const { otp_code } = req.body;
    if (!otp_code?.trim()) throw new ApiError(400, "OTP is required");

    const claim = await Claim.findById(req.params.claimId);
    if (!claim) throw new ApiError(404, "Claim not found");

    if (claim.isVerified) {
        throw new ApiError(400, "This claim has already been verified");
    }

    if (new Date() > claim.opt_expiresAt) {
        throw new ApiError(400, "OTP has expired. Please initiate a new claim.");
    }

    if (claim.otp_code !== otp_code.trim()) {
        throw new ApiError(401, "Invalid OTP");
    }

    // Mark claim as verified
    claim.isVerified = true;
    claim.processByWhichAdmin = req.user._id;
    await claim.save();

    // Update item: claimed + mark returned
    await Item.findByIdAndUpdate(claim.itemId, {
        status: "claimed",
        isReturned: true,
        adminHandoverDate: new Date(),
    });

    // Track in student's claimedItems
    await User.findByIdAndUpdate(claim.student_id, {
        $addToSet: { claimedItems: claim.itemId },
    });

    return res.status(200).json(
        new ApiResponse(200, { claimId: claim._id }, "Item handed over successfully")
    );
});

// ─── GET /api/v1/claims  (Admin) ─────────────────────────────────────────────
/** Admin: view all claims with item and student details. */
const getAllClaims = asyncHandler(async (req, res) => {
    const { verified } = req.query; // ?verified=true/false

    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === "true";

    const claims = await Claim.find(filter)
        .populate("itemId", "title category foundAt status image")
        .populate("student_id", "username email college_id")
        .populate("processByWhichAdmin", "email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, claims, "Claims fetched successfully")
    );
});

// ─── GET /api/v1/claims/my-claims  (Student) ─────────────────────────────────
/** Student: view their own claim history. */
const getMyClaims = asyncHandler(async (req, res) => {
    const claims = await Claim.find({ student_id: req.user._id })
        .populate("itemId", "title category foundAt status image contactPhone")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, claims, "Your claims fetched")
    );
});

// ─── DELETE /api/v1/claims/:claimId  (Student — cancel pending claim) ────────
const cancelClaim = asyncHandler(async (req, res) => {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) throw new ApiError(404, "Claim not found");

    if (claim.student_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only cancel your own claims");
    }

    if (claim.isVerified) {
        throw new ApiError(400, "Cannot cancel an already-verified claim");
    }

    // Revert item back to available
    await Item.findByIdAndUpdate(claim.itemId, { status: "available" });

    await claim.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Claim cancelled and item marked available again")
    );
});

export { initiateClaim, verifyClaim, getAllClaims, getMyClaims, cancelClaim };
