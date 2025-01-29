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
export type RequestWithBodyAndParams<T1, T2> = Request<T1, {}, T2>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>