import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { userController } from "../controllers/userController";

const usersRouter = Router();

usersRouter.get('/:id', authMiddleware, userController.getUserById);

export default usersRouter;