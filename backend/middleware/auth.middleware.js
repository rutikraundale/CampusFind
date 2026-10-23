import jwt from "jsonwebtoken";
import { ApiError } from "../utilities/api_error.js";
import { asyncHandler } from "../utilities/async_handler.js";
import { User } from "../model/user.model.js";
import { Admin } from "../model/admin.model.js";
import { normalizeStudentEmail } from "../utilities/student-registration.js";

// ─── Helper ───────────────────────────────────────────────────────────────────
const getModel = (role) => (role === "admin" ? Admin : User);

// ─── Verify Access Token ──────────────────────────────────────────────────────
// Reads token from cookie or Authorization header (Bearer <token>)
export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized — no token provided");

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError(401, "Access token expired");
        }
        throw new ApiError(401, "Invalid access token");
    }

    const model = getModel(decoded?.role);
    const user = await model
        .findById(decoded._id)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -emailVerificationOtpHash -emailVerificationOtpExpiry");

    if (!user) throw new ApiError(401, "User not found — token invalid");

    req.user = user;
    next();
});

// ─── Role-Based Access Control ────────────────────────────────────────────────
// Usage: checkRole("admin")  /  checkRole("Student")  /  checkRole("admin","Student")
export const checkRole = (...allowedRoles) =>
    asyncHandler(async (req, _, next) => {
        if (!req.user) throw new ApiError(401, "Not authenticated");

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied — required role: ${allowedRoles.join(" or ")}`
            );
        }
        next();
    });

export const requireVerifiedCollegeStudent = asyncHandler(async (req, _, next) => {
    if (!req.user || req.user.role !== "Student") {
        throw new ApiError(403, "Only student accounts may post items");
    }
    if (!normalizeStudentEmail(req.user.email)) {
        throw new ApiError(403, "A verified @kbtcoe.org student email is required to post");
    }
    if (!req.user.isEmailVerified) {
        throw new ApiError(403, "Verify your campus email before posting an item");
    }

    next();
});