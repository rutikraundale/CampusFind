import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refereshToken:{
        type:String,
        default:null
    },
    role: {
        type: String,
        enum: ["admin"],
        default: "admin"
    }
}, { timestamps: true })

export const Admin = mongoose.model("Admin", adminSchema);