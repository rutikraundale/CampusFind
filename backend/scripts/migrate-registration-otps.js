import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { User } from "../model/user.model.js";

await connectDB();

try {
    const result = await User.updateMany(
        {
            isEmailVerified: false,
            emailVerificationToken: /^\d{6}$/,
        },
        {
            $unset: {
                emailVerificationToken: 1,
                emailVerificationExpiry: 1,
            },
        }
    );
    console.log(`Cleared ${result.modifiedCount} legacy plaintext registration OTP(s).`);
} finally {
    await mongoose.disconnect();
}
