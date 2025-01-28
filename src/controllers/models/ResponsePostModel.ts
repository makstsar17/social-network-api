export type ResponsePostModel = {
    id: string,
    content: string,
    userId: string,
    likes: string[],
    comments: string[],
    createdAt: Date,
    likedByUser?: boolean
};