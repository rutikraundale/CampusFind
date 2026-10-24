import { Router } from "express";
import { verifyJWT, checkRole } from "../middleware/auth.middleware.js";
import {
    createStudentIssue,
    getMyStudentIssues,
    getAllStudentIssues,
    updateStudentIssueStatus,
} from "../controllers/student-issue.controller.js";

const router = Router();

router.use(verifyJWT);
router.post("/", checkRole("Student"), createStudentIssue);
router.get("/mine", checkRole("Student"), getMyStudentIssues);
router.get("/admin", checkRole("admin"), getAllStudentIssues);
router.patch("/:id/status", checkRole("admin"), updateStudentIssueStatus);

export default router;
