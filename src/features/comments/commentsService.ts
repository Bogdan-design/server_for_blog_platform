import {CommentType, LikeStatusEnum, LikeForCommentType} from "../../types/types";
import {CommentsRepository} from "./commentsRepository";

export class CommentsService {

    commentsRepository: CommentsRepository

    constructor() {
        this.commentsRepository = new CommentsRepository()
    }

    async updateComment({id, newContent}: { id: string, newContent: string }) {
        const result = await this.commentsRepository.updateComment({id, newContent})
        return result
    }

    async deleteComment(id: string) {
        const result = await this.commentsRepository.deleteComment(id)
        return result
    }

    async getCommentsByPostId({
                                  pageNumber,
                                  pageSize,
                                  sortBy,
                                  sortDirection,
                                  postId
                              }) {
        const comments = await this.commentsRepository.getCommentsByPostId({
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            postId
        })

        const commentsCount = await this.commentsRepository.getCommentsCountByPostId(postId)
        const likesArr = await this.commentsRepository.getAllLikes()

        const myStatus = (userId: string, commentId: string) => {
            const like = likesArr.find(like => like.authorId === userId && like.commentId === commentId)
            return like ? like.status : LikeStatusEnum.NONE
        }


        return {
            pagesCount: Math.ceil(commentsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: commentsCount,
            items: comments.map((comment) => ({
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin,
                },
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.likesInfo.dislikesCount,
                    myStatus: myStatus(comment.commentatorInfo.userId, comment._id.toString())
                }
            }))
        }
    }

    async likeStatus({commentId, userId, likeStatus}: {
        commentId: string,
        userId: string,
        likeStatus: LikeStatusEnum
    }) {

        let comment: CommentType
        comment = await this.commentsRepository.getCommentsById(commentId)
        if (!comment) return null

        const newLike: LikeForCommentType = {
            createdAt: new Date().toISOString(),
            status: likeStatus,
            authorId: userId,
            commentId
        }

        const previousLikeByUser = await this.commentsRepository.getPreviousLike(userId, commentId)

        if (previousLikeByUser) {
            if (previousLikeByUser.status === likeStatus) {

                return comment
            } else if (likeStatus === LikeStatusEnum.NONE) {
                await this.commentsRepository.deleteLike(userId, previousLikeByUser._id.toString());
                if (previousLikeByUser.status === LikeStatusEnum.lIKE) {
                    comment.likesInfo.likesCount--;
                } else if (previousLikeByUser.status === LikeStatusEnum.DISLIKE) {
                    comment.likesInfo.dislikesCount--;
                }


                return await this.commentsRepository.updateLikeStatusForComment(comment)

            } else {
                await this.commentsRepository.deleteLike(userId, previousLikeByUser._id.toString());
                if (likeStatus === LikeStatusEnum.lIKE) {
                    comment.likesInfo.likesCount++;
                    comment.likesInfo.dislikesCount--;
                } else if (likeStatus === LikeStatusEnum.DISLIKE) {
                    comment.likesInfo.dislikesCount++;
                    comment.likesInfo.likesCount--;
                }


                const like = await this.commentsRepository.saveLike(newLike)

                if (!like) return null

                return await this.commentsRepository.updateLikeStatusForComment(comment)
            }
        } else {
            if (likeStatus === LikeStatusEnum.lIKE) {
                comment.likesInfo.likesCount++;
            }
            if (likeStatus === LikeStatusEnum.DISLIKE) {
                comment.likesInfo.dislikesCount++;
            }


            const like = await this.commentsRepository.saveLike(newLike)

            if (!like) return null
            return await this.commentsRepository.updateLikeStatusForComment(comment)
        }

    }
}