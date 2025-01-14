import UserModel from "../models/UserModel"


export const UserService = {
    addUser: async (name: string, email: string, password: string, avatarUrl: string) => {
        try {
            const newUser = new UserModel({
                name,
                email,
                password,
                avatarUrl
            });

            const savedUser = await newUser.save();
            return savedUser.toObject();
        } catch (err) {
            console.error("Error adding user: ", err);
            throw err;
        }
    },

    checkUserWithEmail: async (email: string) => {
        const result = await UserModel.where('email').equals(email).exec();
        if (result.length !== 0) {
            return true;
        }
        return false;
    },

    getUserByEmail: async (email: string) => {
        try {
            const result = await UserModel.findOne({ email });
            return result?.toObject();
        } catch (err) {
            console.error("Error getting user by email: ", err);
            throw err;
        }
    }
}