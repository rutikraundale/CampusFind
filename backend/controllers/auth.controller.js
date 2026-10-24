import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { User } from "../model/user.model.js";
import { Admin } from "../model/admin.model.js";
import { PendingRegistration } from "../model/pending-registration.model.js";
import { Item } from "../model/items.model.js";
import { ApiResponse } from "../utilities/api_response.js";
import { sendVerificationEmail, sendVerificationOtpEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import {
    normalizeIndianMobile,
    normalizeStudentEmail,
} from "../utilities/student-registration.js";

// ─── Shared cookie options ────────────────────────────────────────────────────
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in ms
};

// ─── Helper: pick the right model ────────────────────────────────────────────
const getModel = (role) => (role === "admin" ? Admin : User);

// ─── Helper: generate both tokens and persist refresh token ──────────────────
const generateAndSaveTokens = async (userId, role) => {
    const model = getModel(role);
    const user = await model.findById(userId);
    if (!user) throw new ApiError(500, "User not found while generating tokens");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Persist hashed refresh token would be ideal; storing plaintext for now
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const REGISTRATION_LIFETIME_MS = 30 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_SEND_WINDOW_MS = 60 * 60 * 1000;
const OTP_SEND_LIMIT = 5;
const OTP_ATTEMPT_LIMIT = 5;

const linkGuestReportsForUser = async (email, userId) => {
    const normalizedEmail = normalizeStudentEmail(email);
    if (!normalizedEmail) return 0;

    const result = await Item.updateMany(
        {
            reporterEmail: normalizedEmail,
            postedBy: null,
            $or: [
                { postedByModel: { $exists: false } },
                { postedByModel: null },
                { postedByModel: "User" },
            ],
        },
        {
            $set: {
                postedBy: userId,
                postedByModel: "User",
            },
        }
    );

    return result.modifiedCount ?? 0;
};

const otpSecret = () => {
    const secret = process.env.REGISTRATION_OTP_SECRET || process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new ApiError(500, "Registration OTP security is not configured");
    return secret;
};

const makeOtp = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
const hashOtp = (otp) =>
    crypto.createHmac("sha256", otpSecret()).update(otp).digest("hex");
const matchesOtpHash = (storedHash, candidateHash) => {
    if (typeof storedHash !== "string" || !/^[\da-f]{64}$/i.test(storedHash)) return false;
    const stored = Buffer.from(storedHash, "hex");
    const candidate = Buffer.from(candidateHash, "hex");
    return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
};

const validateRegistration = (body = {}) => {
    const { username, college_id, email, password, mobile } = body;
    if ([username, college_id, email, password, mobile].some(
        (field) => typeof field !== "string" || !field.trim()
    )) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedCollegeId = college_id.trim();
    const normalizedEmail = normalizeStudentEmail(email);
    const normalizedMobile = normalizeIndianMobile(mobile);

    if (!normalizedEmail) {
        throw new ApiError(400, "Use your exact @kbtcoe.org campus email address");
    }
    if (normalizedUsername.length > 100 || normalizedUsername.length < 2) {
        throw new ApiError(400, "Enter a valid full name");
    }
    if (normalizedCollegeId.length > 64) {
        throw new ApiError(400, "College ID must be 64 characters or fewer");
    }
    if (!normalizedMobile) {
        throw new ApiError(400, "Enter a valid 10-digit Indian mobile number");
    }
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        throw new ApiError(400, "Password must be at least 8 characters and no more than 72 bytes");
    }

    return {
        username: normalizedUsername,
        college_id: normalizedCollegeId,
        email: normalizedEmail,
        mobile: normalizedMobile,
        password,
    };
};

const sendPendingRegistrationOtp = async (registration) => {
    const otp = makeOtp();
    const now = new Date();
    const windowExpired =
        !registration.otpWindowStartedAt ||
        now.getTime() - registration.otpWindowStartedAt.getTime() >= OTP_SEND_WINDOW_MS;
    const issueFilter = {
        _id: registration._id,
        status: "pending",
        expiresAt: { $gt: now },
        $or: [
            { otpSentAt: { $exists: false } },
            { otpSentAt: { $lte: new Date(now.getTime() - OTP_RESEND_COOLDOWN_MS) } },
        ],
    };
    const issueUpdate = {
        $set: {
            otpHash: hashOtp(otp),
            otpExpiresAt: new Date(now.getTime() + OTP_LIFETIME_MS),
            otpAttempts: 0,
            otpSentAt: now,
            expiresAt: new Date(now.getTime() + REGISTRATION_LIFETIME_MS),
        },
    };
    if (windowExpired) {
        issueUpdate.$set.otpWindowStartedAt = now;
        issueUpdate.$set.otpSendCount = 1;
    } else {
        if (registration.otpSendCount >= OTP_SEND_LIMIT) {
            throw new ApiError(429, "Too many verification codes requested. Try again later.");
        }
        issueFilter.otpWindowStartedAt = registration.otpWindowStartedAt;
        issueFilter.otpSendCount = { $lt: OTP_SEND_LIMIT };
        issueUpdate.$inc = { otpSendCount: 1 };
    }

    const issued = await PendingRegistration.findOneAndUpdate(
        issueFilter,
        issueUpdate,
        { new: true }
    );
    if (!issued) {
        throw new ApiError(429, "Wait one minute before requesting another verification code");
    }

    try {
        await sendVerificationOtpEmail(issued.email, otp);
    } catch (error) {
        await PendingRegistration.updateOne(
            { _id: issued._id, otpHash: issueUpdate.$set.otpHash },
            { $unset: { otpHash: 1, otpExpiresAt: 1, otpSentAt: 1 } }
        );
        console.error("Failed to send registration OTP email:", error.message);
        throw new ApiError(502, "Could not send verification email. Please try again.");
    }
};

// Accounts are created only after the campus email OTP is verified.
const registerUser = asyncHandler(async (req, res) => {
    const fields = validateRegistration(req.body);
    const escapedEmail = fields.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingUser = await User.findOne({
        $or: [
            { college_id: fields.college_id },
            { mobile: fields.mobile },
            { username: fields.username },
            { email: { $regex: `^${escapedEmail}$`, $options: "i" } },
        ],
    });
    if (existingUser) {
        throw new ApiError(409, "Unable to start registration. Check your details or sign in.");
    }

    let pending = await PendingRegistration.findOne({ email: fields.email })
        .select("+passwordHash +otpHash");
    const now = new Date();
    if (pending && pending.expiresAt <= now) {
        await PendingRegistration.deleteOne({ _id: pending._id });
        pending = null;
    }
    if (pending && pending.status !== "pending") {
        throw new ApiError(409, "This registration has already been verified. Complete it or sign in.");
    }
    if (pending?.otpSentAt && now.getTime() - pending.otpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
        throw new ApiError(429, "Wait one minute before requesting another verification code");
    }
    if (
        pending?.otpWindowStartedAt &&
        now.getTime() - pending.otpWindowStartedAt.getTime() < OTP_SEND_WINDOW_MS &&
        pending.otpSendCount >= OTP_SEND_LIMIT
    ) {
        throw new ApiError(429, "Too many verification codes requested. Try again later.");
    }

    const passwordHash = await bcrypt.hash(fields.password, 10);
    const windowIsExpired =
        !pending?.otpWindowStartedAt ||
        now.getTime() - pending.otpWindowStartedAt.getTime() >= OTP_SEND_WINDOW_MS;
    const pendingFields = {
        username: fields.username,
        college_id: fields.college_id,
        email: fields.email,
        mobile: fields.mobile,
    };
    if (!pending) {
        pending = new PendingRegistration({
            ...pendingFields,
            passwordHash,
            otpSendCount: 0,
            otpWindowStartedAt: now,
            expiresAt: new Date(now.getTime() + REGISTRATION_LIFETIME_MS),
        });
    } else {
        Object.assign(pending, pendingFields, { passwordHash });
    }
    if (windowIsExpired) {
        pending.otpSendCount = 0;
        pending.otpWindowStartedAt = now;
    }
    pending.expiresAt = new Date(now.getTime() + REGISTRATION_LIFETIME_MS);
    try {
        await pending.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, "A registration is already in progress for these details");
        }
        throw error;
    }
    await sendPendingRegistrationOtp(pending);

    return res.status(202).json(
        new ApiResponse(202, { email: fields.email }, "Verification code sent to your campus email")
    );
});

// ─── Login (Student + Admin) ──────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!role) throw new ApiError(400, "Role is required");
    if (role === "admin" && !email) throw new ApiError(400, "Email is required for admin login");
    if (role === "Student" && !username && !email) throw new ApiError(400, "Username or email is required");

    let user;
    if (role === "admin") {
        user = await Admin.findOne({ email: email.toLowerCase() });
    } else {
        user = await User.findOne({
            $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }],
        });
    }

    if (!user) throw new ApiError(404, "User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAndSaveTokens(user._id, role);

    const model = getModel(role);
    const loggedInUser = await model.findById(user._id)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -emailVerificationOtpHash -emailVerificationOtpExpiry");

    if (role === "Student" && loggedInUser?.email) {
        await linkGuestReportsForUser(loggedInUser.email, loggedInUser._id);
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken }, "Logged in successfully")
        );
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Accept token from cookie OR request body (mobile clients)
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing");

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const model = getModel(decoded.role);
    const user = await model.findById(decoded._id);

    if (!user) throw new ApiError(401, "User not found");
    if (user.refreshToken !== incomingRefreshToken) {
        // Token reuse detected — invalidate stored token (rotation)
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(401, "Refresh token reuse detected. Please log in again.");
    }

    // Rotate: generate new pair and save
    const { accessToken, refreshToken: newRefreshToken } =
        await generateAndSaveTokens(user._id, decoded.role);

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
        .json(
            new ApiResponse(200, { accessToken }, "Access token refreshed")
        );
});

// ─── Logout ───────────────────────────────────────────────────────────────────
const logoutUser = asyncHandler(async (req, res) => {
    const model = getModel(req.user.role);

    await model.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─── Get current user (for verifying auth state) ─────────────────────────────
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched"));
});

// ─── Verify email with OTP ───────────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) throw new ApiError(400, "Token is required");

    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, "Invalid or expired verification token");

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Email verified successfully"));
});

const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body || {};
    const normalizedEmail = normalizeStudentEmail(email);
    if (!normalizedEmail || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
        throw new ApiError(400, "Enter a valid campus email and six-digit verification code");
    }

    const otpHash = hashOtp(otp.trim());
    const now = new Date();
    const pending = await PendingRegistration.findOne({
        email: normalizedEmail,
        status: "pending",
        expiresAt: { $gt: now },
        otpExpiresAt: { $gt: now },
    }).select("+otpHash");

    if (pending) {
        if (pending.otpAttempts >= OTP_ATTEMPT_LIMIT) {
            throw new ApiError(429, "Too many incorrect verification codes. Request a new code.");
        }
        if (!matchesOtpHash(pending.otpHash, otpHash)) {
            await PendingRegistration.updateOne(
                { _id: pending._id, status: "pending", otpAttempts: { $lt: OTP_ATTEMPT_LIMIT } },
                { $inc: { otpAttempts: 1 } }
            );
            throw new ApiError(400, "Invalid or expired verification code");
        }

        const verifiedRegistration = await PendingRegistration.findOneAndUpdate(
            {
                _id: pending._id,
                status: "pending",
                otpHash,
                otpExpiresAt: { $gt: now },
                expiresAt: { $gt: now },
                otpAttempts: { $lt: OTP_ATTEMPT_LIMIT },
            },
            {
                $set: {
                    status: "creating",
                },
                $unset: { otpHash: 1, otpExpiresAt: 1, otpSentAt: 1 },
            },
            { new: true }
        ).select("+passwordHash");
        if (!verifiedRegistration) throw new ApiError(400, "Invalid or expired verification code");

        let createdUser;
        try {
            createdUser = await User.createWithPasswordHash(
                {
                    username: verifiedRegistration.username,
                    college_id: verifiedRegistration.college_id,
                    email: verifiedRegistration.email,
                    mobile: verifiedRegistration.mobile,
                    isEmailVerified: true,
                },
                verifiedRegistration.passwordHash
            );
        } catch (error) {
            await PendingRegistration.deleteOne({ _id: verifiedRegistration._id, status: "creating" });
            if (error.code === 11000) {
                throw new ApiError(409, "Registration details are already in use. Please sign in.");
            }
            throw error;
        }

        await linkGuestReportsForUser(verifiedRegistration.email, createdUser._id);
        await PendingRegistration.deleteOne({ _id: verifiedRegistration._id, status: "creating" });
        const { accessToken, refreshToken } = await generateAndSaveTokens(createdUser._id, "Student");
        const user = await User.findById(createdUser._id)
            .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -emailVerificationOtpHash -emailVerificationOtpExpiry");
        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, refreshCookieOptions)
            .json(new ApiResponse(201, { user, accessToken }, "Email verified and account created"));
    }

    // Existing unverified accounts keep their OTP flow while account creation is migrated.
    const legacyUser = await User.findOne({
        email: normalizedEmail,
        isEmailVerified: false,
    }).select("+emailVerificationOtpHash");
    if (!legacyUser) throw new ApiError(400, "Invalid or expired verification code");

    const hashMatch =
        matchesOtpHash(legacyUser.emailVerificationOtpHash, otpHash) &&
        legacyUser.emailVerificationOtpExpiry > now &&
        (legacyUser.emailVerificationOtpAttempts ?? 0) < OTP_ATTEMPT_LIMIT;
    if (!hashMatch) {
        await User.updateOne({
            _id: legacyUser._id,
            isEmailVerified: false,
            $or: [
                { emailVerificationOtpAttempts: { $lt: OTP_ATTEMPT_LIMIT } },
                { emailVerificationOtpAttempts: { $exists: false } },
            ],
        }, { $inc: { emailVerificationOtpAttempts: 1 } });
        throw new ApiError(400, "Invalid or expired verification code");
    }

    const verifiedUser = await User.findOneAndUpdate(
        {
            _id: legacyUser._id,
            isEmailVerified: false,
            emailVerificationOtpHash: otpHash,
            emailVerificationOtpExpiry: { $gt: now },
            $or: [
                { emailVerificationOtpAttempts: { $lt: OTP_ATTEMPT_LIMIT } },
                { emailVerificationOtpAttempts: { $exists: false } },
            ],
        },
        {
            $set: { isEmailVerified: true },
            $unset: {
                emailVerificationToken: 1,
                emailVerificationExpiry: 1,
                emailVerificationOtpHash: 1,
                emailVerificationOtpExpiry: 1,
            },
        },
        { new: true }
    );
    if (!verifiedUser) throw new ApiError(400, "Invalid or expired verification code");

    await linkGuestReportsForUser(verifiedUser.email, verifiedUser._id);

    const { accessToken, refreshToken } = await generateAndSaveTokens(verifiedUser._id, "Student");
    const user = await User.findById(verifiedUser._id)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -emailVerificationOtpHash -emailVerificationOtpExpiry");
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse(200, { user, accessToken }, "Email verified successfully"));
});

const resendOTP = asyncHandler(async (req, res) => {
    const normalizedEmail = normalizeStudentEmail(req.body?.email);
    if (!normalizedEmail) throw new ApiError(400, "Enter a valid @kbtcoe.org campus email address");

    const now = new Date();
    const pending = await PendingRegistration.findOne({
        email: normalizedEmail,
        status: "pending",
        expiresAt: { $gt: now },
    }).select("+otpHash");
    if (pending) {
        if (pending.otpSentAt && now.getTime() - pending.otpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
            throw new ApiError(429, "Wait one minute before requesting another verification code");
        }
        if (
            pending.otpWindowStartedAt &&
            now.getTime() - pending.otpWindowStartedAt.getTime() < OTP_SEND_WINDOW_MS &&
            pending.otpSendCount >= OTP_SEND_LIMIT
        ) {
            throw new ApiError(429, "Too many verification codes requested. Try again later.");
        }
        const windowExpired =
            !pending.otpWindowStartedAt ||
            now.getTime() - pending.otpWindowStartedAt.getTime() >= OTP_SEND_WINDOW_MS;
        if (windowExpired) {
            pending.otpWindowStartedAt = now;
            pending.otpSendCount = 0;
            await pending.save();
        }
        await sendPendingRegistrationOtp(pending);
        return res.status(200).json(new ApiResponse(200, {}, "OTP resent successfully"));
    }

    const user = await User.findOne({
        email: normalizedEmail,
        isEmailVerified: false,
    }).select("+emailVerificationOtpHash");
    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, "If a pending registration exists, a code will be sent.")
        );
    }
    if (
        user.emailVerificationOtpSentAt &&
        now.getTime() - user.emailVerificationOtpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
        throw new ApiError(429, "Wait one minute before requesting another verification code");
    }
    const windowExpired =
        !user.emailVerificationOtpSentAt ||
        now.getTime() - user.emailVerificationOtpSentAt.getTime() >= OTP_SEND_WINDOW_MS;
    if (!windowExpired && user.emailVerificationOtpSendCount >= OTP_SEND_LIMIT) {
        throw new ApiError(429, "Too many verification codes requested. Try again later.");
    }

    const legacyOtp = makeOtp();
    user.emailVerificationOtpHash = hashOtp(legacyOtp);
    user.emailVerificationOtpExpiry = new Date(now.getTime() + OTP_LIFETIME_MS);
    user.emailVerificationOtpAttempts = 0;
    user.emailVerificationOtpSentAt = now;
    user.emailVerificationOtpSendCount = windowExpired ? 1 : user.emailVerificationOtpSendCount + 1;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    try {
        await sendVerificationOtpEmail(user.email, legacyOtp);
    } catch (error) {
        await User.updateOne(
            { _id: user._id },
            { $unset: { emailVerificationOtpHash: 1, emailVerificationOtpExpiry: 1 } }
        );
        console.error("Failed to send legacy-account verification OTP email:", error.message);
        throw new ApiError(502, "Failed to send OTP email. Please try again.");
    }

    return res.status(200).json(new ApiResponse(200, {}, "OTP resent successfully"));
});

const updateStudentProfile = asyncHandler(async (req, res) => {
    const { username, college_id, email, password, mobile } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    if (email !== undefined && (
        typeof email !== "string" ||
        email.trim().toLowerCase() !== user.email
    )) {
        throw new ApiError(400, "Email changes require a separate verification process and are not available yet");
    }
    if (username !== undefined) {
        const value = typeof username === "string" ? username.trim().toLowerCase() : "";
        if (value.length < 2 || value.length > 100) throw new ApiError(400, "Enter a valid full name");
        user.username = value;
    }
    if (college_id !== undefined) {
        if (typeof college_id !== "string" || !college_id.trim() || college_id.trim().length > 64) {
            throw new ApiError(400, "Enter a valid college ID");
        }
        user.college_id = college_id.trim();
    }
    if (mobile !== undefined) {
        const value = normalizeIndianMobile(mobile);
        if (!value) throw new ApiError(400, "Enter a valid 10-digit Indian mobile number");
        user.mobile = value;
    }
    if (password !== undefined) {
        if (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
            throw new ApiError(400, "Password must be at least 8 characters and no more than 72 bytes");
        }
        user.password = password;
    }

    try {
        await user.save();
    } catch (error) {
        if (error.code === 11000) throw new ApiError(409, "Profile details are already in use");
        throw error;
    }
    const safeUser = await User.findById(user._id)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -emailVerificationOtpHash -emailVerificationOtpExpiry");
    return res.status(200).json(new ApiResponse(200, safeUser, "User updated successfully"));
});

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    updateStudentProfile as UpdateUserProfile,
    verifyEmail,
    verifyOTP,
    resendOTP,
};