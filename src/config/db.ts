import mongoose from "mongoose";
import { env } from "./env";
import { createClient } from "redis";


export async function connectMongoDB() {
    const dbConnection = mongoose.connection;

    dbConnection.once("open", (_) => {
        console.log(`Mongo database connected: ${env.MONGO_URI}`);
    });

    dbConnection.on("error", (err) => {
        throw err;
    })

    await mongoose.connect(env.MONGO_URI);
}

export const client = createClient({
    url: env.REDIS_URI,
})

export async function connectRedis() {
    
    client.on("error", (err) => {
        throw err;
    });

    await client.connect();
}