import {SortDirection} from "mongodb";
import {repositoryPosts} from "./repository.posts";
import {PostType} from "../../types/types";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";

export const servicePosts = {
    async getPosts (
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
        blogId?:string,
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
    async createPost (newPost: PostType)  {
        const result = await repositoryPosts.createPost(newPost)
        const createdNewPost = await repositoryPosts.findPostByPostId(result.insertedId.toString())
        return {
            result,
            createdNewPost
        }
    },
    async updatePost (postId:string,newBodyPost:UpdatePostModel){
        return await repositoryPosts.updatePost(postId,newBodyPost)
    },
    async deletePost  (postId:string)  {
        return await repositoryPosts.deletePost(postId)
    }
}