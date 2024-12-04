import {SortDirection} from "mongodb";
import {repositoryPosts} from "./repository.posts";
import {PostType} from "../../types/types";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";

export const servicePosts = {
    getPosts: async (
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: SortDirection,
    ) => {
        const posts = await repositoryPosts.getPosts(
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        );

        const postsCount = await repositoryPosts.getPostCount()

        return {
            pageCount: Math.ceil(postsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postsCount,
            sortDirection,
            items: posts
        }
    },
    createPost: async (newPost: PostType) => {
        const result = await repositoryPosts.createPost(newPost)
        const createdNewPost = await repositoryPosts.findPostByPostId(result.insertedId.toString())
        return {
            result,
            createdNewPost
        }
    },
    updatePost: async (postId:string,newBodyPost:UpdatePostModel)=>{
        return await repositoryPosts.updatePost(postId,newBodyPost)
    },
    deletePost: async (postId:string) => {
        return await repositoryPosts.deletePost(postId)
    }
}