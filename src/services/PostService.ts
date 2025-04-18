import mongoose, { ClientSession, HydratedDocument } from "mongoose";
import PostModel, { IPost } from "../models/PostModel"
import { ServicePostModel } from "./models/ServicePostModel";
import { UserService } from "./UserService";
import { CommentService } from "./CommentService";

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
        const posts = await PostModel.find({ userId }).sort('-createdAt').exec();
        return posts.map(castDBPostModeltoServicePostModel);
    },

    getPostsWithFilter: async (filter: Object): Promise<ServicePostModel[]> => {
        const posts = await PostModel.find(filter).sort('-createdAt').exec();
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
            if (!post) return;
            await UserService.deletePostIdInUser(post.userId.toString(), post._id.toString());
            Promise.all(
                post.comments.map(
                    async (commentId) => await CommentService.deleteComment(commentId.toString())
                )
            );

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
    },

    addLikeToPost: async (postId: string, userId: string) => {
        const post = await PostModel.findByIdAndUpdate(postId, { $push: { likes: userId } }, { returnDocument: "after" });
        return castDBPostModeltoServicePostModel(post!);
    },

    deleteLikeInPost: async (postId: string, userId: string) => {
        const post = await PostModel.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { returnDocument: "after" });
        return castDBPostModeltoServicePostModel(post!);
    }
}