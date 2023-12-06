import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";

// const port = 3000;

//Handling Uncaught Exceptions
process.on("uncaughtException",(err)=>{
    console.log("Error: "+err.message);
    console.log("Shutting down the server due to Uncaught Exception");
    server.close(()=>{
        process.exit(1);
    });
})

const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri)
.then(()=>console.log("Database connection successful!"))
.catch((err)=>console.log(err));

const server = app.listen(process.env.PORT,()=>{
    console.log("Server is running on port: "+process.env.PORT);
});

//Unhandled Promise Rejection Error Handling
process.on("unhandledRejection",(err)=>{
    console.log("Error: "+err.message);
    console.log("Shutting down the server due to Unhandled Promise Rejection");

    server.close(()=>{
        process.exit(1);
    });
});
