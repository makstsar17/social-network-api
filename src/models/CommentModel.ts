import mongoose, { model, Schema } from "mongoose";

export interface IComment {
    content: string,
    postId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
}

const CommentSchema = new Schema<IComment>({
    content: { type: String, required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default model('Comment', CommentSchema);