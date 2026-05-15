import { Router } from "express";
import { verifyJWT, checkRole } from "../middleware/auth.middleware.js";
import {
    verifyOtpAndClaim,
    getManagedItems,
    updateAdminFeedbackComplaints,
    getAdminFeedbackComplaints
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT, checkRole("admin"));

router.post("/verify-claim", verifyOtpAndClaim);

router.get("/items", getManagedItems);

router.route("/actions")
    .get(getAdminFeedbackComplaints)
    .put(updateAdminFeedbackComplaints);

export default router;
