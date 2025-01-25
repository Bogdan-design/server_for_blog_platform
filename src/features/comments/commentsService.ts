import {CommentLikeStatus} from "../../types/types";
import {CommentsRepository} from "./commentsRepository";

export class CommentsService {

    commentsRepository: CommentsRepository

    constructor(){
        this.commentsRepository = new CommentsRepository()
    }

    async updateComment  ({id,newContent}:{id:string,newContent:string}) {
        const result = await this.commentsRepository.updateComment({id,newContent})
        return result
    }
    async deleteComment (id:string) {
        const result = await this.commentsRepository.deleteComment(id)
        return result
    }
    async getCommentsByPostId ({
                                    pageNumber,
                                    pageSize,
                                    sortBy,
                                    sortDirection,
                                    postId
                                }) {
        const comments =  await this.commentsRepository.getCommentsByPostId({
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            postId
        })

        const commentsCount = await this.commentsRepository.getCommentsCountByPostId(postId)

        return {
            pagesCount: Math.ceil(commentsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: commentsCount,
            items: comments.map((comment) => ({
                id:comment._id.toString(),
                content:comment.content,
                commentatorInfo:{
                    userId:comment.commentatorInfo.userId,
                    userLogin:comment.commentatorInfo.userLogin,
                },
                createdAt:comment.createdAt,
            }))
        }
    }
    async likeStatus({commentId, userId, likeStatus}: { commentId: string, userId: string, likeStatus: CommentLikeStatus }) {

        const result = await this.commentsRepository.updateLikeStatusForComment({commentId, userId, likeStatus})
        return result
    }
}