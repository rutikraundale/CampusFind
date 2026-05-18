import { Router } from "express";
import { verifyJWT, checkRole } from "../middleware/auth.middleware.js";
import {
    verifyOtpAndClaim,
    getManagedItems,
    updateAdminFeedbackComplaints,
    getAdminFeedbackComplaints
} from "../controllers/admin.controller.js";
import registerAdmin from "../controllers/admin.js";

const router = Router();

// 🔥 No Auth Middleware Needed for the Super Admin Registration
router.post('/register-admin', registerAdmin);

router.use(verifyJWT, checkRole("admin"));

router.post("/verify-claim", verifyOtpAndClaim);

router.get("/items", getManagedItems);

router.route("/actions")
    .get(getAdminFeedbackComplaints)
    .put(updateAdminFeedbackComplaints);

export default router;
