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

        let post: PostType
        post = await this.postsRepository.findPostByPostId(postId)
        if (!post) return null


        const newLikeForPost: LikeForPostType = {
            addedAt: new Date().toISOString(),
            status: likeStatus,
            login,
            postId,
            userId
        }

        const likeByUser = await this.postsRepository.getPreviousLike(userId, postId)

        if (likeByUser) {
            if (likeByUser.status === likeStatus) {

                return post
            } else if (likeStatus === LikeStatusEnum.NONE) {

                await this.postsRepository.updateLikeStatus(likeByUser._id.toString(),likeStatus)

                if (likeByUser.status === LikeStatusEnum.lIKE) {
                    post.extendedLikesInfo.likesCount--;
                } else if (likeByUser.status === LikeStatusEnum.DISLIKE) {
                    post.extendedLikesInfo.dislikesCount--;
                }

                return await this.postsRepository.updateLikeForPost(post)

            } else {
                // await this.postsRepository.deleteLikeByUserId(userId)
                if (likeStatus === LikeStatusEnum.lIKE) {
                    post.extendedLikesInfo.likesCount++;
                    if(post.extendedLikesInfo.dislikesCount>0) {
                        post.extendedLikesInfo.dislikesCount--;
                    }
                } else if (likeStatus === LikeStatusEnum.DISLIKE) {
                    post.extendedLikesInfo.dislikesCount++;
                    if(post.extendedLikesInfo.likesCount>0) {
                        post.extendedLikesInfo.likesCount--;
                    }
                }

                await this.postsRepository.updateLikeStatus(likeByUser._id.toString(),likeStatus)
                // const like = await this.postsRepository.createLikeForPost(newLikeForPost)
                //
                // if (!like) return null

                return await this.postsRepository.updateLikeForPost(post)
            }
        } else {
            if (likeStatus === LikeStatusEnum.lIKE) {
                post.extendedLikesInfo.likesCount++;
            }
            if (likeStatus === LikeStatusEnum.DISLIKE) {
                post.extendedLikesInfo.dislikesCount++;
            }



            const like = await this.postsRepository.createLikeForPost(newLikeForPost)

            if (!like) return null
            return await this.postsRepository.updateLikeForPost(post)
        }


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
            pagesCount: Math.ceil(postsCount / pageSize),
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