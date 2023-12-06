import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import errorMiddleware from "./middleware/error.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/v1",productRouter);
app.use("/api/v1",userRouter);
app.use("/api/v1",orderRouter);

//Error middleware
app.use(errorMiddleware);

export default app;