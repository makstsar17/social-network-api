export type ResponsePostModel = {
    id: string,
    content: string,
    user: {
        id: string, 
        email: string,
        name: string
        avatarUrl: string
    },
    likes: string[],
    comments: string[],
    createdAt: Date,
    likedByUser?: boolean
};