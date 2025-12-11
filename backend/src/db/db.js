import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
      const connectionIntance=  await mongoose.connect(`${process.env.MONGODB_URI}`);
      console.log( `\n mongodb connected : host name : ${connectionIntance.connection.host}`);
      
    } catch (error) {
        console.log( "mongodb connection error:",error);
        process.exit(1);
        
    }
}

export default connectDB;