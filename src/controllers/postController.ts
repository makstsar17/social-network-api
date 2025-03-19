import { HTTP_CODES } from "../constants/httpCodes";
import { ServicePostModel } from "../services/models/ServicePostModel";
import { PostService } from "../services/PostService";
import { UserService } from "../services/UserService";
import { CreatePostModel } from "./models/CreatePostModel";
import { QueryPostModel } from "./models/QueryPostModel";
import { ResponsePostModel } from "./models/ResponsePostModel";
import { URIParamsPostIdModel } from "./models/URIParamsPostIdModel";
import { URIParamsUserIdModel } from "./models/URIParamsUserModel";
import { RequestWithBody, RequestWithParams, RequestWithQuery } from "./types/requestTypes";
import { ResponseWithError } from "./types/responseTypes";

export const postController = {
    createPost: async (req: RequestWithBody<CreatePostModel>, res: ResponseWithError<ResponsePostModel>) => {
        try {
            const newPost = await PostService.createPost(req.user!.id, req.body.content);
            const result = await addAdditionalInfo(newPost);
            res.status(HTTP_CODES.CREATED).send(result);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    getAllPostsForUser: async (req: RequestWithBody<{}>, res: ResponseWithError<ResponsePostModel[]>) => {
        try {
            const posts = await PostService.getAllPostsForUser(req.user!.id);

            const result = await Promise.all(
                posts.map(
                    post => addAdditionalInfo(post, req.user!.id)
                )
            );

            res.status(HTTP_CODES.OK).send(result);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    getPosts: async (req: RequestWithQuery<QueryPostModel>, res: ResponseWithError<ResponsePostModel[]>) => {
        try {
            const filter = req.query;

            const posts = await PostService.getPostsWithFilter(filter);
            const result = await Promise.all(
                posts.map(
                    post => addAdditionalInfo(post, req.user!.id)
                )
            );

            res.status(HTTP_CODES.OK).send(result);

        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    getAllPostsByUserId: async (req: RequestWithParams<URIParamsUserIdModel>, res: ResponseWithError<ResponsePostModel[]>) => {
        try {
            const posts = await PostService.getAllPostsByUser(req.user!.id);

            const result = await Promise.all(
                posts.map(
                    post => addAdditionalInfo(post, req.user!.id)
                )
            );

            res.status(HTTP_CODES.OK).send(result);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    getPostById: async (req: RequestWithParams<URIParamsPostIdModel>, res: ResponseWithError<ResponsePostModel>) => {
        try {
            const post = await PostService.getPostById(req.params.id);
            if (!post) {
                res.status(HTTP_CODES.NOT_FOUND).send({
                    error: "Post not found"
                });
                return;
            }
            const result = await addAdditionalInfo(post!, req.user!.id);

            res.status(HTTP_CODES.OK).send(result);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    deletePostById: async (req: RequestWithParams<URIParamsPostIdModel>, res: ResponseWithError<{}>) => {
        try {
            const post = await PostService.getPostById(req.params.id);
            if (!post) {
                res.status(HTTP_CODES.NOT_FOUND).send({
                    error: "Invalid post id"
                });
                return;
            }

            if (post!.userId !== req.user!.id) {
                res.status(HTTP_CODES.FORBIDDEN).send({
                    error: "Not allowed"
                });
                return;
            }

            await PostService.deletePostById(req.params.id);
            res.sendStatus(HTTP_CODES.NO_CONTENT);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    like: async (req: RequestWithParams<URIParamsPostIdModel>, res: ResponseWithError<ResponsePostModel>) => {
        const post = await PostService.getPostById(req.params.id);

        if (!post) {
            res.status(HTTP_CODES.NOT_FOUND).send({
                error: "Post not found"
            });
            return;
        }

        if (post.likes.includes(req.user!.id)) {
            res.status(HTTP_CODES.NOT_ALLOWED).send({
                error: "User has already liked post"
            });
            return;
        }

        try {
            const likedPost = await PostService.addLikeToPost(req.params.id, req.user!.id);
            const result = await addAdditionalInfo(likedPost, req.user!.id);
            res.status(HTTP_CODES.OK).send(result);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    unlike: async (req: RequestWithParams<URIParamsPostIdModel>, res: ResponseWithError<ResponsePostModel>) => {
        const post = await PostService.getPostById(req.params.id);

        if (!post) {
            res.status(HTTP_CODES.NOT_FOUND).send({
                error: "Post not found"
            });
            return;
        }

        if (!post.likes.includes(req.user!.id)) {
            res.status(HTTP_CODES.NOT_ALLOWED).send({
                error: "User hasn't liked post"
            });
            return;
        }

        try {
            const likedPost = await PostService.deleteLikeInPost(req.params.id, req.user!.id);
            const result = await addAdditionalInfo(likedPost, req.user!.id);
            res.status(HTTP_CODES.OK).send(result);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },
};

async function addAdditionalInfo(post: ServicePostModel, checkId?: string): Promise<ResponsePostModel> {
    const user = await UserService.getUserById(post.userId);
    if (!user) {
        throw new Error(`Can't find user with id ${post.userId}`);
    }
    const { userId, ...result } = post;
    return {
        ...result,
        likedByUser: checkId ? post.likes.includes(checkId) : false,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl
        }
    }
}
