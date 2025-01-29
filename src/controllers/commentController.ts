import { HTTP_CODES } from "../constants/httpCodes";
import { CommentService } from "../services/CommentService";
import { PostService } from "../services/PostService";
import { CreateCommentModel } from "./models/CreateCommentModel";
import { ResponseCommentModel } from "./models/ResponseCommentModel";
import { URIParamsCommentIdModel } from "./models/URIParamsCommentIdModel";
import { RequestWithBody, RequestWithParams } from "./types/requestTypes";
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

            res.status(HTTP_CODES.CREATED).send(comment);
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
            res.status(HTTP_CODES.NO_CONTENT);
        } catch (err) {
            res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send({
                error: "Server error"
            });
        }
    }
}