import { model, Schema } from "mongoose";

const UserSchema = new Schema({
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