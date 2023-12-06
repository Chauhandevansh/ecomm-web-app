import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middleware/catchAsyncError.js";

//Create new order
export const newOrder = catchAsyncError(async(req,res,next)=>{
    const {shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body;

    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        paymentInfo, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    });

    res.status(201).json({
        success: true,
        order
    });
});


//Get Single order
export const getSingleOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHandler("Order not found with this Id",404));
    }

    res.status(201).json({
        success: true,
        order
    });
});

//Get logged in user orders
export const myOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find({user: req.user._id});

    res.status(201).json({
        success: true,
        orders
    });
});

//Get all orders -- admin
export const getAllOrders = catchAsyncError(async(req,res,next)=>{
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order)=>{
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    });
});

//Update order status -- admin
export const updateOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Order is already delivered",400));
    }

    order.orderItems.forEach(async(o)=>{
        await updateStock(o.product, o.quantity);
    });

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order. save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    });
});

async function updateStock(id, quantity){
    const product = await Product.findById(id);

    product.stock -= quantity;

    await product.save({validateBeforeSave: false});
}

//Delete order -- Admin
export const deleteOrder = catchAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this Id",404));
    }

    await order.deleteOne();

    res.status(201).json({
        success: true,
    });
});