import {SortDirection} from "mongodb";
import {BlogType} from "../../types/types";
import {UpdateBlogModel} from "../../features/blogs/models/UpdateBlogModel";
import {BlogsRepository} from "./blogsRepository";

export class BlogsService {
    blogsRepository: BlogsRepository
    constructor() {
        this.blogsRepository = new BlogsRepository()
    }

    async getBlogs (
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        searchNameTerm: string
    ) {

        const blogs = await this.blogsRepository.getBlogs(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        )

        const blogsCount = await this.blogsRepository.getBlogsCount(
            searchNameTerm
        )


        return {
            pageCount: Math.ceil(blogsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: blogsCount,
            sortDirection,
            items: blogs
        }
    }
    async createBlog (newBlogModel: BlogType) {

        const newBlog = await this.blogsRepository.createBlog(newBlogModel)

        return newBlog
    }
    async findBlog  (blogId: string) {
        return this.blogsRepository.findBlogById(blogId)
    }
    async updateBlog (blogId: string, newBody: UpdateBlogModel)  {
        return this.blogsRepository.updateBlog(blogId,newBody)
    }
    async deleteBlog (blogId: string)  {
        return this.blogsRepository.deleteBlog(blogId)
    }
}