import {Response} from "express";
import {ObjectId, WithId} from "mongodb";
import {HTTP_STATUSES} from "../../status.code";
import {
    ExpectedErrorObjectType,
    LikeStatusEnum,
    NewestLikeType,
    ObjectModelFromDB,
    PostType,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    UserDBType,
    UserType
} from "../../types/types";
import {PostParamsType} from "../../features/posts/models/URIParamsPostIdModels";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";
import {paginationQueries, QueryModel} from "../../helpers/paginationQuereis";
import {newPostObject} from "../../helpers/newPostObject";
import {CreatePostByBlogIdParamsModel} from "../../features/blogs/models/CreatePostByBlogIdParamsModel";
import {CommentsService} from "../../features/comments/commentsService";
import {paginationQueryForQueries} from "../../helpers/paginationQuereisFroComments";
import {PostsService} from "./postsService";
import {PostsRepository} from "./postsRepository";
import {BlogsService} from "../../features/blogs/blogsService";
import {mappingAllPosts} from "./utils/mappingAllPosts";
import {getPostViewModel} from "./utils/getPostViewModel";


export class PostsController {

    postsService: PostsService
    postsRepository: PostsRepository
    blogsService: BlogsService
    commentsService: CommentsService

    constructor() {
        this.postsService = new PostsService()
        this.postsRepository = new PostsRepository()
        this.blogsService = new BlogsService()
        this.commentsService = new CommentsService()
    }

    async createLikesForPost(req: RequestWithParamsAndBody<{ postId: string }, {
        likeStatus: LikeStatusEnum
    }> & { user: WithId<UserDBType> }, res: Response<any>) {

        try {
            const postId = req.params.postId
            const user = req.user
            const likeStatus = req.body.likeStatus
            if (!postId) {
                res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                return
            }


            const post = await this.postsRepository.findPostByPostId(postId)

            if (!post) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            const result = await this.postsService.createLikeEntity({
                userId: user._id.toString(),
                postId,
                likeStatus,
                login: user.accountData.login
            })
            if (!result) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            console.log(`create like error ${e}`)
            res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            return
        }

    }

    async getPosts(req: any, res: Response<ObjectModelFromDB<PostType> | { error: string }>) {
        try {

            const userId = req.userId
            const {
                pageSize,
                sortBy,
                pageNumber,
                sortDirection,
            } = paginationQueries(req)

            const postsFromDB = await this.postsService.getPosts(
                pageNumber,
                pageSize,
                sortBy,
                sortDirection
            )

            const likes = await this.postsRepository.findAllLikesForPost()





            res
                .status(HTTP_STATUSES.OK_200)
                .json({
                    pagesCount: postsFromDB.pagesCount,
                    page: postsFromDB.page,
                    pageSize: postsFromDB.pageSize,
                    totalCount: postsFromDB.totalCount,
                    items: postsFromDB.items.map((
                        item)=>mappingAllPosts(item,likes,postsFromDB,userId))
                })


            return

        } catch (e) {
            console.error("Error fetching posts:", e);
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({error: "Internal Server Error"});
            return;
        }

    }

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
                        errorsMessages: [
                            {
                                field: 'blogId',
                                message: 'Wrong blogId'
                            }
                        ]
                    });
                return
            }

            const blogForNewPost = await this.blogsService.findBlog(blogId)
            if (!blogForNewPost) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Cannot find blog"})
                return;
            }
            const newPost = newPostObject(req, blogId, blogForNewPost)

            const result = await this.postsService.createPost(newPost)

            if (!result[0]) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: 'Cannot create Post'})
                return
            }


            res
                .status(HTTP_STATUSES.CREATED_201)
                .json(getPostViewModel(result[0]));
            return

        } catch (e) {
            console.error("Error creating post:", e);
            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json({error: "Internal Server Error"});
            return

        }

    }


    async findPost(req: RequestWithParams<PostParamsType> & { userId: ObjectId }, res: Response<PostType | {
        error: string
    }>) {
        try {
            const postId = req.params.id;
            const userId = req.userId

            let myStatus: LikeStatusEnum = LikeStatusEnum.NONE
            if (userId) {
                const like = await this.postsRepository.getPreviousLike(userId.toString(), postId)
                myStatus = like ? like.status : LikeStatusEnum.NONE
            }

            if (!ObjectId.isValid(postId)) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Invalid post ID"});
                return;
            }

            const post = await this.postsRepository.findPostByPostId(postId)

            const likes = await this.postsRepository.findAllLikesForPost(postId)



            if (!post) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Post not found"})
                return
            }

            res
                .status(HTTP_STATUSES.OK_200)
                .json(getPostViewModel(post,myStatus, likes));
            return

        } catch (e) {
            console.error("Error finding post:", e);

            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json({error: "Internal Server Error"});
            return

        }


    }

    async updatePost(req: RequestWithParamsAndBody<PostParamsType, UpdatePostModel>, res: any) {
        try {
            const postId = req.params.id;

            const foundPost = await this.postsService.updatePost(postId, req.body);
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


    }

    async deletePost(req: RequestWithParams<PostParamsType>, res: Response<ExpectedErrorObjectType | {
        error: string
    }>): Promise<void> {
        try {
            const postId = req.params.id

            if (!ObjectId.isValid(postId)) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Invalid post ID"})
                return
            }

            const resDelete = await this.postsService.deletePost(postId)

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
    }

    async createComment(req: RequestWithParamsAndBody<{ postId: string }, { content: string }> & {
        user: WithId<UserType>
    }, res: Response<any>) {
        try {
            const userId = req.user._id.toString();

            const id = req.params.postId;

            const findPostById = await this.postsRepository.findPostByPostId(id)
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

            const {comment, result} = await this.postsService.createComment({
                postId: id,
                content: req.body.content,
                userId
            });

            if (!result[0]) {
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
    }

    async getCommentsByPostId(req: RequestWithParamsAndQuery<{ postId: string }, QueryModel>, res: Response<any>) {

        try {
            const postId = req.params.postId;
            if (!postId || !ObjectId.isValid(postId)) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Cannot find post with that id"})
                return
            }
            const result = await this.postsRepository.findPostByPostId(postId);
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

            const getComments = await this.commentsService.getCommentsByPostId({
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

