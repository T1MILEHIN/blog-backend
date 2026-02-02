import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


export const connectDB = async()=> {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.log(error, "Error connecting to DB");
    }
}