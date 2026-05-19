import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { User } from "../model/user.model.js";
import { Admin } from "../model/admin.model.js";
import { ApiResponse } from "../utilities/api_response.js";
import { sendVerificationEmail, sendVerificationOtpEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

// ─── Register (Student only) ──────────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
    const { username, college_id, email, password, mobile } = req.body;

    if ([username, college_id, email, password, mobile].some((f) => !f || f.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ college_id }, { email }, { mobile }, { username }] });
    if (existingUser) throw new ApiError(409, "User already exists");

    const user = await User.create({
        username: username.toLowerCase(),
        college_id,
        email: email.toLowerCase(),
        password,
        mobile,
        isEmailVerified: false,
    });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.emailVerificationToken = otp;
    user.emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationOtpEmail(user.email, otp);
    } catch (error) {
        console.error("Failed to send verification OTP email:", error);
    }

    const created = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
    if (!created) throw new ApiError(500, "Something went wrong during registration");

    return res
        .status(201)
        .json(new ApiResponse(201, created, "User registered successfully. Please verify your email with the OTP sent."));
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
    const loggedInUser = await model.findById(user._id).select("-password -refreshToken");

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
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP code are required");
    }

    const user = await User.findOne({
        email: email.toLowerCase(),
        emailVerificationToken: otp.trim(),
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await generateAndSaveTokens(user._id, "Student");
    const verifiedUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: verifiedUser, accessToken }, "Email verified successfully"));
});

const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new ApiError(404, "User not found");

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.emailVerificationToken = otp;
    user.emailVerificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    try {
        await sendVerificationOtpEmail(user.email, otp);
    } catch (error) {
        console.error("Failed to send verification OTP email during resend:", error);
        throw new ApiError(500, "Failed to send OTP email. Please try again.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "OTP resent successfully"));
});

const UpdateUserProfile=asyncHandler(async(req,res)=>{
    const {username,college_id,email,password,mobile}=req.body;
    const user=await User.findById(req.user._id);
    if(!user) throw new ApiError(404,"User not found");
    if(username) user.username=username;
    if(college_id) user.college_id=college_id;
    if(email) user.email=email;
    if(password) user.password=password;
    if(mobile) user.mobile=mobile;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200,user,"User updated successfully"));
})
export { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser, UpdateUserProfile, verifyEmail, verifyOTP, resendOTP };