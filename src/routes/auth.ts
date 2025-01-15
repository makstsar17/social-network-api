import express from "express";

import { emailValidator, nameValidator, passwordValidator } from '../middlewares/validators';
import { validationResultMiddleware } from '../middlewares/validationResult';
import { userController } from '../controllers/userController';
import { authMiddleware } from "../middlewares/auth";

const authRouter = express.Router();

authRouter.post('/register', [emailValidator, passwordValidator, nameValidator], validationResultMiddleware, userController.register);

authRouter.post('/login', [emailValidator, passwordValidator], validationResultMiddleware, userController.login);

// - refresh token  
//-logout token;
authRouter.post('/refresh-token', userController.refresh_token);

authRouter.post('/logout', authMiddleware, userController.logout);

export default authRouter;
