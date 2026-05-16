import express from "express";
import { searchItems } from "../controllers/search.controller.js";
const router=express.Router();

router.get("/search",searchItems);

export default router;