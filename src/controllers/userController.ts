import path from "path";
import { HTTP_CODES } from "../constants/httpCodes";
import { UserService } from "../services/UserService";
import { RegisterUserRequestModel, RegisterUserResponseModel } from "./models/RegisterUserModels";
import { RequestWithBody } from "./requestTypes";
import { ResponseWithError } from "./responseTypes";
import bcrypt from "bcrypt";
import fs from "fs";
import jdenticon from "jdenticon";
import { randomUUID } from "crypto";
import { LoginUserRequestModel, LoginUserResponseModel } from "./models/LoginUserModel";
import jwt from "jsonwebtoken";
import { env } from "../config/env";


export const userController = {
    register: async (req: RequestWithBody<RegisterUserRequestModel>, res: ResponseWithError<RegisterUserResponseModel>) => {
        try {
            if (await UserService.checkUserWithEmail(req.body.email)) {
                res.status(HTTP_CODES.BAD_REQUEST)
                    .send({
                        error: "User with that email is already registered"
                    });
                return;
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const avatarName = `${randomUUID()}.png`
            const avatarPath = path.join(__dirname, '/../../uploads', avatarName);
            const avatarPng = jdenticon.toPng(avatarName, 250);

            fs.writeFile(avatarPath, avatarPng, (err) => {
                if (err) console.error(err);
            });

            const user = await UserService.addUser(req.body.name, req.body.email, hashedPassword, avatarPath);

            res.status(HTTP_CODES.CREATED).send({
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                avatarUrl: user.avatarUrl!
            });

        } catch (err) {
            console.error("Error in register: ", err);
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                "error": "Internal Server Error"
            })
        }
    },

    login: async (req: RequestWithBody<LoginUserRequestModel>, res: ResponseWithError<LoginUserResponseModel>) => {
        try {
            const user = await UserService.getUserByEmail(req.body.email);

            if (!user) {
                res.status(HTTP_CODES.UNAUTHORIZED)
                    .send({ "error": "Invalid email or password" });
                return;
            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);

            if (!validPassword) {
                res.status(HTTP_CODES.UNAUTHORIZED)
                    .send({ "error": "Invalid email or password" });
            }

            const accessToken = jwt.sign({ "email": req.body.email }, env.JWT_ACCESS_SECRET_KEY, { expiresIn: '10m' });
            const refreshToken = jwt.sign({ "email": req.body.email }, env.JWT_REFRESH_SECRET_KEY, { expiresIn: '1d' });
            res.cookie('jwt-refresh', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

            res.status(HTTP_CODES.OK).send({
                "token": accessToken
            })
        }
        catch (err) {
            console.error("Error in login: ", err);
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                "error": "Internal Server Error"
            })
        }
    }
}