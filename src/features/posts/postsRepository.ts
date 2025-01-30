import {ObjectId, SortDirection} from "mongodb";
import {LikeForPostsModel, PostModel} from "../../db/mongo.db";
import {LikeForPostType, PostType} from "../../types/types";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";

export class PostsRepository {
    async createLikeForPost(like:LikeForPostType){
        return LikeForPostsModel.insertMany([like])
    }
    async getPreviousLike(userId: string, postId: string){
        return LikeForPostsModel.findOne({userId,postId})
    }
    async findAllLikesForPost(postId:string){
        return LikeForPostsModel.find({postId}).lean()
    }
    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        blogId?: string,
    ) {
        const filter: any = blogId ? {blogId: {$regex: blogId}} : {}

        return PostModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean()
    }
    async getPostCount(blogId?: string) {
        const filter: any = blogId ? {blogId: {$regex: blogId}} : {}
        return PostModel.countDocuments(filter)
    }
    async createPost(newPost: PostType) {
        return PostModel.insertMany([newPost])
    }
    async findPostByPostId(postId: string) {
        return PostModel.findOne({_id: new ObjectId(postId)})
    }
    async updatePost(postId: string, newBodyPost: UpdatePostModel) {
        return PostModel.updateOne(
            {_id: new ObjectId(postId)},
            {$set: {...newBodyPost}},
        )
    }
    async deletePost(postId: string) {
        return PostModel.deleteOne({_id: new ObjectId(postId)})
    }
}