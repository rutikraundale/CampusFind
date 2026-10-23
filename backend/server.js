import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { corsMiddleware } from "./middleware/cors.middleware.js";

connectDB();

const app = express();

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
import userRouter from "./routes/user.routes.js";
import itemRouter from "./routes/item.routes.js";
import claimRouter from "./routes/claim.routes.js";
import adminRouter from "./routes/admin.routes.js";
import foundItemUploadRouter from "./routes/found-item-upload.routes.js";
import searchRouter from "./routes/search.route.js";
import { cleanupExpiredUploadSessions } from "./controllers/found-item-upload.controller.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/claims", claimRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/search",searchRouter);
app.use("/api/v1/found-item-uploads", foundItemUploadRouter);

const uploadSessionCleanup = setInterval(() => {
    cleanupExpiredUploadSessions().catch((error) => {
        console.error("Failed to clean expired found-item upload sessions:", error);
    });
}, 5 * 60 * 1000);
uploadSessionCleanup.unref();
cleanupExpiredUploadSessions().catch((error) => {
    console.error("Failed to run initial found-item upload cleanup:", error);
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
