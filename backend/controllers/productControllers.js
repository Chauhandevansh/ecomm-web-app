import Product from "../models/productModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "../middleware/catchAsyncError.js";
import ApiFeatures from "../utils/apiFeatures.js";

//Create product
export const createProduct = catchAsyncError(async(req,res,next)=>{
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    });
});

//Get all products
export const getAllProducts = catchAsyncError(async (req,res)=>{
    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeatures = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
    const products = await apiFeatures.query;
    res.status(201).json({
        success: true,
        products
    });
});

//Get single product
export const getProductDetails = catchAsyncError(async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new ErrorHandler('Product not found!', 404);
        }

        res.status(200).json({
            success: true,
            product,
            //productCount
        });
});

//Update product
export const updateProduct = catchAsyncError(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);
        if(!product){
            throw new ErrorHandler('Product not found!', 404);
        }
    
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true,
            useFindAndModify: false
        });
    
        res.status(200).json({
            success: true,
            product
        });
});

//Delete Product
export const deleteProduct = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
        if(!product){
            throw new ErrorHandler('Product not found!', 404);
        }
        await product.deleteOne();
        res.status(200).json({
            success: true,
            message: "Product deleted successfully!"
        });
});

//Create new review or update review
export const createProductReview = catchAsyncError(async(req,res,next)=>{
    const{rating, comment, productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(rev=> rev.user.toString()===req.user._id.toString());
    if(isReviewed) {
        product.reviews.forEach((rev)=> {
            if(rev.user.toString()===req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    }
    else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.ratings = product.reviews.forEach((rev)=>{
        avg+= rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
    });
});

//Get all reviews of a product
export const getProductReviews = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);

        if (!product) {
            throw new ErrorHandler('Product not found!', 404);
        }

        res.status(200).json({
            success: true,
            reviews: product.reviews
        });
});

//Delete review
export const deleteReview = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);

        if (!product) {
            throw new ErrorHandler('Product not found!', 404);
        }

        const reviews = product.reviews.filter((rev)=>rev._id.toString()!== req.query.id.toString()); //we will filter out only those reviews whose ids doesn't match with the id of the review to be deleted
        
        let avg = 0;
        reviews.forEach((rev)=>{
            avg+= rev.rating;
        });
    
        const ratings = avg/reviews.length;
        const numOfReviews = reviews.length;

        await Product.findByIdAndUpdate(
            req.query.productId,
            {
                reviews,
                ratings,
                numOfReviews
            },
            {
                new: true,
                runValidators: true,
                useFindAndModify: false
            }
        );

        res.status(200).json({
            success: true
        });
});