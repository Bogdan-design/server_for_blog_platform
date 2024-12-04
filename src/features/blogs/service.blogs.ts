import {SortDirection} from "mongodb";
import {blogsRepository} from "./repository.blogs";
import {BlogType} from "../../types/types";
import {UpdateBlogModel} from "../../features/blogs/models/UpdateBlogModel";

export const serviceBlogs = {
    getBlogs: async (
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        searchNameTerm: string
    ) => {

        const blogs = await blogsRepository.getBlogs(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        )

        const blogsCount = await blogsRepository.getBlogsCount(
            searchNameTerm
        )

        console.log(blogs)
        console.log(blogsCount)

        return {
            pageCount: Math.ceil(blogsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: blogsCount,
            sortDirection,
            items: blogs
        }
    },
    createBlog: async (newBlogModel: BlogType) => {

        const result = await blogsRepository.createBlog(newBlogModel)

        const newBlog = await blogsRepository.findOneBlog(result)

        return {result, newBlog}
    },
    findBlog: async (blogId: string) => {
        return await blogsRepository.findBlogById(blogId)
    },
    updateBlog: async (blogId: string, newBody: UpdateBlogModel) => {
        return await blogsRepository.updateBlog(blogId,newBody)
    },
    deleteBlog: async (blogId: string) => {
        return await blogsRepository.deleteBlog(blogId)
    }
}