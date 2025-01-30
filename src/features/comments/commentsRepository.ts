import {ObjectId, WithId} from "mongodb";
import {CommentType, LikeForCommentType,LikeStatusEnum} from "../../types/types";
import {CommentsModel, LikesModel} from "../../db/mongo.db";

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
    async saveLike(newLike: LikeForCommentType) {
        return LikesModel.insertMany([newLike])
    }
    async getPreviousLike(userId: string, commentId: string) {
        return LikesModel.findOne({authorId: userId, commentId: commentId})
    }
    async getAllLikes(){
        return LikesModel.find().lean()
    }
    async updateLikeStatusForComment(comment: any) {

        comment.save()
        return comment
    }
    async deleteLike(userId: string, likeId: string) {
        return LikesModel.deleteOne({authorId: userId, _id: new ObjectId(likeId)})
    }

}
