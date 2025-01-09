import { model, Schema } from "mongoose";

const CommentSchema = new Schema({
    content: { type: String, required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    usertId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default model('Comment', CommentSchema);