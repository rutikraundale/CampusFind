import { Router } from "express";
import {
    initiateClaim,
    verifyClaim,
    getAllClaims,
    getMyClaims,
    cancelClaim,
} from "../controllers/claim.controller.js";
import { verifyJWT, checkRole } from "../middleware/auth.middleware.js";

const router = Router();

// ─── Student routes ───────────────────────────────────────────────────────────
// Static routes BEFORE param routes
router.get("/my-claims", verifyJWT, checkRole("Student"), getMyClaims);

router.post(
    "/:itemId",
    verifyJWT,
    checkRole("Student"),
    initiateClaim
);

router.delete(
    "/:claimId/cancel",
    verifyJWT,
    checkRole("admin", "Student"),
    cancelClaim
);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get("/", verifyJWT, checkRole("admin"), getAllClaims);      // ?verified=true|false

router.post(
    "/:claimId/verify",
    verifyJWT,
    checkRole("admin"),
    verifyClaim
);

export default router;
