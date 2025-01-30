import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { postController } from "../controllers/postController";
import { contentValidator, idValidator, userIdQueryValidator } from "../middlewares/validators";
import { validationResultMiddleware } from "../middlewares/validationResult";

export const postsRouter = Router();

postsRouter.post('/', authMiddleware, contentValidator, validationResultMiddleware, postController.createPost);

postsRouter.get('/', authMiddleware, userIdQueryValidator, validationResultMiddleware, postController.getPosts);

postsRouter.get('/following', authMiddleware, postController.getAllPostsForUser);

postsRouter.get('/:id', authMiddleware, idValidator, validationResultMiddleware, postController.getPostById);

postsRouter.delete('/:id', authMiddleware, idValidator, validationResultMiddleware, postController.deletePostById);

postsRouter.patch('/like/:id', authMiddleware, idValidator, validationResultMiddleware, postController.like);

postsRouter.patch('/unlike/:id', authMiddleware, idValidator, validationResultMiddleware, postController.unlike);