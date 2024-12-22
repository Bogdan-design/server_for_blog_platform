import {repositoryComments} from "../../features/comments/repository.comments";

export const serviceComments = {
    updateComment: async ({id,newContent}:{id:string,newContent:string}) => {
        const result = await repositoryComments.updateComment({id,newContent})
        return result
    },
    deleteComment: async (id:string) => {
        const result = await repositoryComments.deleteComment(id)
        return result
    },
    getCommentsByPostId: async ({
                                    pageNumber,
                                    pageSize,
                                    sortBy,
                                    sortDirection,
                                    postId
                                }) => {
        const comments =  await repositoryComments.getCommentsByPostId({
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            postId
        })

        const commentsCount = await repositoryComments.getCommentsCountByPostId(postId)

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
}