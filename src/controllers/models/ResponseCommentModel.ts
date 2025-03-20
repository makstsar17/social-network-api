export type ResponseCommentModel = {
    id: string,
    content: string,
    postId: string,
    user: {
        id: string, 
        email: string,
        name: string
        avatarUrl: string
    },
};