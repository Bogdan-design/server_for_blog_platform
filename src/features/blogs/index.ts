import {Response, Router} from "express";
import {
    blogIdParamsValidation,
    blogInputValidationBodyMiddleware,
    errorsMiddleware,
    idValidation, postInputValidationBodyMiddleware
} from '../../middlewares/errorsMiddleware';
import {HTTP_STATUSES} from "../../status.code";
import {
    blogsFromDB,
    BlogType,
    postsFromDB,
    PostType,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery
} from "../../types/types";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {CreateBlogModel} from "../../features/blogs/models/CreateBlogModel";
import {BlogParamsType} from "../../features/blogs/models/URIParamsBlogIdModels";
import {UpdateBlogModel} from "../../features/blogs/models/UpdateBlogModel";
import {WithId} from "mongodb";
import {serviceBlogs} from "./service.blogs";
import {paginationQueries} from "../../helpers/paginationQuereis";
import {servicePosts} from "../../features/posts/service.posts";
import {QueryPostModel} from "../../features/posts/models/QueryPostModels";
import {getPostViewModel, postsController} from "../../features/posts";
import {newPostObject} from "../../helpers/newPostObject";
import {CreatePostByBlogIdParamsModel} from "../../features/blogs/models/CreatePostByBlogIdParamsModel";
import {CreatePostModel} from "../../features/posts/models/CreatePostModel";

export const blogsRouter = Router()


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
    //RequestWithQuery<QueryBlogModel>

    getBlogs: async (req: any, res: Response<blogsFromDB | { error: string }>): Promise<void> => {
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
                res.status(404).json({'error': 'Blog not found'})
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

    createBlog: async (req: RequestWithBody<CreateBlogModel>, res: Response<BlogType | { error: string }>) => {


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
    findAllPostsForBlog: async (req: RequestWithParamsAndQuery<{blogId:string},QueryPostModel>, res: Response<postsFromDB | {error: string}>) => {
        try {
        const blogId = req.params.blogId

            const {
                pageSize,
                sortBy,
                pageNumber,
                sortDirection,
            } = paginationQueries(req)


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

    findBlog: async (req: RequestWithParams<BlogParamsType>, res: Response<BlogType | { error: string }>) => {
        try {
            const blogId = req.params.id;
            if (!blogId) {
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

    updateBlog: async (req: RequestWithParamsAndBody<BlogParamsType, UpdateBlogModel>, res: Response<BlogType | {
        error: string
    }>) => {

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

    deleteBlog: async (req: RequestWithParams<BlogParamsType>, res: any) => {

        try {
            const blogId = req.params.id;
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

blogsRouter.get('/', errorsMiddleware, blogsController.getBlogs);
blogsRouter.post('/', authMiddleware, blogInputValidationBodyMiddleware, blogsController.createBlog);
blogsRouter.get('/:blogId/posts', blogIdParamsValidation, errorsMiddleware, blogsController.findAllPostsForBlog);
blogsRouter.post('/:blogId/posts',authMiddleware,blogIdParamsValidation, postInputValidationBodyMiddleware, postsController.createPost);
blogsRouter.get('/:id', idValidation, errorsMiddleware, blogsController.findBlog);
blogsRouter.put('/:id', authMiddleware, idValidation, blogInputValidationBodyMiddleware, blogsController.updateBlog);
blogsRouter.delete('/:id', authMiddleware, idValidation, blogsController.deleteBlog);