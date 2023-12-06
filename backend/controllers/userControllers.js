import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

//Register User
export const registerUser = catchAsyncError(async(req,res,next)=>{
    const {name, email, password, role }= req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "This is a sample id",
            url: "profilePicUrl"
        },
        role
    });

    sendToken(user,201,res);
});

//Login user
export const loginUser = catchAsyncError(async(req,res,next)=>{
    const {email, password} = req.body;

    //checking if user has given password and email both
    if(!email || !password) {
        return await User.findOne({email}).select("+password");
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invald email or password",401));
    }

    const isPasswordMatched  = await user.comparePassword(password);
    if(!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password",401));
    }

    sendToken(user,200,res);
});

//Logout user
export const logoutUser = catchAsyncError(async(req,res,next)=> {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logged Out"
    });
});

//Forgot Password
export const forgotPassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    //Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/${resetToken}` //works same as this: `http://localhost/api/v1/password/${resetToken}`
    const message = `Your password reset token is: \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

    try{
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message
        });
    } catch(error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset Password
export const resetPassword = catchAsyncError(async(req,res,next)=>{
    //creating token hash
    const resetPassordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPassordToken,
        resetPasswordExpire: {$gt: Date.now()},
    });

    if(!user) {
        return next(new ErrorHandler("Reset password token is invalid or has expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Entered password doesn't match with confirm password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

//Get User Details
export const getUserDetails = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});

//Update User password
export const updatePassword = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched  = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Entered password doesn't match with confirm password",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

//Update user profile
export const updateProfile = catchAsyncError(async(req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };

    //We will add cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
    });
});

//Get all users(admin)
export const getAllUsers = catchAsyncError(async(req,res,next)=>{
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
});

//Get single user(admin)
export const getSingleUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exit with Id: ${req.params.id}`,404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

//Update user role(admin)
export const updateUserRole = catchAsyncError(async(req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
    });
});

//Delete User(admin)
export const deleteUser = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    //We will remove cloudinary later

    if(!user) {
        return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`,400));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});