import {InsertOneResult, ObjectId, SortDirection} from "mongodb";
import {blogCollection} from "../../db/mongo.db";
import {BlogType} from "../../types/types";
import {UpdateBlogModel} from "../../features/blogs/models/UpdateBlogModel";

export const blogsRepository = {
    getBlogs: async (
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        searchNameTerm: string | null
    ) => {

        const filter: any = {}
        if (searchNameTerm !== null) {
            filter.name = {$regex: searchNameTerm, $options: 'i'};
        }
        return await blogCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray()
    },
    getBlogsCount: async (searchNameTerm: string) => {
        const filter: any = {};
        if (searchNameTerm !== null) {
            filter.name = {$regex: searchNameTerm, $options: "i"};
        }

        return await blogCollection
            .countDocuments(filter)
    },
    createBlog: async (newBlogModel:BlogType) => {
        return await blogCollection.insertOne(newBlogModel)
    },
    findOneBlog: async (result:InsertOneResult<BlogType>) => {
        return await blogCollection.findOne({_id: result.insertedId})
    },
    findBlogById: async (blogId:string) => {
        return await blogCollection.findOne({_id: new ObjectId(blogId)})
    },
    updateBlog: async (blogId:string,newBody:UpdateBlogModel) => {
        return await blogCollection.updateOne({_id: new ObjectId(blogId)}, {$set: {...newBody}});
    },
    deleteBlog: async (blogId:string) => {
        return await blogCollection.deleteOne({_id: new ObjectId(blogId)});
    }

}