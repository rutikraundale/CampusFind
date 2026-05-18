import multer from "multer";
import path from "path";
import { ApiError } from "../utilities/api_error.js";

// ─── Disk storage: ./public/temp ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "./public/temp");
    },
    // Unique filename prevents collisions when two users upload same-named file
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// ─── Only allow image MIME types ──────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only JPEG, PNG, and WebP images are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    },
});

export default upload;