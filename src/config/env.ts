import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || "",
    JWT_ACCESS_SECRET_KEY: process.env.JWT_ACCESS_SECRET_KEY || "12345678",
    JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY || "12345678",
    REDIS_URI: process.env.REDIS_URI || "",
    AVATAR_PATH: path.join(__dirname, "../../uploads"),
};