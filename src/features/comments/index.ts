import {Response, Router} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {serviceComments} from "../../features/comments/service.comments";
import {repositoryComments} from "../../features/comments/repository.comments";
import {CommentType, RequestWithParams, RequestWithParamsAndBody, UserType} from "../../types/types";
import {commentsInputValidationParamsMiddleware} from "../../middlewares/errorsMiddleware";
import {ObjectId, WithId} from "mongodb";
import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";

export const commentsRouter = Router()

export const commentsController = {
    async updateComment(req: RequestWithParamsAndBody<{ commentId: string }, {
        content: string
    }> & {
        user: WithId<UserType>
    }, res: Response<any>): Promise<void> {
        try {
            const id = req.params.commentId

            const userId = req.user._id.toString()
            const foundComment = await repositoryComments.getCommentsById(id)

            if (!foundComment) {
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
            if(userId !== foundComment.commentatorInfo.userId){
                res.sendStatus(HTTP_STATUSES.NOT_OWN_403)
                return
            }

            const newContent = req.body.content;
            const newComment = await serviceComments.updateComment({id, newContent})

            if(!newComment.acknowledged){
                res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                return
            }

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
    async deleteComment(req: RequestWithParams<{ commentId: string }> & {
        user: WithId<UserType>
    }, res: Response) {
        try {
            const id = req.params.commentId

            const userId = req.user._id.toString()

            const foundComment = await repositoryComments.getCommentsById(id)

            if (!foundComment) {
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
            if(userId !== foundComment.commentatorInfo.userId){
                res.sendStatus(HTTP_STATUSES.NOT_OWN_403)
                return
            }

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
    async getCommentById(req: RequestWithParams<{ id: string }>, res: Response<Omit<CommentType, 'postId'> | {
        message: string
    }>) {
        try {
            const id = req.params.id;


            if (!id && !ObjectId.isValid(id)) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            const comment = await repositoryComments.getCommentsById(id)
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

commentsRouter.put('/:commentId', authBearerMiddleware,commentsInputValidationParamsMiddleware, commentsController.updateComment)
commentsRouter.delete('/:commentId', authBearerMiddleware, commentsController.deleteComment)
commentsRouter.get('/:id', commentsController.getCommentById)