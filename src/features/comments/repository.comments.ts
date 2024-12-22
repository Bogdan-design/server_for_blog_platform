import {commentsCollection, postCollection, usersCollection} from "../../db/mongo.db";
import {ObjectId, SortDirection} from "mongodb";
import {CommentType} from "../../types/types";

export const repositoryComments = {
    async createComment(newComment: CommentType) {
        const result = await commentsCollection.insertOne(newComment)
        return result
    },
    updateComment: async ({id, newContent}: { id: string, newContent: string }) => {
        const result = await commentsCollection.updateOne({_id: new ObjectId(id)}, {$set: {content: newContent}});
        return result;
    },
    deleteComment: async (id: string) => {
        const result = await commentsCollection.deleteOne({_id: new ObjectId(id)})
        return result
    },
    getCommentsById: async (id: string) => {
        const comment = await commentsCollection.findOne({_id: new ObjectId(id)})
        return comment
    },
    getCommentsByPostId: async (
        {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            postId
        }
    ) => {
        const filter: any = postId ? {postId: {$regex: postId}} : {}
        return await commentsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    async getCommentsCountByPostId (postId: string) {
        const filter: any = postId ? {postId: {$regex: postId}} : {}
        return await commentsCollection.countDocuments(filter)
    }

}
