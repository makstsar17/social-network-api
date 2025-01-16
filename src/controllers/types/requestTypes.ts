import "express";
import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithParams<T> = Request<T>;