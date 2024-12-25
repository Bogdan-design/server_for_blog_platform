import {SortDirection} from "mongodb";
import {repositoryPosts} from "./repository.posts";
import {CommentType, PostType} from "../../types/types";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";
import {repositoryUsers} from "../../features/users/repository.users";
import {repositoryComments} from "../../features/comments/repository.comments";

export const servicePosts = {
    async getPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        blogId?: string,
    ) {
        const posts = await repositoryPosts.getPosts(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            blogId
        );

        const postsCount = await repositoryPosts.getPostCount(blogId)

        return {
            pageCount: Math.ceil(postsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postsCount,
            sortDirection,
            items: posts
        }
    },
    async createPost(newPost: PostType) {
        const result = await repositoryPosts.createPost(newPost)
        const createdNewPost = await repositoryPosts.findPostByPostId(result.insertedId.toString())
        return {
            result,
            createdNewPost
        }
    },
    async updatePost(postId: string, newBodyPost: UpdatePostModel) {
        return await repositoryPosts.updatePost(postId, newBodyPost)
    },
    async deletePost(postId: string) {
        return await repositoryPosts.deletePost(postId)
    },
    async createComment({postId, content, userId}: {postId: string, content: string, userId: string}) {


        const userFromDB = await repositoryUsers.getUserById(userId.toString())

        const newComment:CommentType  = {
            postId,
            content,
            commentatorInfo:{
                userId:userId.toString(),
                userLogin:userFromDB.accountData.login
            },
            createdAt:new Date().toISOString(),
        }

        const result = await repositoryComments.createComment(newComment)

        let comment: Omit<CommentType,"postId">
        if(result.acknowledged){
            const commentFromDB = await repositoryComments.getCommentsById(result.insertedId.toString())
            comment = {
                id:commentFromDB._id.toString(),
                content:commentFromDB.content,
                commentatorInfo:{
                    userId:commentFromDB.commentatorInfo.userId,
                    userLogin:commentFromDB.commentatorInfo.userLogin
                },
                createdAt:commentFromDB.createdAt,
            }
        }



        return {
            result,
            comment
        }

    }
}