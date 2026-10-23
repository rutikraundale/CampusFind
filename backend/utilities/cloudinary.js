import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// ─── Cloudinary Configuration ────────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary.
 * Removes the local temporary file after upload (success or fail).
 *
 * @param {string} localFilePath - Path to the local file to upload
 * @param {object} [options] - Additional Cloudinary upload options
 * @returns {Promise<object|null>} Cloudinary upload response or null on error
 */
const uploadOnCloudinary = async (localFilePath, options = {}) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            ...options,
        });

        // Ensure secure_url is accessible via url as well
        if (response && response.secure_url) {
            response.url = response.secure_url;
        }

        // Clean up temporary local file after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (error) {
        // Clean up temporary local file if upload failed
        if (fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (unlinkError) {
                console.error("Error deleting local file after upload failure:", unlinkError);
            }
        }
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

/**
 * Deletes a file from Cloudinary by its public ID.
 *
 * @param {string} publicId - The Cloudinary public ID of the resource
 * @param {string} [resourceType="image"] - The type of resource ('image', 'raw', 'video')
 * @returns {Promise<object|null>} Cloudinary destroy response or null on error
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        return response;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return null;
    }
};

/**
 * Extracts the public ID from a Cloudinary URL.
 *
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {string|null} Cloudinary public ID or null if unparseable
 */
const extractPublicId = (imageUrl) => {
    if (!imageUrl) return null;
    try {
        const parts = imageUrl.split("/");
        const filename = parts.pop();
        const publicId = filename.split(".")[0];
        return publicId;
    } catch {
        return null;
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary,
    extractPublicId,
    cloudinary,
};
