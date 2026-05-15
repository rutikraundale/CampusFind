import { Claim } from "../model/claim.model.js";
import { Item } from "../model/items.model.js";
import { Admin } from "../model/admin.model.js";

export const verifyOtpAndClaim = async (req, res) => {
    try {
        const { claimId, otp_code } = req.body;
        const adminId = req.user._id; 

        if (!claimId || !otp_code) {
            return res.status(400).json({ success: false, message: "Claim ID and OTP are required" });
        }

        const claim = await Claim.findById(claimId).populate("itemId");
        
        if (!claim) {
            return res.status(404).json({ success: false, message: "Claim not found" });
        }

        if (claim.isVerified) {
            return res.status(400).json({ success: false, message: "Item already claimed" });
        }

        if (claim.otp_code !== otp_code) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (new Date() > claim.opt_expiresAt) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        claim.isVerified = true;
        claim.claimedAt = Date.now();
        claim.processByWhichAdmin = adminId;
        await claim.save();

        if (claim.itemId) {
            claim.itemId.status = "claimed";
            claim.itemId.isReturned = true;
            await claim.itemId.save();
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. Item marked as claimed.",
            claim
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// 2. Manage items by category, date, status
export const getManagedItems = async (req, res) => {
    try {
        const { category, status, startDate, endDate } = req.query;
        let query = {};

        if (category) query.category = category;
        if (status) query.status = status;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const items = await Item.find(query)
            .populate("postedBy", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: items.length,
            items
        });

    } catch (error) {
        console.error("Error fetching managed items:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// 3. Manage feedback and complaints (Admin fields)
export const updateAdminFeedbackComplaints = async (req, res) => {
    try {
        const adminId = req.user._id;
        const { feedback, complaint } = req.body; // Individual items to push

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        if (feedback) admin.feedbacks.push(feedback);
        if (complaint) admin.complaints.push(complaint);

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Feedbacks/Complaints updated successfully",
            admin: {
                id: admin._id,
                email: admin.email,
                feedbacks: admin.feedbacks,
                complaints: admin.complaints
            }
        });

    } catch (error) {
        console.error("Error updating admin actions:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getAdminFeedbackComplaints = async (req, res) => {
    try {
        const adminId = req.user._id;
        const admin = await Admin.findById(adminId).select("feedbacks complaints email");
        
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        return res.status(200).json({
            success: true,
            feedbacks: admin.feedbacks,
            complaints: admin.complaints
        });

    } catch (error) {
        console.error("Error fetching admin actions:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
