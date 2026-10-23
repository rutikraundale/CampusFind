import { Router } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import upload from "../middleware/multer.middleware.js";
import { verifyJWT, checkRole } from "../middleware/auth.middleware.js";
import { ApiError } from "../utilities/api_error.js";
import {
    createUploadSession,
    getUploadSessionStatus,
    uploadImageFromAdmin,
    validateMobileUpload,
    uploadImageFromMobile,
    cancelUploadSession,
    publishFoundItem,
    requireMobileUploadSession,
} from "../controllers/found-item-upload.controller.js";

const router = Router();
router.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
});
const adminAuth = [verifyJWT, checkRole("admin")];

const sessionCreationLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 12,
    standardHeaders: true,
    legacyHeaders: false,
});
const mobileValidationLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
});
const mobileUploadLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
});
const adminStatusLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 240,
    standardHeaders: true,
    legacyHeaders: false,
});
const adminUploadLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 12,
    standardHeaders: true,
    legacyHeaders: false,
});

const parseImageUpload = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (!error) return next();
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return next(new ApiError(413, "Image must be 5 MB or smaller"));
        }
        return next(error);
    });
};

router.post("/sessions", ...adminAuth, sessionCreationLimit, createUploadSession);
router.get("/sessions/:id", ...adminAuth, adminStatusLimit, getUploadSessionStatus);
router.delete("/sessions/:id", ...adminAuth, cancelUploadSession);
router.post("/sessions/:id/image", ...adminAuth, adminUploadLimit, parseImageUpload, uploadImageFromAdmin);
router.post("/sessions/:id/publish", ...adminAuth, publishFoundItem);

router.get("/:token", mobileValidationLimit, validateMobileUpload);
router.post("/:token/image", mobileUploadLimit, requireMobileUploadSession, parseImageUpload, uploadImageFromMobile);

export default router;
