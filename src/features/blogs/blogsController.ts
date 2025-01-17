import {Response} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {
    BlogType,
    ObjectModelFromDB,
    PostType,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody
} from "../../types/types";
import {CreateBlogModel} from "../../features/blogs/models/CreateBlogModel";
import {BlogParamsType} from "../../features/blogs/models/URIParamsBlogIdModels";
import {UpdateBlogModel} from "../../features/blogs/models/UpdateBlogModel";
import {ObjectId, WithId} from "mongodb";
import {serviceBlogs} from "./service.blogs";
import {paginationQueries} from "../../helpers/paginationQuereis";
import {servicePosts} from "../../features/posts/service.posts";
import {getPostViewModel} from "../../features/posts/postsController";


const getBlogViewModel = (dbBlog: WithId<BlogType>): BlogType => {
    return {
        id: dbBlog._id.toString(),
        name: dbBlog.name,
        description: dbBlog.description,
        websiteUrl: dbBlog.websiteUrl,
        createdAt: dbBlog.createdAt,
        isMembership: dbBlog.isMembership,
    }
}

export const blogsController = {

    async getBlogs  (req: any, res: Response<ObjectModelFromDB<BlogType> | { error: string }>): Promise<void>  {
        try {

            const {
                pageSize,
                sortBy,
                pageNumber,
                sortDirection,
                searchNameTerm
            } = paginationQueries(req)

            const blogsFromDB = await serviceBlogs.getBlogs(
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                searchNameTerm
            )
            if (!blogsFromDB) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({'error': 'Blog not found'})
                return
            }
            res
                .status(HTTP_STATUSES.OK_200)
                .json({
                    pagesCount: blogsFromDB.pageCount,
                    page: blogsFromDB.page,
                    pageSize: blogsFromDB.pageSize,
                    totalCount: blogsFromDB.totalCount,
                    items: blogsFromDB.items.map(getBlogViewModel)
                })
            return
        } catch (e) {

            res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
                error: "Bad Request"
            })
            return
        }


    },

    async createBlog (req: RequestWithBody<CreateBlogModel>, res: Response<BlogType | { error: string }>): Promise<void>  {


        try {

            const newBlogModel: BlogType = {
                name: req.body.name,
                description: req.body.description,
                websiteUrl: req.body.websiteUrl,
                createdAt: new Date().toISOString(),
                isMembership: false
            }


            const {result, newBlog} = await serviceBlogs.createBlog(newBlogModel)

            if (!result.insertedId) {
                res
                    .sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }
            if (!newBlog) {
                res
                    .sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            res
                .status(HTTP_STATUSES.CREATED_201)
                .json(getBlogViewModel(newBlog));
            return

        } catch (e) {
            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json({error: "Internal Server Error"});
            return
        }
    },
    async findAllPostsForBlog (req: any, res: Response<ObjectModelFromDB<PostType> | {error: string}>) {
        //RequestWithParamsAndQuery<{blogId:string},QueryPostModel>
        try {
        const blogId = req.params.blogId
            if (!blogId || typeof blogId !== "string" ||!ObjectId.isValid(blogId)) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Invalid blog ID"});
                return
            }

            const {
                pageSize,
                sortBy,
                pageNumber,
                sortDirection,
            } = paginationQueries(req)

            const foundBlog = await serviceBlogs.findBlog(blogId)
            if (!foundBlog) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({'error': 'Blog not found'})
                return
            }


            const foundAllPostsById = await servicePosts.getPosts(
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                blogId,
            )

            if (!foundAllPostsById) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: 'Blog not found'})
                return
            }
                res
                    .status(HTTP_STATUSES.OK_200)
                    .json({
                        pagesCount: foundAllPostsById.pageCount,
                        page: foundAllPostsById.page,
                        pageSize: foundAllPostsById.pageSize,
                        totalCount: foundAllPostsById.totalCount,
                        items: foundAllPostsById.items.map(getPostViewModel)
                    })


        } catch (e) {
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({error: "Internal Server Error"})
            return
        }
    },

    async findBlog (req: RequestWithParams<BlogParamsType>, res: Response<BlogType | { error: string }>):Promise<void> {
        try {
            const blogId = req.params.id;
            if (!blogId || !ObjectId.isValid(blogId)) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Bad Request"})
                return
            }
            const findBlogById = await serviceBlogs.findBlog(blogId)


            if (!findBlogById) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: 'Blog didnt find'})
                return
            }
            res
                .status(HTTP_STATUSES.OK_200)
                .json(getBlogViewModel(findBlogById));
            return

        } catch (e) {
            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json({error: "Internal Server Error"});
            return
        }

    },

    async updateBlog  (req: RequestWithParamsAndBody<BlogParamsType, UpdateBlogModel>, res: Response<BlogType | {
        error: string
    }>): Promise<void>  {

        try {
            const blogId = req.params.id;
            if (!blogId) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Bad Request"})
                return
            }

            const newBody: UpdateBlogModel = {
                name: req.body.name,
                description: req.body.description,
                websiteUrl: req.body.websiteUrl,
            }
            const resUpdate = await serviceBlogs.updateBlog(blogId, newBody);
            if (resUpdate.matchedCount === 0) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Bad Request"})
                return
            }
            res
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json({error: "Internal Server Error"});
            return
        }

    },

    async deleteBlog  (req: RequestWithParams<BlogParamsType>, res: any):Promise<void> {

        try {

            const blogId = req.params.id;
            if(!ObjectId.isValid(blogId)){
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Invalid blog ID"})
                return
            }

            const resDelete = await serviceBlogs.deleteBlog(blogId);

            if (resDelete.deletedCount === 0) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Dont founded blog"})
                return
            }
            res
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } catch (e) {

            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json({error: "Internal Server Error"});
            return
        }

    }

}

