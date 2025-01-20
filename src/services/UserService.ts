import mongoose from "mongoose";
import UserModel, { IUser } from "../models/UserModel";
import { ServiceUserModel } from "./models/ServiceUserModel";

function castDBUserModeltoServiceUserModel(userDoc: mongoose.HydratedDocument<IUser>): ServiceUserModel {
    return {
        id: userDoc._id.toString(),
        email: userDoc.email,
        password: userDoc.password,
        name: userDoc.name,
        avatarUrl: userDoc.avatarUrl,
        dateOfBirth: userDoc.dateOfBirth,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
        bio: userDoc.bio,
        location: userDoc.location,
        posts: userDoc.posts.map(postId => postId.toString()),
        followers: userDoc.followers.map(userId => userId.toString()),
        following: userDoc.following.map(userId => userId.toString()),
    }
}


export const UserService = {
    addUser: async (name: string, email: string, password: string, avatarUrl: string): Promise<ServiceUserModel> => {
        const newUser = new UserModel({
            name,
            email,
            password,
            avatarUrl
        });

        const savedUser = await newUser.save();
        return castDBUserModeltoServiceUserModel(savedUser);
    },

    checkUserWithEmail: async (email: string): Promise<boolean> => {
        const result = await UserModel.where('email').equals(email).exec();
        return result.length !== 0;
    },

    getUserByEmail: async (email: string): Promise<ServiceUserModel | null> => {
        const user = await UserModel.findOne({ email }).exec();
        if (!user) {
            return null;
        }
        return castDBUserModeltoServiceUserModel(user);
    },

    validateId: (id: string): boolean => {
        return mongoose.Types.ObjectId.isValid(id);
    },

    getUserById: async (id: string): Promise<ServiceUserModel | null> => {
        const user = await UserModel.findById(id).exec();
        if (!user) {
            return null;
        }
        return castDBUserModeltoServiceUserModel(user);
    },

    checkFollowersIncludeId: async (userId: string, checkId: string): Promise<boolean> => {
        return await UserModel.findById(userId).where('followers').in([checkId]).exec() ? true : false;
    },

    updateUser: async (userId: string, updateData: Object): Promise<ServiceUserModel | null> => {
        const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
        if (!user) {
            return null;
        }
        return castDBUserModeltoServiceUserModel(user);
    },

    getUserAvatarUrl: async (id: string): Promise<string | undefined> => {
        const user = await UserModel.findById(id, 'avatarUrl').lean();
        return user?.avatarUrl;
    }

}