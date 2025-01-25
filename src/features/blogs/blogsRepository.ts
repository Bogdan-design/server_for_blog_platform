import {InsertOneResult, ObjectId, SortDirection} from "mongodb";
import {BlogModel} from "../../db/mongo.db";
import {BlogType} from "../../types/types";
import {UpdateBlogModel} from "../../features/blogs/models/UpdateBlogModel";

export class BlogsRepository {
    async getBlogs (
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        searchNameTerm: string | null
    )  {

        const filter: any = {}
        if (searchNameTerm !== null) {
            filter.name = {$regex: searchNameTerm, $options: 'i'};
        }
        return BlogModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize).lean()
    }
    async getBlogsCount  (searchNameTerm: string){
        const filter: any = {};
        if (searchNameTerm !== null) {
            filter.name = {$regex: searchNameTerm, $options: "i"};
        }
        return BlogModel.countDocuments(filter)
    }
    async createBlog  (newBlogModel:BlogType)  {
        return  BlogModel.insertMany([newBlogModel])
    }
    // async findOneBlog (result:InsertOneResult<BlogType>)  {
    //     return BlogModel.findOne({_id: result.insertedId})
    // },
    async findBlogById  (blogId:string) {
        return BlogModel.findOne({_id: new ObjectId(blogId)})
    }
    async updateBlog (blogId:string,newBody:UpdateBlogModel)  {
        return BlogModel.updateOne({_id: new ObjectId(blogId)}, {$set: {...newBody}});
    }
    async deleteBlog (blogId:string) {
        return BlogModel.deleteOne({_id: new ObjectId(blogId)});
    }

}