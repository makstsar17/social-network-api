import mongoose from "mongoose";

export type ResponseUserModel = {
    email: string,
    name: string,
    avatarUrl: string,
    dateOfBirth?: Date | null,
    bio?: string | null,
    location?: string | null,
    posts: mongoose.Types.ObjectId[],
    followers: mongoose.Types.ObjectId[],
    following: mongoose.Types.ObjectId[],
    isFollowing?: boolean,
}