import {SortDirection} from "mongodb";
import {PostsRepository} from "../../features/posts/postsRepository";
import {LikeStatusEnum, CommentType, PostType, LikeForPostType} from "../../types/types";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";
import {CommentsRepository} from "../../features/comments/commentsRepository";
import {UsersRepository} from "../../features/users/usersRepository";

export class PostsService {
    postsRepository: PostsRepository
    usersRepository: UsersRepository
    commentsRepository: CommentsRepository

    constructor() {
        this.postsRepository = new PostsRepository()
        this.usersRepository = new UsersRepository()
        this.commentsRepository = new CommentsRepository()
    }

    async createLikeEntity({userId, postId, login, likeStatus}: {
        userId: string,
        postId: string,
        login: string,
        likeStatus: LikeStatusEnum
    }) {
        const newLikeForPost: LikeForPostType = {
            addedAt: new Date().toISOString(),
            status: likeStatus,
            login,
            postId,
            userId
        }
        const result = await this.postsRepository.createLikeForPost(newLikeForPost)
        return result
    }


    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        blogId?: string,
    ) {
        const posts = await this.postsRepository.getPosts(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            blogId
        );

        const postsCount = await this.postsRepository.getPostCount(blogId)

        return {
            pageCount: Math.ceil(postsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postsCount,
            sortDirection,
            items: posts
        }
    }

    async createPost(newPost: PostType) {
        const result = await this.postsRepository.createPost(newPost)
        return result
    }

    async updatePost(postId: string, newBodyPost: UpdatePostModel) {
        return this.postsRepository.updatePost(postId, newBodyPost)
    }

    async deletePost(postId: string) {
        return this.postsRepository.deletePost(postId)
    }

    async createComment({postId, content, userId}: { postId: string, content: string, userId: string }) {


        const userFromDB = await this.usersRepository.getUserById(userId.toString())

        const newComment: CommentType = {
            postId,
            content,
            commentatorInfo: {
                userId: userId.toString(),
                userLogin: userFromDB.accountData.login
            },
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
            }
        }

        const result = await this.commentsRepository.createComment(newComment)

        let comment: Omit<CommentType, "postId"> & { likesInfo: { myStatus: LikeStatusEnum } }
        if (result[0]) {
            const commentFromDB = await this.commentsRepository.getCommentsById(result[0]._id.toString())
            comment = {
                id: commentFromDB._id.toString(),
                content: commentFromDB.content,
                commentatorInfo: {
                    userId: commentFromDB.commentatorInfo.userId,
                    userLogin: commentFromDB.commentatorInfo.userLogin
                },
                createdAt: commentFromDB.createdAt,
                likesInfo: {
                    likesCount: commentFromDB.likesInfo.likesCount,
                    dislikesCount: commentFromDB.likesInfo.dislikesCount,
                    myStatus: LikeStatusEnum.NONE
                }
            }


            return {
                result,
                comment
            }

        }
    }
}