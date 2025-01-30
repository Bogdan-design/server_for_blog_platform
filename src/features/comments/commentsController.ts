import {Response} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {
    LikeStatusEnum,
    CommentType,
    RequestWithParams,
    RequestWithParamsAndBody,
    UserType,
    LikeInfoType
} from "../../types/types";
import {ObjectId, WithId} from "mongodb";
import {CommentsService} from "./commentsService";
import {CommentsRepository} from "./commentsRepository";


export class CommentsController {

    commentsService: CommentsService
    commentsRepository: CommentsRepository

    constructor() {
        this.commentsService = new CommentsService()
        this.commentsRepository = new CommentsRepository()
    }


    async likeStatus(req: RequestWithParamsAndBody<{ commentId: string }, { likeStatus: LikeStatusEnum }> & {
        user: WithId<UserType>
    }, res: Response<any>) {
        try {
            const commentId = req.params.commentId
            const likeStatus = req.body.likeStatus
            const userId = req.user._id.toString()

            const comment = await this.commentsRepository.getCommentsById(commentId)

            if (!comment) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            const result = await this.commentsService.likeStatus({commentId, userId, likeStatus})

            if (!result) {
                res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                return
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } catch (e) {
            console.error(e);
            res
                .status(HTTP_STATUSES.BAD_REQUEST_400)
                .json({error: "Error updating comments"});
            return
        }

    }

    async updateComment(req: RequestWithParamsAndBody<{ commentId: string }, {
        content: string
    }> & {
        user: WithId<UserType>
    }, res: Response<any>): Promise<void> {
        try {
            const id = req.params.commentId

            const userId = req.user._id.toString()
            const foundComment = await this.commentsRepository.getCommentsById(id)

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
            if (userId !== foundComment.commentatorInfo.userId) {
                res.sendStatus(HTTP_STATUSES.NOT_OWN_403)
                return
            }

            const newContent = req.body.content;
            const newComment = await this.commentsService.updateComment({id, newContent})

            if (!newComment.acknowledged) {
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
    }

    async deleteComment(req: RequestWithParams<{ commentId: string }> & {
        user: WithId<UserType>
    }, res: Response) {
        try {
            const id = req.params.commentId

            const userId = req.user._id.toString()

            const foundComment = await this.commentsRepository.getCommentsById(id)

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
            if (userId !== foundComment.commentatorInfo.userId) {
                res.sendStatus(HTTP_STATUSES.NOT_OWN_403)
                return
            }

            const result = await this.commentsService.deleteComment(id)

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
    }

    async getCommentById(req: RequestWithParams<{ id: string }> & {
        userId: ObjectId
    }, res: Response<
        Omit<CommentType, 'postId'> & {
        likesInfo: { myStatus: LikeStatusEnum }
    } | { message: string }
    >) {
        try {
            const id = req.params.id;

            const userId = req.userId
            let myStatus : LikeStatusEnum = LikeStatusEnum.NONE

            if (userId) {
                const likeStatus = await this.commentsRepository.getPreviousLike(userId.toString(),id)
                myStatus = likeStatus ? likeStatus.status :LikeStatusEnum.NONE
            }

            if (!id && !ObjectId.isValid(id)) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            const comment = await this.commentsRepository.getCommentsById(id)
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
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.likesInfo.dislikesCount,
                    myStatus
                }
            })

        } catch (err) {
            console.error(err);
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({message: "Cant find comment"});
            return
        }
    }

}

