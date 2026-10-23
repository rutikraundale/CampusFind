import { Router } from "express";
import {
    postItem,
    getAllItems,
    getAdminItems,
    getItemById,
    getMyPostedItems,
    deleteItem,
} from "../controllers/item.controller.js";
import { verifyJWT, checkRole, requireVerifiedCollegeStudent } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/", getAllItems);                       // GET  /api/v1/items
router.get("/admin/records", verifyJWT, checkRole("admin"), getAdminItems);

// ─── Protected static routes (must be declared BEFORE /:id) ──────────────────
// If /my-posts were placed after /:id, Express would treat "my-posts" as an id value
router.get("/my-posts", verifyJWT, checkRole("Student"), getMyPostedItems);

// POST a new missing item (Student only, single image upload)
router.post(
    "/",
    verifyJWT,
    checkRole("Student"),
    requireVerifiedCollegeStudent,
    upload.single("image"),
    postItem
);

// ─── Param routes (always last) ───────────────────────────────────────────────
router.get("/:id", getItemById);                   // GET  /api/v1/items/:id  (public)

router.delete(
    "/:id",
    verifyJWT,
    checkRole("Student", "admin"),                 // owner-Student or admin
    deleteItem
);

export default router;
