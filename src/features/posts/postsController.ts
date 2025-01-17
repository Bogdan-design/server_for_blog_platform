import {Response, Router} from "express";
import {ObjectId, WithId} from "mongodb";
import {HTTP_STATUSES} from "../../status.code";
import {
    ExpectedErrorObjectType,
    ObjectModelFromDB,
    PostType,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    UserType
} from "../../types/types";
import {PostParamsType} from "../../features/posts/models/URIParamsPostIdModels";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";
import {paginationQueries, QueryModel} from "../../helpers/paginationQuereis";
import {servicePosts} from "./service.posts";
import {serviceBlogs} from "../../features/blogs/service.blogs";
import {repositoryPosts} from "../../features/posts/repository.posts";
import {newPostObject} from "../../helpers/newPostObject";
import {CreatePostByBlogIdParamsModel} from "../../features/blogs/models/CreatePostByBlogIdParamsModel";
import {serviceComments} from "../../features/comments/service.comments";
import {paginationQueryForQueries} from "../../helpers/paginationQuereisFroComments";





export const getPostViewModel = (dbPost: WithId<PostType>): PostType => {

    return {
        id: dbPost._id.toString(),
        title: dbPost.title,
        shortDescription: dbPost.shortDescription,
        content: dbPost.content,
        blogId: dbPost.blogId,
        blogName: dbPost.blogName,
        createdAt: dbPost.createdAt,
    }
}

export const postsController = {

    async getPosts(req: any, res: Response<ObjectModelFromDB<PostType> | { error: string }>) {

        try {
            const {
                pageSize,
                sortBy,
                pageNumber,
                sortDirection,
            } = paginationQueries(req)

            const postsFromDB = await servicePosts.getPosts(
                pageNumber,
                pageSize,
                sortBy,
                sortDirection
            )

            res
                .status(HTTP_STATUSES.OK_200)
                .json({
                    pagesCount: postsFromDB.pageCount,
                    page: postsFromDB.page,
                    pageSize: postsFromDB.pageSize,
                    totalCount: postsFromDB.totalCount,
                    items: postsFromDB.items.map(getPostViewModel)
                })


            return

        } catch (e) {
            console.error("Error fetching posts:", e);
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({error: "Internal Server Error"});
            return;
        }

    },

    async createPost(
        req: RequestWithParamsAndBody<{ blogId: string }, CreatePostByBlogIdParamsModel>,
        res: Response<PostType | ExpectedErrorObjectType | { error: string }>
    ) {
        try {
            const blogId = req.params.blogId || req.body.blogId;

            if (!blogId || typeof blogId !== "string" || !ObjectId.isValid(blogId)) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({
                        errorsMessages:[
                            {
                                field: 'blogId',
                                message: 'Wrong blogId'
                            }
                        ]
                    });
                return
            }

            const blogForNewPost = await serviceBlogs.findBlog(blogId)
            if (!blogForNewPost) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Cannot find blog"})
                return;
            }
            const newPost = newPostObject(req, blogId, blogForNewPost)

            const {result, createdNewPost} = await servicePosts.createPost(newPost,)

            if (!result.insertedId) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: 'Cannot create Post'})
                return
            }
            if (!createdNewPost) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: 'Cannot find Post'})
                return
            }


            res
                .status(HTTP_STATUSES.CREATED_201)
                .json(getPostViewModel(createdNewPost));
            return

        } catch (e) {
            console.error("Error creating post:", e);
            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json({error: "Internal Server Error"});
            return

        }

    },


    async findPost(req: RequestWithParams<PostParamsType>, res: Response<PostType | { error: string }>) {
        try {

            const postId = req.params.id;
            if (!ObjectId.isValid(postId)) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Invalid post ID"});
                return;
            }

            const findPostsById = await repositoryPosts.findPostByPostId(postId)


            if (!findPostsById) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Post not found"})
                return
            }

            res
                .status(HTTP_STATUSES.OK_200)
                .json(getPostViewModel(findPostsById));
            return

        } catch (e) {
            console.error("Error finding post:", e);
            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json({error: "Internal Server Error"});
            return

        }


    },

    async updatePost(req: RequestWithParamsAndBody<PostParamsType, UpdatePostModel>, res: any) {
        try {
            const postId = req.params.id;

            const foundPost = await servicePosts.updatePost(postId, req.body);
            if (foundPost.matchedCount === 0) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Cannot find post with that id"})
                return
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            console.error("Error updating post:", e);
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({error: "Internal Server Error"});
            return
        }


    },

    async deletePost(req: RequestWithParams<PostParamsType>, res: Response<ExpectedErrorObjectType | {error: string}>): Promise<void> {
        try {
            const postId = req.params.id

            if(!ObjectId.isValid(postId)){
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Invalid post ID"})
                return
            }

            const resDelete = await servicePosts.deletePost(postId)

            if (resDelete.deletedCount === 0) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Dont founded post"})
                return
            }
            res
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            console.error("Error deleting post:", e);
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({error: "Internal Server Error"});
            return
        }
    },

    async createComment(req: RequestWithParamsAndBody<{ postId: string }, { content: string }> & {
        user: WithId<UserType>
    }, res: Response<any>) {
        try {
            const userId = req.user._id.toString();

            const id = req.params.postId;

            const findPostById = await repositoryPosts.findPostByPostId(id)
            if (!findPostById) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Cannot find post with that id"})
                return
            }

            if (!ObjectId.isValid(id)) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Invalid post ID"})
                return;
            }

            const {comment, result} = await servicePosts.createComment({postId: id, content: req.body.content, userId});

            if (!result.acknowledged) {
                res
                    .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                    .json({error: "Internal Server Error"});
                return
            }

            res.status(HTTP_STATUSES.CREATED_201).json(comment);
            return

        } catch (e) {
            console.error("Error creating post:", e);
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }
    },
    async getCommentsByPostId(req: RequestWithParamsAndQuery<{ postId: string }, QueryModel>, res: Response<any>) {

        try {
            const postId = req.params.postId;
            if (!postId || !ObjectId.isValid(postId)) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Cannot find post with that id"})
                return
            }
            const result = await repositoryPosts.findPostByPostId(postId);
            if (!result) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Cannot find post with that id"})
                return
            }

            const {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection
            } = paginationQueryForQueries(req.query)

            const getComments = await serviceComments.getCommentsByPostId({
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                postId
            })

            res.status(HTTP_STATUSES.OK_200).json(getComments);
            return

        } catch (e) {
            console.error("Error deleting post:", e);
            res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Internal Server Error"});
            return
        }
    }

}

