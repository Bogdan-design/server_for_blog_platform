import {ObjectId, SortDirection} from "mongodb";
import {postCollection} from "../../db/mongo.db";
import {PostType} from "../../types/types";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";

export const repositoryPosts = {
    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        blogId?: string,
    ) {
        const filter: any = blogId ? {blogId: {$regex: blogId}} : {}

        return await postCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    async getPostCount(blogId?: string) {
        const filter: any = blogId ? {blogId: {$regex: blogId}} : {}
        return await postCollection.countDocuments(filter)
    },
    async createPost(newPost: PostType) {
        return await postCollection.insertOne(newPost)
    },
    async findPostByPostId(postId: string) {
        return await postCollection.findOne({_id: new ObjectId(postId)})
    },
    async updatePost(postId: string, newBodyPost: UpdatePostModel) {
        return await postCollection.updateOne(
            {_id: new ObjectId(postId)},
            {$set: {...newBodyPost}},
        )
    },
    async deletePost(postId: string) {
        return await postCollection.deleteOne({_id: new ObjectId(postId)})
    }
}