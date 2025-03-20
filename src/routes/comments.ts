import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { bodyIdValidator, contentValidator, idValidator, postIdQueryValidator } from "../middlewares/validators";
import { validationResultMiddleware } from "../middlewares/validationResult";
import { commentController } from "../controllers/commentController";

export const commentsRouter = Router();

commentsRouter.post("/", authMiddleware, [contentValidator, bodyIdValidator("postId")], validationResultMiddleware, commentController.createComment);

commentsRouter.delete("/:id", authMiddleware, idValidator, validationResultMiddleware, commentController.deleteComment);

commentsRouter.get("/", authMiddleware, postIdQueryValidator, validationResultMiddleware, commentController.getComments);