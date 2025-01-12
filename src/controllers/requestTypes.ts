import { Request } from "express";

export type RequestWithBody<T> = Request<{}, {}, T>;