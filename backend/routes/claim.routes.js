import { Router } from "express";
import {
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
} from "../controllers/claim.controller.js";
import { verifyJWT, checkRole } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();
const adminOnly = [verifyJWT, checkRole("admin")];
const studentLookupLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const otpSendLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const otpVerifyLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const handoverLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.get("/handover/items", ...adminOnly, getHandoverItems);
router.get("/handover/history", ...adminOnly, getHandoverHistory);
router.get("/handover/:handoverId", ...adminOnly, getHandoverSession);
router.delete("/handover/:handoverId", ...adminOnly, cancelHandoverSession);
router.post("/handover/check-student", ...adminOnly, studentLookupLimit, checkHandoverStudent);
router.post("/handover/send-otp", ...adminOnly, otpSendLimit, sendHandoverOtp);
router.post("/handover/verify-otp", ...adminOnly, otpVerifyLimit, verifyHandoverOtp);
router.post("/handover/confirm", ...adminOnly, handoverLimit, confirmHandover);

// ─── Student routes ───────────────────────────────────────────────────────────
// Static routes BEFORE param routes
router.get("/my-claims", verifyJWT, checkRole("Student"), getMyClaims);

router.post("/:itemId", verifyJWT, checkRole("Student"), initiateClaim);

router.delete(
    "/:claimId/cancel",
    verifyJWT,
    checkRole("admin", "Student"),
    cancelClaim
);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get("/", verifyJWT, checkRole("admin"), getAllClaims);      // ?verified=true|false

router.post("/:claimId/verify", verifyJWT, checkRole("admin"), verifyClaim);

export default router;
