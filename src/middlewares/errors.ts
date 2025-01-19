import { NextFunction, Request, Response } from "express";
import { HTTP_CODES } from "../constants/httpCodes";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({ error: err.message });
};