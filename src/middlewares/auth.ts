import { NextFunction, Request, Response } from "express";
import { HTTP_CODES } from "../constants/httpCodes";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    jwt.verify(token, env.JWT_ACCESS_SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(HTTP_CODES.UNAUTHORIZED).send({ error: "Invalid token" });
            return;
        }
        req.user = decoded;
        next();
    })
}