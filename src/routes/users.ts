import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { userController } from "../controllers/userController";
import upload from "../config/multer";
import { bioValidator, dateOfBirthValidator, idValidator, locationValidator, optionalEmailValidator, optionalNameValidator } from "../middlewares/validators";
import { validationResultMiddleware } from "../middlewares/validationResult";
import { postController } from "../controllers/postController";

const usersRouter = Router();

usersRouter.get('/:id', authMiddleware, idValidator, validationResultMiddleware, userController.getUserById);


usersRouter.patch('/:id',
    authMiddleware,
    [idValidator, optionalEmailValidator, optionalNameValidator, dateOfBirthValidator, bioValidator, locationValidator],
    validationResultMiddleware,
    upload.single('avatar'),
    userController.updateUser);

usersRouter.get('/:id/posts', authMiddleware, idValidator, validationResultMiddleware, postController.getAllPostsByUserId);

export default usersRouter;