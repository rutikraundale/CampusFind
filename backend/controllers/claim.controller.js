import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { ApiResponse } from "../utilities/api_response.js";
import { Item } from "../model/items.model.js";
import { Claim } from "../model/claim.model.js";
import { User } from "../model/user.model.js";
import { Admin } from "../model/admin.model.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendHandoverOtpEmail } from "../services/email.service.js";

// ─── Helper: generate a 6-digit OTP ──────────────────────────────────────────
const generateOTP = () =>
    crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const hashHandoverOtp = (otp) => {
    const secret = process.env.CLAIM_OTP_SECRET || process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new ApiError(500, "Claim OTP hashing is not configured");
    return crypto.createHmac("sha256", secret).update(otp).digest("hex");
};

const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    return `${name.slice(0, 1)}${"*".repeat(Math.max(name.length - 1, 2))}@${domain}`;
};

const validateObjectId = (value, label) => {
    if (!mongoose.Types.ObjectId.isValid(value)) throw new ApiError(400, `${label} is invalid`);
};

const initiateClaim = asyncHandler(async (req, res) => {
    throw new ApiError(410, "Online claim requests are no longer available. Visit the administration office for in-person verification.");
});

const verifyClaim = asyncHandler(async (req, res) => {
    throw new ApiError(410, "Use the admin handover verification workflow to verify and confirm the physical item handover.");
});

const getHandoverItems = asyncHandler(async (_req, res) => {
    const items = await Item.find({
        reportType: { $ne: "lost" },
        status: { $in: ["available", "claimed"] },
    })
        .select("title category foundAt foundDate reportType image status createdAt")
        .sort({ status: 1, foundDate: -1 });
    return res.status(200).json(new ApiResponse(200, items, "Handover items fetched"));
});

const checkHandoverStudent = asyncHandler(async (req, res) => {
    const email = req.body?.email;
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new ApiError(400, "Enter a valid CampusFind student email");
    }

    const student = await User.findOne({ email: email.trim().toLowerCase() })
        .select("username email isEmailVerified");
    if (!student) {
        return res.status(200).json(new ApiResponse(200, {
            studentExists: false,
            emailVerified: false,
        }, "No CampusFind student account was found"));
    }

    return res.status(200).json(new ApiResponse(200, {
        studentExists: true,
        emailVerified: student.isEmailVerified,
        student: student.isEmailVerified
            ? { id: student._id, username: student.username, email: student.email }
            : undefined,
    }, student.isEmailVerified ? "Verified student account found" : "Student email must be verified"));
});

const resolveHandoverParticipants = async ({ itemId, email, adminId }) => {
    validateObjectId(itemId, "Item ID");
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new ApiError(400, "Enter the student's registered email address");
    }

    const [item, student] = await Promise.all([
        Item.findById(itemId).select("title status postedBy postedByModel"),
        User.findOne({ email: email.trim().toLowerCase() }).select("username email isEmailVerified"),
    ]);
    if (!item) throw new ApiError(404, "Item not found");
    if (item.status !== "available") throw new ApiError(409, "This item is no longer available for handover");
    if (!student) throw new ApiError(404, "Student account not found. Ask the student to register before proceeding.");
    if (!student.isEmailVerified) throw new ApiError(409, "The student's CampusFind email must be verified before handover");
    if (item.postedByModel === "User" && item.postedBy.toString() === student._id.toString()) {
        throw new ApiError(409, "An item cannot be handed over to the account that posted it");
    }

    return { item, student, adminId };
};

const getHandoverClaimForAdmin = async (claimId, adminId) => {
    validateObjectId(claimId, "Handover session ID");
    const claim = await Claim.findOne({
        _id: claimId,
        workflow: "admin_handover",
        initiatedByAdmin: adminId,
    }).select("+otpHash");
    if (!claim) throw new ApiError(404, "Handover session not found");
    return claim;
};

const getHandoverSession = asyncHandler(async (req, res) => {
    validateObjectId(req.params.handoverId, "Handover session ID");
    const claim = await getHandoverClaimForAdmin(req.params.handoverId, req.user._id);
    if (
        claim.handoverActive &&
        claim.handoverStatus !== "completed" &&
        claim.otpExpiresAt &&
        claim.otpExpiresAt <= new Date()
    ) {
        await Claim.updateOne(
            { _id: claim._id, handoverActive: true },
            { $set: { handoverStatus: "expired", handoverActive: false }, $unset: { otpHash: 1 } }
        );
        claim.handoverStatus = "expired";
    }
    const [item, student] = await Promise.all([
        Item.findById(claim.itemId).select("title category foundAt foundDate image status"),
        User.findById(claim.student_id).select("username email"),
    ]);
    return res.status(200).json(new ApiResponse(200, {
        handoverId: claim._id,
        status: claim.handoverStatus,
        expiresAt: claim.otpExpiresAt,
        resendAfter: claim.otpSentAt ? new Date(claim.otpSentAt.getTime() + 60_000) : undefined,
        maskedEmail: claim.verifiedEmail ? maskEmail(claim.verifiedEmail) : undefined,
        item,
        student: student ? { id: student._id, username: student.username, email: student.email } : undefined,
        handoverConfirmed: claim.handoverConfirmed,
        handoverConfirmedAt: claim.handoverConfirmedAt,
    }, "Handover session fetched"));
});

const cancelHandoverSession = asyncHandler(async (req, res) => {
    const claim = await getHandoverClaimForAdmin(req.params.handoverId, req.user._id);
    if (!claim.handoverActive) {
        throw new ApiError(409, "This handover session is no longer active");
    }
    const cancelled = await Claim.findOneAndUpdate(
        {
            _id: claim._id,
            initiatedByAdmin: req.user._id,
            handoverActive: true,
            handoverCompletionStarted: { $ne: true },
            handoverStatus: { $in: ["otp_sent", "verified"] },
        },
        {
            $set: { handoverActive: false, handoverStatus: "cancelled" },
            $unset: { otpHash: 1 },
        },
        { new: true }
    );
    if (!cancelled) throw new ApiError(409, "Handover session changed; reload and try again");
    return res.status(200).json(new ApiResponse(200, { status: cancelled.handoverStatus }, "Handover session cancelled"));
});

const sendHandoverOtp = asyncHandler(async (req, res) => {
    const { itemId, studentEmail, destinationEmail } = req.body || {};
    if (typeof destinationEmail !== "string" || destinationEmail.trim().toLowerCase() !== studentEmail?.trim()?.toLowerCase()) {
        throw new ApiError(400, "OTP can only be sent to the student's registered CampusFind email");
    }
    const { item, student } = await resolveHandoverParticipants({
        itemId,
        email: studentEmail,
        adminId: req.user._id,
    });

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSends = await Claim.countDocuments({
        workflow: "admin_handover",
        student_id: student._id,
        otpSentAt: { $gte: oneHourAgo },
    });
    if (recentSends >= 5) throw new ApiError(429, "OTP send limit reached for this student. Try again later.");

    let claim = await Claim.findOne({
        itemId: item._id,
        workflow: "admin_handover",
        handoverActive: true,
    }).select("+otpHash");
    const now = new Date();

    if (claim && (claim.otpExpiresAt <= now || ["locked", "expired", "delivery_failed"].includes(claim.handoverStatus))) {
        await Claim.updateOne(
            { _id: claim._id, handoverActive: true },
            { $set: { handoverActive: false, handoverStatus: "expired" }, $unset: { otpHash: 1 } }
        );
        claim = null;
    }

    if (claim) {
        if (
            claim.initiatedByAdmin.toString() !== req.user._id.toString() ||
            claim.student_id.toString() !== student._id.toString()
        ) {
            throw new ApiError(409, "Another active handover verification exists for this item");
        }
        if (claim.otpSendCount >= 3) throw new ApiError(429, "OTP resend limit reached for this handover");
        if (claim.otpSentAt && now.getTime() - claim.otpSentAt.getTime() < 60_000) {
            throw new ApiError(429, "Wait 60 seconds before requesting another OTP");
        }
    } else {
        try {
            claim = await Claim.create({
                itemId: item._id,
                student_id: student._id,
                workflow: "admin_handover",
                handoverStatus: "otp_sent",
                handoverActive: true,
                otpAttempts: 0,
                otpSendCount: 0,
                initiatedByAdmin: req.user._id,
                processByWhichAdmin: req.user._id,
                verifiedEmail: student.email,
            });
        } catch (error) {
            if (error.code === 11000) throw new ApiError(409, "Another administrator has started a handover for this item");
            throw error;
        }
    }

    const otp = generateOTP();
    const otpSentAt = new Date();
    const otpExpiresAt = new Date(otpSentAt.getTime() + 5 * 60 * 1000);
    const saved = await Claim.findOneAndUpdate(
        {
            _id: claim._id,
            initiatedByAdmin: req.user._id,
            handoverActive: true,
            handoverStatus: { $in: ["otp_sent", "verified"] },
        },
        {
            $set: {
                handoverStatus: "otp_sent",
                otpHash: hashHandoverOtp(otp),
                otpExpiresAt,
                otpSentAt,
                verifiedEmail: student.email,
                otpAttempts: 0,
            },
            $inc: { otpSendCount: 1 },
            $unset: { otpVerifiedAt: 1 },
        },
        { new: true }
    );
    if (!saved) throw new ApiError(409, "Handover verification is no longer active");

    try {
        await sendHandoverOtpEmail(student.email, otp, item.title);
    } catch {
        await Claim.updateOne(
            { _id: saved._id, handoverStatus: "otp_sent" },
            {
                $set: { handoverStatus: "delivery_failed", handoverActive: false },
                $unset: { otpHash: 1, otpExpiresAt: 1 },
            }
        );
        throw new ApiError(502, "Could not send the verification email. Please try again.");
    }

    return res.status(200).json(new ApiResponse(200, {
        handoverId: saved._id,
        item: { id: item._id, title: item.title },
        student: { id: student._id, username: student.username },
        maskedEmail: maskEmail(student.email),
        expiresAt: otpExpiresAt,
        resendAfter: new Date(otpSentAt.getTime() + 60_000),
    }, "Verification code sent"));
});

const verifyHandoverOtp = asyncHandler(async (req, res) => {
    const { handoverId, otp } = req.body || {};
    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
        throw new ApiError(400, "Enter the six-digit verification code");
    }
    const claim = await getHandoverClaimForAdmin(handoverId, req.user._id);
    const now = new Date();
    if (claim.handoverStatus !== "otp_sent" || !claim.otpHash) {
        throw new ApiError(409, "This verification code is invalid, used, or no longer active");
    }
    if (!claim.otpExpiresAt || claim.otpExpiresAt <= now) {
        await Claim.updateOne(
            { _id: claim._id, handoverStatus: "otp_sent" },
            { $set: { handoverStatus: "expired", handoverActive: false }, $unset: { otpHash: 1 } }
        );
        throw new ApiError(410, "The verification code has expired. Send a new code.");
    }

    const providedHash = Buffer.from(hashHandoverOtp(otp), "hex");
    const storedHash = Buffer.from(claim.otpHash, "hex");
    const matches = providedHash.length === storedHash.length && crypto.timingSafeEqual(providedHash, storedHash);
    if (!matches) {
        const attempts = claim.otpAttempts + 1;
        const update = await Claim.findOneAndUpdate(
            { _id: claim._id, handoverStatus: "otp_sent", otpAttempts: claim.otpAttempts },
            {
                $inc: { otpAttempts: 1 },
                ...(attempts >= 5 ? { $set: { handoverStatus: "locked", handoverActive: false } } : {}),
                ...(attempts >= 5 ? { $unset: { otpHash: 1 } } : {}),
            },
            { new: true }
        );
        if (!update) throw new ApiError(409, "Verification session changed. Request a new code.");
        throw new ApiError(401, attempts >= 5 ? "Too many incorrect codes. Request a new verification code." : "Incorrect verification code");
    }

    const verified = await Claim.findOneAndUpdate(
        {
            _id: claim._id,
            initiatedByAdmin: req.user._id,
            handoverStatus: "otp_sent",
            otpHash: claim.otpHash,
            otpExpiresAt: { $gt: now },
            otpAttempts: { $lt: 5 },
        },
        {
            $set: { handoverStatus: "verified", otpVerifiedAt: now },
            $unset: { otpHash: 1 },
        },
        { new: true }
    );
    if (!verified) throw new ApiError(409, "Verification code expired or was already used");

    return res.status(200).json(new ApiResponse(200, {
        handoverId: verified._id,
        status: verified.handoverStatus,
        student: { id: verified.student_id, username: claim.student_id ? (await User.findById(claim.student_id).select("username"))?.username : undefined },
        expiresAt: verified.otpExpiresAt,
    }, "Student email verified. Confirm the physical handover separately."));
});

const confirmHandover = asyncHandler(async (req, res) => {
    const { handoverId, identityAndHandoverConfirmed } = req.body || {};
    if (identityAndHandoverConfirmed !== true) {
        throw new ApiError(400, "Confirm the in-person identity check and physical handover");
    }
    const claim = await getHandoverClaimForAdmin(handoverId, req.user._id);
    if (claim.handoverStatus === "completed" && claim.handoverConfirmed) {
        const completedItem = await Item.findOne({ _id: claim.itemId, handoverClaim: claim._id })
            .select("title status handoverAt");
        if (completedItem) {
            await User.findByIdAndUpdate(claim.student_id, {
                $addToSet: { claimedItems: claim.itemId },
            });
            return res.status(200).json(new ApiResponse(200, {
                item: completedItem,
                handoverId: claim._id,
            }, "Handover was already confirmed"));
        }
    }
    if (claim.handoverStatus !== "verified" || !claim.otpVerifiedAt) {
        throw new ApiError(409, "Verify the student's email OTP before confirming the handover");
    }
    if (!claim.otpExpiresAt || claim.otpExpiresAt <= new Date()) {
        await Claim.updateOne(
            { _id: claim._id, handoverStatus: "verified" },
            { $set: { handoverStatus: "expired", handoverActive: false } }
        );
        throw new ApiError(410, "The verification session expired. Start a new handover verification.");
    }

    const completionReserved = await Claim.findOneAndUpdate(
        {
            _id: claim._id,
            initiatedByAdmin: req.user._id,
            handoverStatus: "verified",
            handoverActive: true,
            otpVerifiedAt: { $exists: true },
            otpExpiresAt: { $gt: new Date() },
        },
        { $set: { handoverCompletionStarted: true } },
        { new: true }
    );
    if (!completionReserved) {
        throw new ApiError(409, "The handover session changed. Reload before confirming the handover.");
    }

    const now = new Date();
    let item = await Item.findOneAndUpdate(
        { _id: claim.itemId, status: "available" },
        {
            $set: {
                status: "claimed",
                claimedBy: claim.student_id,
                handoverClaim: claim._id,
                handedOverBy: req.user._id,
                handoverAt: now,
                adminHandoverDate: now,
            },
        },
        { new: true }
    ).select("title status handoverAt");

    if (!item) {
        const alreadyCompleted = await Item.findOne({
            _id: claim.itemId,
            handoverClaim: claim._id,
            status: "claimed",
        }).select("title status handoverAt");
        if (!alreadyCompleted) {
            await Claim.updateOne(
                { _id: claim._id, handoverStatus: "verified", handoverCompletionStarted: true },
                { $set: { handoverStatus: "expired", handoverActive: false, handoverCompletionStarted: false } }
            );
            throw new ApiError(409, "This item is no longer available; another handover may have completed");
        }
        item = alreadyCompleted;
    }

    const completionUpdate = await Claim.updateOne(
        { _id: claim._id, initiatedByAdmin: req.user._id, handoverStatus: "verified" },
        {
            $set: {
                handoverStatus: "completed",
                handoverConfirmed: true,
                handoverConfirmedAt: item?.handoverAt || now,
                isVerified: true,
                processByWhichAdmin: req.user._id,
                claimedAt: item?.handoverAt || now,
                handoverActive: false,
                handoverCompletionStarted: false,
            },
        }
    );
    if (!completionUpdate.matchedCount) {
        const finalizedClaim = await Claim.exists({
            _id: claim._id,
            initiatedByAdmin: req.user._id,
            handoverStatus: "completed",
            handoverConfirmed: true,
        });
        if (!finalizedClaim) throw new ApiError(409, "Could not finalize the handover record");
    }
    await User.findByIdAndUpdate(claim.student_id, {
        $addToSet: { claimedItems: claim.itemId },
    });

    return res.status(200).json(new ApiResponse(200, {
        item: item || { _id: claim.itemId, status: "claimed" },
        handoverId: claim._id,
    }, "Physical handover confirmed"));
});

const getHandoverHistory = asyncHandler(async (_req, res) => {
    const handovers = await Claim.find({ workflow: "admin_handover", handoverStatus: "completed" })
        .populate("itemId", "title image foundAt foundDate status")
        .populate("student_id", "username college_id")
        .populate("processByWhichAdmin", "email")
        .sort({ handoverConfirmedAt: -1 })
        .limit(100);
    return res.status(200).json(new ApiResponse(200, handovers, "Handover history fetched"));
});

// ─── GET /api/v1/claims  (Admin) ─────────────────────────────────────────────
/** Admin: view all claims with item and student details. */
const getAllClaims = asyncHandler(async (req, res) => {
    const { verified } = req.query; // ?verified=true/false

    const filter = {
        $or: [
            { workflow: { $ne: "admin_handover" } },
            { workflow: "admin_handover", handoverStatus: "completed", handoverConfirmed: true },
        ],
    };
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

// ─── DELETE /api/v1/claims/:claimId  (Student or Admin — cancel/reject pending claim) ────────
const cancelClaim = asyncHandler(async (req, res) => {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) throw new ApiError(404, "Claim not found");
    if (claim.workflow === "admin_handover") {
        throw new ApiError(409, "Use the handover workflow to cancel or complete this verification");
    }

    if (req.user.role !== "admin" && claim.student_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to cancel this claim");
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

export {
    initiateClaim,
    verifyClaim,
    getAllClaims,
    getMyClaims,
    cancelClaim,
    getHandoverItems,
    getHandoverSession,
    cancelHandoverSession,
    checkHandoverStudent,
    sendHandoverOtp,
    verifyHandoverOtp,
    confirmHandover,
    getHandoverHistory,
};
