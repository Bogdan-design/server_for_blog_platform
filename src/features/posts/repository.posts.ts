import {ObjectId, SortDirection} from "mongodb";
import {postCollection} from "../../db/mongo.db";
import {PostType} from "../../types/types";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";

export const repositoryPosts = {
    getPosts: async (
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
    ) => {
        const filter: any = {}

        return await postCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    getPostCount: async () => {
        return await postCollection.countDocuments()
    },
    createPost: async (newPost:PostType) => {
        return  await postCollection.insertOne(newPost)
    },
    findPostByPostId: async (postId:string) => {
        return await postCollection.findOne({_id:new ObjectId(postId)})
    },
    updatePost: async (postId:string,newBodyPost:UpdatePostModel) => {
        return await postCollection.updateOne(
            {_id: new ObjectId(postId)},
            {$set: {...newBodyPost}},
        )
    },
    deletePost: async (postId:string) => {
        return await postCollection.deleteOne({_id: new ObjectId(postId)})
    }
}