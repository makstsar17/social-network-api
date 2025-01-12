import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"
import { HTTP_CODES } from "../constants/httpCodes";

export const validationResultMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        next();
    } else {
        res.status(HTTP_CODES.BAD_REQUEST).json({ errors: errors.array() });
    }
}