// require('dotenv').config()
import dotenv from "dotenv";

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
    path:"./.env"
})

import express from "express";
//  app = express();

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log( `server is running on port ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log( "mongo db connection failed !!!",err);
    
})


// (async ()=>{
//     try {
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//       app.on("error",()=>{
//         console.log( "not ",error);
//         throw error;
        
//       })
//       app.listen(process.env.PORT,()=>{
//         console.log(`Server is running on port ${process.env.PORT}`);
//       })
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     }
// })()