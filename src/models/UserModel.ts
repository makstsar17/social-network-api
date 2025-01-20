import mongoose, { model, Schema } from "mongoose";

export interface IUser {
    email: string,
    password: string,
    name: string,
    avatarUrl: string,
    dateOfBirth?: Date,
    createdAt: Date,
    updatedAt?: Date,
    bio?: string,
    location?: string,
    posts: mongoose.Types.ObjectId[],
    followers: mongoose.Types.ObjectId[],
    following: mongoose.Types.ObjectId[],

}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatarUrl: String,
    dateOfBirth: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    bio: String,
    location: String,
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default model('User', UserSchema);