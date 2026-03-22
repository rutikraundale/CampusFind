import {asyncHandler} from "../utilities/async-handler.js";

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({msg:"User Register"});
})

export {registerUser}