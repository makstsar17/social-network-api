import mongoose from "mongoose";
import UserModel from "../models/UserModel"


export const UserService = {
    addUser: async (name: string, email: string, password: string, avatarUrl: string) => {
        const newUser = new UserModel({
            name,
            email,
            password,
            avatarUrl
        });

        const savedUser = await newUser.save();
        return savedUser.toObject();
    },

    checkUserWithEmail: async (email: string) => {
        const result = await UserModel.where('email').equals(email).exec();
        return result.length !== 0;
    },

    getUserByEmail: async (email: string) => {
        return await UserModel.findOne({ email }, '_id password').lean<{ _id: mongoose.Types.ObjectId, password: string }>();
    },

    validateId: (id: string) => {
        return mongoose.Types.ObjectId.isValid(id);
    },

    getUserById: async (id: string) => {
        return await UserModel.findById(id).lean();
    },

    checkFollowersIncludeId: async (userId: mongoose.Types.ObjectId, checkId: string) => {
        return await UserModel.where('_id').equals(userId).where('followers').in([checkId]).exec() ? true : false;
    },

    castStringtoObjectId: (id: string) => {
        return new mongoose.Types.ObjectId(id);
    }
}