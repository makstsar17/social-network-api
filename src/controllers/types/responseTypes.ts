import { Response } from "express";

export type ResponseWithError<T> = Response<T | { error: string }>;