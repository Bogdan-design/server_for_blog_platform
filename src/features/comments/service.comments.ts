import {repositoryComments} from "../../features/comments/repository.comments";

export const serviceComments = {
    updateComment: async ({id,newContent}:{id:string,newContent:string}) => {
        const result = await repositoryComments.updateComment({id,newContent})
    },
    deleteComment: async (id:string) => {
        const result = await repositoryComments.deleteComment(id)
        return result
    },
    getCommentById: async ({id,content}:{id:string,content:string}) => {}
}