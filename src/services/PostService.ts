import mongoose, { ClientSession, HydratedDocument } from "mongoose";
import PostModel, { IPost } from "../models/PostModel"
import { ServicePostModel } from "./models/ServicePostModel";
import { UserService } from "./UserService";

function castDBPostModeltoServicePostModel(post: HydratedDocument<IPost>): ServicePostModel {
    return {
        id: post._id.toString(),
        content: post.content,
        userId: post.userId.toString(),
        likes: post.likes.map(userId => userId.toString()),
        comments: post.comments.map(commentId => commentId.toString()),
        createdAt: post.createdAt
    }
}

export const PostService = {
    createPost: async (userId: string, content: string): Promise<ServicePostModel> => {
        const post = new PostModel({ content, userId });
        await post.save();

        UserService.addPostIdToUser(userId, post._id.toString());
        return castDBPostModeltoServicePostModel(post);
    },

    getAllPostsForUser: async (userId: string): Promise<ServicePostModel[]> => {
        const user = await UserService.getUserById(userId);
        const posts = await PostModel.where('userId').in(user!.following).sort({ 'createdAt': 'desc' }).exec();
        return posts.map(castDBPostModeltoServicePostModel);
    },

    getAllPostsByUser: async (userId: string): Promise<ServicePostModel[]> => {
        const posts = await PostModel.find({ userId }).exec();
        return posts.map(castDBPostModeltoServicePostModel);
    },

    getPostsWithFilter: async (filter: Object): Promise<ServicePostModel[]> => {
        const posts = await PostModel.find(filter).exec();
        return posts.map(castDBPostModeltoServicePostModel);
    },

    getPostById: async (postId: string): Promise<ServicePostModel | null> => {
        const post = await PostModel.findById(postId).exec();
        if (!post) {
            return null;
        }
        return castDBPostModeltoServicePostModel(post);
    },

    deletePostById: async (postId: string): Promise<void> => {
        const session: ClientSession = await mongoose.startSession();
        session.startTransaction();
        try {
            const post = await PostModel.findByIdAndDelete(postId).exec();
            await UserService.deletePostIdInUser(post!.userId.toString(), post!._id.toString());

            //delete comments

            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            await session.endSession();
        }
    },

    addCommentToPost: async (postId: string, commentId: string) => {
        await PostModel.findByIdAndUpdate(postId, { $push: { comments: commentId } });
    },

    deleteCommentInPost: async (commentId: string, postId: string) => {
        await PostModel.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
    }

}