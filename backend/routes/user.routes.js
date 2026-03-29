import {Router} from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/register").post(registerUser);

//secure routes
router.route("/login").post(verifyJWT,loginUser);
router.route("/logout").post(verifyJWT,logoutUser)
export default router;