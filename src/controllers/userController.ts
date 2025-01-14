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
    }
}