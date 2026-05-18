import express from 'express';
import { Admin } from '../model/admin.model.js';

const router = express.Router();

router.post('/register-admin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 🔒 SAFETY GUARD: Check if an admin already exists
        const adminExists = await Admin.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(403).json({ message: "Admin account already exists. Registration locked!" });
        }

        // Create the admin (this triggers your pre("save") hook to hash the password!)
        const newAdmin = await Admin.create({
            email,
            password,
            role: 'admin' // Hardcoded role to ensure they are an admin
        });

        return res.status(201).json({
            message: "🚀 Admin registered successfully via Postman!",
            admin: {
                id: newAdmin._id,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});

export default router;