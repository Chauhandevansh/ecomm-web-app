import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
import jwt from "jsonwebtoken"
import User from "../models/userModel.js";

export const isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies; //to get hold of the token
    
    if(!token) {
        return next(new ErrorHandler("Please login to access this resource",401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
});

//Check whether the user is admin
export const authorizeRoles = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)) {
            return next(new ErrorHandler("Role: "+req.user.role+" is not allowed t8o access this reource",403));
        }
        next();
    };
}