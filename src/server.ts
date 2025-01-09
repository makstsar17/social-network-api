import app from "./app";
import { env } from "./config/env";

const port = env.PORT;

async function main() {
    try {
        app.listen(port, () => {
            console.log(`server listening on ${port}`)
        })
    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1); 
    }
}

main();