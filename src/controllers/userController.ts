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
import { Request } from "express";
import { TokenService } from "../services/TokenService";

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
                error: "Internal Server Error"
            })
        }
    },

    login: async (req: RequestWithBody<LoginUserRequestModel>, res: ResponseWithError<LoginUserResponseModel>) => {
        try {
            const user = await UserService.getUserByEmail(req.body.email);

            if (!user) {
                res.status(HTTP_CODES.UNAUTHORIZED)
                    .send({ error: "Invalid email or password" });
                return;
            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);

            if (!validPassword) {
                res.status(HTTP_CODES.UNAUTHORIZED)
                    .send({ error: "Invalid email or password" });
                return;
            }

            const accessToken = jwt.sign({ id: user._id }, env.JWT_ACCESS_SECRET_KEY, { expiresIn: '10m' });
            const refreshToken = jwt.sign({ id: user._id }, env.JWT_REFRESH_SECRET_KEY, { expiresIn: '1d' });
            res.cookie('jwt-refresh', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

            res.status(HTTP_CODES.OK).send({
                token: accessToken
            })
        }
        catch (err) {
            console.error("Error in login: ", err);
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Internal Server Error"
            })
        }
    },

    refresh_token: async (req: Request, res: ResponseWithError<LoginUserResponseModel>) => {
        const refreshToken = req.cookies["jwt-refresh"];
        if (!refreshToken) {
            res.status(HTTP_CODES.UNAUTHORIZED).send({
                error: "Refresh token not found, please login again"
            });
            return;
        }

        if (await TokenService.isTokenBlacklisted(refreshToken)) {
            res.status(HTTP_CODES.FORBIDDEN).send({
                error: "Invalid refresh token"
            });
            return;
        }

        try {
            const user = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET_KEY) as { id: string };
            const accessToken = jwt.sign({ id: user.id }, env.JWT_ACCESS_SECRET_KEY, { expiresIn: '10m' });

            res.status(HTTP_CODES.OK).send({
                token: accessToken
            });
        } catch (err) {
            res.status(HTTP_CODES.FORBIDDEN).send({
                error: "Invalid or expired refresh token"
            });
        }

    },

    logout: async (req: Request, res: ResponseWithError<{}>) => {
        const refreshToken = req.cookies["jwt-refresh"];

        if (!refreshToken) {
            res.status(HTTP_CODES.BAD_REQUEST).send({
                error: "Refresh token not found"
            });
            return;
        }

        try{
            jwt.verify(refreshToken, env.JWT_REFRESH_SECRET_KEY);
            await TokenService.setTokenToBlackList(refreshToken, 60 * 60 * 24);
            res.clearCookie("jwt-refresh");

            await TokenService.setTokenToBlackList(req.headers["authorization"]!.split(" ")[1], 60*10);
        } catch (err) {
            res.status(HTTP_CODES.BAD_REQUEST).send({
                error: "Invalid refresh token"
            });
        }
    }
}