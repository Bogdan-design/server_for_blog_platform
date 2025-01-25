import {ObjectId} from "mongodb";
import {CommentType} from "../../types/types";
import {CommentsModel} from "../../db/mongo.db";

export class CommentsRepository {
    async createComment(newComment: CommentType) {
        const result = await CommentsModel.insertMany([newComment])
        return result
    }
    async updateComment ({id, newContent}: { id: string, newContent: string }) {
        const result = await CommentsModel.updateOne({_id: new ObjectId(id)}, {$set: {content: newContent}});
        return result;
    }
    async deleteComment  (id: string) {
        const result = await CommentsModel.deleteOne({_id: new ObjectId(id)})
        return result
    }
    async getCommentsById  (id: string) {
        const comment = await CommentsModel.findOne({_id: new ObjectId(id)})

        return comment
    }
    async getCommentsByPostId  (
        {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            postId
        }
    )  {
        const filter: any = postId ? {postId: {$regex: postId}} : {}
        return CommentsModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean()
    }
    async getCommentsCountByPostId (postId: string) {
        const filter: any = postId ? {postId: {$regex: postId}} : {}
        return CommentsModel.countDocuments(filter)
    }
    async updateLikeStatusForComment({commentId, userId, likeStatus}: { commentId: string, userId: string, likeStatus: string }) {
        const result = await CommentsModel.updateOne({_id: new ObjectId(commentId)}, {
            $set: {
                "likeInfo.likesCount": likeStatus === 'like' ? 1 : 0,
                "likeInfo.dislikesCount": likeStatus === 'dislike' ? 1 : 0,
                "likeInfo.myStatus": likeStatus
            }
        })
        return result
    }

}
