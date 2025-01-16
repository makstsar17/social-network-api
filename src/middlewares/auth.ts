import { NextFunction, Request, Response } from "express";
import { HTTP_CODES } from "../constants/httpCodes";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { TokenService } from "../services/TokenService";


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(HTTP_CODES.UNAUTHORIZED).send({ error: "Invalid authorization header" });
        return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(HTTP_CODES.UNAUTHORIZED).send({ error: "Authorization token not found" });
        return;
    }

    if (await TokenService.isTokenBlacklisted(token)) {
        res.status(HTTP_CODES.FORBIDDEN).send({
            error: "Invalid token"
        })
        return;
    }

    jwt.verify(token, env.JWT_ACCESS_SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(HTTP_CODES.UNAUTHORIZED).send({ error: "Invalid token" });
            return;
        }
        req.user = decoded as { id: string };
        next();
    })
}