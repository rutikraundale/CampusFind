import { Router } from "express";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,   
    UpdateUserProfile,
    verifyEmail,
    verifyOTP,
    resendOTP
} from "../controllers/auth.controller.js";
import { verifyJWT, checkRole } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();
const registrationRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many registration requests. Try again later.", errors: [] },
});
const verificationRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many verification attempts. Try again later.", errors: [] },
});

// ─── Public routes ────────────────────────────────────────────────────────────
router.post("/register", registrationRateLimit, registerUser); // Student registration
router.post("/verify-otp", verificationRateLimit, verifyOTP); // Verify email OTP
router.post("/resend-otp", registrationRateLimit, resendOTP); // Resend email OTP
router.post("/login", loginUser);                 // Student + Admin login (role in body)
router.post("/refresh", refreshAccessToken);      // Rotate refresh token
router.get("/verify-email/:token", verifyEmail);  // Email verification (fallback URL link)

// ─── Authenticated routes ─────────────────────────────────────────────────────
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.post("/update-profile", verifyJWT, UpdateUserProfile);
// ─── Student-only routes ──────────────────────────────────────────────────────
router.get(
    "/student/dashboard",
    verifyJWT,
    checkRole("Student"),
    (req, res) => {
        res.json({ message: `Welcome, ${req.user.username}!`, role: req.user.role });
    }
);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.get(
    "/admin/dashboard",
    verifyJWT,
    checkRole("admin"),
    (req, res) => {
        res.json({ message: `Welcome Admin ${req.user.email}`, role: req.user.role });
    }
);

// Admin: list all students
router.get(
    "/admin/users",
    verifyJWT,
    checkRole("admin"),
    (req, res) => {
        // Placeholder — wire to a real controller when ready
        res.json({ message: "Admin: list of all students" });
    }
);

export default router;