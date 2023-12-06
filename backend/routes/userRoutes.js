import express from "express";
import { deleteUser, forgotPassword, getAllUsers, getSingleUser, getUserDetails, loginUser, logoutUser, registerUser, resetPassword, updatePassword, updateProfile, updateUserRole } from "../controllers/userControllers.js";
import { isAuthenticatedUser, authorizeRoles} from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register",registerUser);

userRouter.post("/login",loginUser);

userRouter.get("/logout",logoutUser);

userRouter.post("/password/forgot",forgotPassword);

userRouter.put("/password/reset/:token",resetPassword);

userRouter.get("/me",isAuthenticatedUser,getUserDetails);

userRouter.put("/password/update",isAuthenticatedUser,updatePassword);

userRouter.put("/me/update",isAuthenticatedUser,updateProfile);

userRouter.get("/admin/users",isAuthenticatedUser,authorizeRoles("admin"),getAllUsers);

userRouter.get("/admin/users/:id",isAuthenticatedUser,authorizeRoles("admin"),getSingleUser);
userRouter.put("/admin/users/:id",isAuthenticatedUser,authorizeRoles("admin"),updateUserRole);
userRouter.delete("/admin/users/:id",isAuthenticatedUser,authorizeRoles("admin"),deleteUser);


export default userRouter;
