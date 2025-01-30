import path from "path";
import { HTTP_CODES } from "../constants/httpCodes";
import { UserService } from "../services/UserService";
import { RegisterUserRequestModel, RegisterUserResponseModel } from "./models/RegisterUserModels";
import { RequestWithBody, RequestWithBodyAndParams, RequestWithParams } from "./types/requestTypes";
import { ResponseWithError } from "./types/responseTypes";
import bcrypt from "bcrypt";
import fs from "fs";
import jdenticon from "jdenticon";
import { randomUUID } from "crypto";
import { LoginUserRequestModel, LoginUserResponseModel } from "./models/LoginUserModel";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Request } from "express";
import { TokenService } from "../services/TokenService";
import { URIParamsUserIdModel } from "./models/URIParamsUserModel";
import { ResponseUserModel } from "./models/ResponseUserModel";
import { UpdateRequestUserModel } from "./models/UpdateRequestUserModel";
import { ServiceUserModel } from "../services/models/ServiceUserModel";
import { FollowRequestModel } from "./models/FollowModel";
import { URIParamsFollowingIdModel } from "./models/URIParamsFollowingIdModel";

function castServiceUserModeltoResponseUserModel(user: ServiceUserModel, isFollowing?: boolean): ResponseUserModel {
    const { password, ...data } = user;
    return { ...data, isFollowing };
}

export const userController = {
    register: async (req: RequestWithBody<RegisterUserRequestModel>, res: ResponseWithError<ResponseUserModel>) => {
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
            const avatarPath = path.join(env.AVATAR_PATH, avatarName);
            const avatarPng = jdenticon.toPng(avatarName, 250);

            fs.writeFile(avatarPath, avatarPng, (err) => {
                if (err) console.error(err);
            });

            const user = await UserService.addUser(req.body.name, req.body.email, hashedPassword, avatarName);

            res.status(HTTP_CODES.CREATED).send(castServiceUserModeltoResponseUserModel(user));

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

            const accessToken = jwt.sign({ id: user.id }, env.JWT_ACCESS_SECRET_KEY, { expiresIn: '10m' });
            const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET_KEY, { expiresIn: '1d' });
            res.cookie('jwt-refresh', refreshToken, {
                httpOnly: true,
                path: "/auth/refresh-token",
                secure: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });

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

        try {
            jwt.verify(refreshToken, env.JWT_REFRESH_SECRET_KEY);
            await TokenService.setTokenToBlackList(refreshToken, 60 * 60 * 24);
            res.clearCookie("jwt-refresh");

            await TokenService.setTokenToBlackList(req.headers["authorization"]!.split(" ")[1], 60 * 10);
            res.sendStatus(HTTP_CODES.NO_CONTENT);
        } catch (err) {
            res.status(HTTP_CODES.BAD_REQUEST).send({
                error: "Invalid refresh token"
            });
        }
    },

    getUserById: async (req: RequestWithParams<URIParamsUserIdModel>, res: ResponseWithError<ResponseUserModel>) => {
        const id = req.params.id;
        try {
            if (!UserService.validateId(id)) {
                res.status(HTTP_CODES.BAD_REQUEST).send({
                    error: "Invalid user ID"
                });
                return;
            }

            const user = await UserService.getUserById(id);
            if (!user) {
                res.status(HTTP_CODES.NOT_FOUND).send({
                    error: "User not found"
                })
                return;
            }

            const isFollowing = await UserService.checkFollowersIncludeId(user.id, req.user!.id);

            res.status(HTTP_CODES.OK).send(castServiceUserModeltoResponseUserModel(user, isFollowing));
        } catch (err) {
            console.error(err);
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    updateUser: async (req: RequestWithBodyAndParams<URIParamsUserIdModel, Partial<UpdateRequestUserModel>>,
        res: ResponseWithError<ResponseUserModel>) => {
        const id = req.params.id;
        const { email, name, dateOfBirth, bio, location } = req.body;
        const file = req.file;
        if (id !== req.user!.id) {
            res.status(HTTP_CODES.FORBIDDEN).send({
                error: "Not allowed"
            });
            deleteFile(file?.path);
            return;
        }

        if (email && await UserService.checkUserWithEmail(email)) {
            res.status(HTTP_CODES.BAD_REQUEST)
                .send({
                    error: "User with that email is already registered"
                });
            deleteFile(file?.path);
            return;
        }

        try {
            const oldFileName = (await UserService.getUserAvatarUrl(id));

            const user = await UserService.updateUser(id, { email, name, dateOfBirth, bio, location, avatarUrl: file?.filename });

            if (user?.avatarUrl === file?.filename) {
                deleteFile(path.join(env.AVATAR_PATH, oldFileName!));
            }

            res.status(HTTP_CODES.OK).send(castServiceUserModeltoResponseUserModel(user!));


        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    follow: async (req: RequestWithBody<FollowRequestModel>, res: ResponseWithError<ResponseUserModel>) => {
        const followedUser = await UserService.getUserById(req.body.followingId);
        if (!followedUser) {
            res.status(HTTP_CODES.NOT_FOUND).send({
                error: "User with followingId not found"
            });
            return;
        }

        const user = await UserService.getUserById(req.user!.id);
        if (user!.following.includes(req.body.followingId)){
            res.status(HTTP_CODES.NOT_ALLOWED).send({
                error: "User has already followed followingId"
            });
            return;
        }

        if (req.body.followingId === req.user!.id) {
            res.status(HTTP_CODES.NOT_ALLOWED).send({
                error: "Users can't follow themselves"
            });
            return;
        }

        try {
            const user = await UserService.addFollowingIdToUser(req.user!.id, req.body.followingId);
            res.status(HTTP_CODES.OK).send(castServiceUserModeltoResponseUserModel(user!));
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    unfollow: async (req: RequestWithParams<URIParamsFollowingIdModel>, res: ResponseWithError<ResponseUserModel>) => { 
        const followedUser = await UserService.getUserById(req.params.id);
        if (!followedUser) {
            res.status(HTTP_CODES.NOT_FOUND).send({
                error: "User with followingId not found"
            });
            return;
        }

        const user = await UserService.getUserById(req.user!.id);
        if(!user!.following.includes(req.params.id)) {
            res.status(HTTP_CODES.NOT_ALLOWED).send({
                error: "User doesn't follow followingId"
            });
            return;
        }

        try {
            const user = await UserService.deleteFollowingIdInUser(req.user!.id, req.params.id);
            res.status(HTTP_CODES.OK).send(castServiceUserModeltoResponseUserModel(user!));
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },
}

function deleteFile(fileUrl?: string) {
    if (fileUrl) {
        fs.unlink(fileUrl, (err) => {
            if (err) {
                console.error(err);
            }
        })
    }
}