import { Item } from "../model/items.model.js";
import { asyncHandler } from "../utilities/async_handler.js";
import { ApiError } from "../utilities/api_error.js";
import { ApiResponse } from "../utilities/api_response.js";

//search and filter items
const searchItems=()=>(asyncHandler(async(req,res)=>{
    const {category, location, status, keyword}=req.query;
    
    let filter={};
    if(category){
        filter.category=category;
    }
    if(location){
        filter.foundAt={$regex:location,$options:"i"};
    }
    if(status){
        filter.status=status;
    }
    
    let searchPattern="";
    if(keyword){
        searchPattern=keyword;
    }

    const page=parseInt(req.query.page)||1;
    const limit=parseInt(req.query.limit)||10;
    const skip=(page-1)*limit;

    const items=await Item.find({
        ...filter,
        $or:[
            {title:{$regex:searchPattern,$options:"i"}},
            {description:{$regex:searchPattern,$options:"i"}},
            {foundAt:{$regex:searchPattern,$options:"i"}}
        ]
    }).skip(skip).limit(limit).populate("postedBy","name email");
    
    return res.status(200).json(new ApiResponse(200,"Items fetched successfully",items))


}))

export {searchItems}