import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { userController } from "../controllers/userController";
import upload from "../config/multer";
import { bioValidator, dateOfBirthValidator, locationValidator, optionalEmailValidator, optionalNameValidator } from "../middlewares/validators";
import { validationResultMiddleware } from "../middlewares/validationResult";

const usersRouter = Router();

usersRouter.get('/:id', authMiddleware, userController.getUserById);


usersRouter.patch('/:id',
    authMiddleware,
    [optionalEmailValidator, optionalNameValidator, dateOfBirthValidator, bioValidator, locationValidator],
    validationResultMiddleware,
    upload.single('avatar'),
    userController.updateUser);

export default usersRouter;