import app from "./app";
import { connectMongoDB, connectRedis } from "./config/db";
import { env } from "./config/env";
import fs from "fs";
import path from "path";

const port = env.PORT;

async function main() {
    try {
        const avatarsPath = path.join(__dirname, "../uploads");
        fs.access(avatarsPath, (err) => {
            if (err) {
                fs.mkdir(avatarsPath, (err) => {
                    if (err) throw err;
                })
            }
        })

        await connectMongoDB();
        await connectRedis();

        app.listen(port, () => {
            console.log(`server listening on ${port}`)
        })
    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
}

main();