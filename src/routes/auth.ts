import express from "express";

import { emailValidator, nameValidator, passwordValidator } from '../middlewares/validators';
import { validationResultMiddleware } from '../middlewares/validationResult';
import { userController } from '../controllers/userController';

const authRouter = express.Router();

authRouter.post('/register', [emailValidator, passwordValidator, nameValidator], validationResultMiddleware, userController.register);

export default authRouter;
