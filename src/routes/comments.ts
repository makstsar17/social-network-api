import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { contentValidator, idValidator, postIdValidator } from "../middlewares/validators";
import { validationResultMiddleware } from "../middlewares/validationResult";
import { commentController } from "../controllers/commentController";

export const commentsRouter = Router();

commentsRouter.post("/", authMiddleware, [contentValidator, postIdValidator], validationResultMiddleware, commentController.createComment);

commentsRouter.delete("/:id", authMiddleware, idValidator, validationResultMiddleware, commentController.deleteComment);