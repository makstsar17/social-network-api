import mongoose, { HydratedDocument } from "mongoose"
import CommentModel, { IComment } from "../models/CommentModel"
import { ServiceCommentModel } from "./models/ServiceCommentModel"
import { PostService } from "./PostService"

function castDBCommentModelToServiceCommentModel(comment: HydratedDocument<IComment>): ServiceCommentModel {
    return {
        id: comment._id.toString(),
        content: comment.content,
        postId: comment.postId.toString(),
        userId: comment.userId.toString()
    }
}

export const CommentService = {
    createComment: async (content: string, postId: string, userId: string): Promise<ServiceCommentModel> => {
        const comment = await CommentModel.create({ content, postId, userId });
        PostService.addCommentToPost(postId, comment._id.toString());
        return castDBCommentModelToServiceCommentModel(comment);
    },

    getCommentById: async (commentId: string): Promise<ServiceCommentModel | null> => {
        const comment = await CommentModel.findById(commentId).exec();
        if (!comment) {
            return null;
        }
        return castDBCommentModelToServiceCommentModel(comment);
    },

    deleteComment: async (commentId: string): Promise<void> => {
        const session = await mongoose.startSession();

        session.startTransaction()

        try {
            const comment = await CommentModel.findByIdAndDelete(commentId);
            await PostService.deleteCommentInPost(commentId, comment!.postId.toString());
    
            session.commitTransaction();
        } catch (err) {
            session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    },

    getCommentsWithFilter: async (filter: Object): Promise<ServiceCommentModel[]> => {
        const comments = await CommentModel.find(filter).exec();
        return comments.map(castDBCommentModelToServiceCommentModel);
    }
}