import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { userController } from "../controllers/userController";
import upload from "../config/multer";
import { bioValidator, bodyIdValidator, dateOfBirthValidator, idValidator, locationValidator, optionalEmailValidator, optionalNameValidator } from "../middlewares/validators";
import { validationResultMiddleware } from "../middlewares/validationResult";

const usersRouter = Router();

usersRouter.patch('/follow/:id', authMiddleware, idValidator, validationResultMiddleware, userController.follow);

usersRouter.patch('/unfollow/:id', authMiddleware, idValidator, validationResultMiddleware, userController.unfollow);

usersRouter.get('/:id', authMiddleware, idValidator, validationResultMiddleware, userController.getUserById);

usersRouter.patch('/:id',
    authMiddleware,
    [idValidator, optionalEmailValidator, optionalNameValidator, dateOfBirthValidator, bioValidator, locationValidator],
    validationResultMiddleware,
    upload.single('avatar'),
    userController.updateUser);

export default usersRouter;