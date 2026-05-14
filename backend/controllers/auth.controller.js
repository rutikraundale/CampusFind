import {asyncHandler} from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import {User} from "../model/user.model.js"
import { Admin } from "../model/admin.model.js";
import {ApiResponse} from "../utilities/api_response.js"

const generateAccessAndRefereshToken=async(userid, role)=>{
    try {
        const model = role === "admin" ? Admin : User;
        const user=await model.findById(userid);
        if(!user){
            throw new ApiError(500,"Something went wrong!");
        }
        const AccessToken=user.generateAccessToken()
        const RefereshToken=user.generateRefreshToken()
        user.refereshToken=RefereshToken
        await user.save({validateBeforeSave:false});
        return {AccessToken,RefereshToken};
    } catch (error) {
        throw new ApiError(500,"Something Went Wrong!");
    }

}

const registerUser = asyncHandler(async (req, res) => {
    const {username,college_id,email,password,role}=req.body;
    if([username,college_id,email,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"Fields are missing")
    }
    const existedUser=await User.findOne({
        $or:[{college_id},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User Already Exists!");
    }
    const user=await User.create({
        username:username.toLowerCase(),
        college_id,
        email,
        password,
        role
    })
    const usercheck=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!usercheck){
        throw new ApiError(500,"Something went wrong");
    }
    return res.status(201).json(
        new ApiResponse(
            200,
            usercheck,
            "User created successfully!"
        )
    )
})
const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password,role}=req.body;

    if(!role){
        throw new ApiError(400,"Role is missing!");
    }

    if((role === "Student" && !username && !email) || (role === "admin" && !email)){
        throw new ApiError(400,"Credentials are missing!");
    }

    let user;
    if(role === "admin"){
        user = await Admin.findOne({email});
    } else {
        user= await User.findOne({
            $or:[{username},{email}]
        })
    }

    if(!user){
        throw new ApiError(404,"User not found!");
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Incorrect Password!");
    }
    const {AccessToken,RefereshToken}=await generateAccessAndRefereshToken(user._id, role);

    const model = role === "admin" ? Admin : User;
    const loggedInUser=await model.findById(user._id).select("-password -refereshToken");
    
    const options={
        httpOnly:true,
        secure:true
    }
    res.status(200).cookie("AccessToken",AccessToken,options).cookie("RefereshToken",RefereshToken).json(
        new ApiResponse(200,{
            user:loggedInUser
        },"User logged in successfully")
    )
})
const logoutUser=asyncHandler(async(req,res)=>{
    const model = req.user.role === "admin" ? Admin : User;
    await model.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                refereshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    res.status(200).clearCookie("AccessToken",options).clearCookie("RefereshToken",options).json(
        new ApiResponse(
            200,
            "User logout!"
        )
    )
})
export {registerUser,loginUser,logoutUser};