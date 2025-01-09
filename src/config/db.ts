import mongoose from "mongoose";
import { env } from "./env";

const uri = env.MONGO_URI

export default async function connectDB() {
    const dbConnection = mongoose.connection;
    
    dbConnection.once("open", (_) => {
        console.log(`Database connected: ${uri}`);
    });

    dbConnection.on("error", (err) => {
        console.error(`Database connection error: ${err}`);
    })

    
    await mongoose.connect(uri);
}