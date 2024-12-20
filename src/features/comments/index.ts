import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {serviceComments} from "../../features/comments/service.comments";
import {repositoryComments} from "../../features/comments/repository.comments";
import {CommentType, RequestWithParams, RequestWithParamsAndBody} from "../../types/types";
import {commentsInputValidationBodyMiddleware} from "../../middlewares/errorsMiddleware";
import {ObjectId} from "mongodb";

export const commentsRouter = Router()

export const commentsController = {
    async updateComment(req: RequestWithParamsAndBody<{ commentId: string }, {
        content: string
    }>, res: Response<any>): Promise<void> {
        try {
            const id = req.params.commentId

            const newContent = req.body.content;

            const isComment = await repositoryComments.getCommentsById(id)

            if (!isComment) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({
                        errorsMessages: {
                            message: "Comment with that id not found.",
                            field: "id"
                        }
                    })
                return
            }
            const newComment = await serviceComments.updateComment({id, newContent})

            res
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            console.error(e);
            res
                .status(HTTP_STATUSES.BAD_REQUEST_400)
                .json({error: "Error updating comments"});
            return
        }
    },
    async deleteComment(req: Request, res: Response) {
        try {
            const id = req.params.commentId
            const result = await serviceComments.deleteComment(id)

            if (result.deletedCount === 0) {
                res
                    .sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            res
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } catch (err) {
            console.error(err);
            res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Error deleting comment"});
        }
    },
    async getCommentById(req: RequestWithParams<{ id: string }>, res: Response<CommentType | { message: string }>) {
        try {
            const id = req.params.id;


            if (!id && !ObjectId.isValid(id)) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            const comment = await repositoryComments.getCommentsById(id)
debugger
            if (!comment) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            res.status(HTTP_STATUSES.OK_200).json({
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                createdAt: comment.createdAt
            })

        } catch (err) {
            console.error(err);
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({message: "Cant find comment"});
            return
        }
    },

}

commentsRouter.put('/:commentId', commentsInputValidationBodyMiddleware, commentsController.updateComment)
commentsRouter.delete('/:commentId', commentsController.deleteComment)
commentsRouter.get('/:id', commentsController.getCommentById)