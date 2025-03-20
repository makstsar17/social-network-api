import { HTTP_CODES } from "../constants/httpCodes";
import { CommentService } from "../services/CommentService";
import { ServiceCommentModel } from "../services/models/ServiceCommentModel";
import { PostService } from "../services/PostService";
import { UserService } from "../services/UserService";
import { CreateCommentModel } from "./models/CreateCommentModel";
import { QueryCommentModel } from "./models/QueryCommentModel";
import { ResponseCommentModel } from "./models/ResponseCommentModel";
import { URIParamsCommentIdModel } from "./models/URIParamsCommentIdModel";
import { RequestWithBody, RequestWithParams, RequestWithQuery } from "./types/requestTypes";
import { ResponseWithError } from "./types/responseTypes";


export const commentController = {
    createComment: async (req: RequestWithBody<CreateCommentModel>, res: ResponseWithError<ResponseCommentModel>) => {
        if (!PostService.getPostById(req.body.postId)) {
            res.status(HTTP_CODES.NOT_FOUND).send({
                error: "Invalid post id"
            });
        }
        try {
            const comment = await CommentService.createComment(req.body.content, req.body.postId, req.user!.id);
            const result = await addAdditionalInfo(comment);
            res.status(HTTP_CODES.CREATED).send(result);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    deleteComment: async (req: RequestWithParams<URIParamsCommentIdModel>, res: ResponseWithError<{}>) => {
        const comment = await CommentService.getCommentById(req.params.id);

        if (!comment) {
            res.status(HTTP_CODES.NOT_FOUND).send({
                error: "Invalid comment id"
            });
            return;
        }

        if (comment!.userId !== req.user!.id) {
            res.status(HTTP_CODES.FORBIDDEN).send({
                error: "Not allowed"
            });
            return;
        }

        try {
            await CommentService.deleteComment(req.params.id);
            res.sendStatus(HTTP_CODES.NO_CONTENT);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    },

    getComments: async (req: RequestWithQuery<QueryCommentModel>, res: ResponseWithError<ResponseCommentModel[]>) => {
        try {
            const filter = req.query;
            const comments = await CommentService.getCommentsWithFilter(filter);
            const result = await Promise.all( comments.map(
                (comment) => addAdditionalInfo(comment)
            ))

            res.status(HTTP_CODES.CREATED).send(result);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    }
}

async function addAdditionalInfo(comment: ServiceCommentModel): Promise<ResponseCommentModel> {
    const user = await UserService.getUserById(comment.userId);
    if (!user) {
        throw new Error(`Can't find user with id ${comment.userId}`);
    }
    const { userId, ...result } = comment;
    return {
        ...result,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl
        }
    }
}
