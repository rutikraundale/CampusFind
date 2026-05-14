import jwt from "jsonwebtoken";
import { ApiError } from "../utilities/api_error.js";
import { asyncHandler } from "../utilities/async_handler.js";
import { User } from "../model/user.model.js";
import { Admin } from "../model/admin.model.js";



export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized Access");
        }
        const decodeData=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        
        let user;
        if(decodeData?.role === "admin"){
            user = await Admin.findById(decodeData?._id).select("-password -refereshToken");
        } else {
            user = await User.findById(decodeData?._id).select("-password -refereshToken");
        }

        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }
        req.user=user;
        next();
    } catch (error) {
        throw error(error);
    }
})
export const checkRole=(...allowedRoles)=>(asyncHandler(async(req,_,next)=>{
    try {
        if(!allowedRoles.includes(req.user.role)){
            throw new ApiError(403,"Unauthorized Access:Role not allowed");
        }
        next();
    } catch (error) {
        throw error(error);
    }
}))