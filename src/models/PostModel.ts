import mongoose, { model, Schema } from "mongoose";

export interface IPost {
    content: string,
    userId: mongoose.Types.ObjectId,
    likes: mongoose.Types.ObjectId[],
    comments: mongoose.Types.ObjectId[],
    createdAt: Date
}

const PostSchema = new Schema<IPost>({
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    createdAt: { type: Date, default: Date.now },
});

export default model('Post', PostSchema);