import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import { deleteOrder, getAllOrders, getSingleOrder, myOrders, newOrder, updateOrder } from "../controllers/orderControllers.js";

const orderRouter = express.Router();

orderRouter.post("/order/new",isAuthenticatedUser,newOrder);

orderRouter.get("/order/:id",isAuthenticatedUser, getSingleOrder);

orderRouter.get("/orders/me",isAuthenticatedUser, myOrders);

orderRouter.get("/admin/orders",isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

orderRouter.put("/admin/order/:id",isAuthenticatedUser, authorizeRoles("admin"), updateOrder);

orderRouter.delete("/admin/order/:id",isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

export default orderRouter;
