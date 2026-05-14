import jwt from "jsonwebtoken";
import { ApiError } from "../utilities/api_error.js";
import { asyncHandler } from "../utilities/async_handler.js";
import { User } from "../model/user.model.js";


export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized Access");
        }
        const decodeData=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodeData?._id);
        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }
        req.user=user;
        next();
    } catch (error) {
        throw error(error);
    }
})