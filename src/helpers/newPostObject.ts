import {BlogType, PostType, RequestWithBody} from "../types/types";
import {CreatePostByBlogIdParamsModel} from "../features/blogs/models/CreatePostByBlogIdParamsModel";

export const newPostObject = (req: RequestWithBody<CreatePostByBlogIdParamsModel>, blogId: string, blogForNewPost: BlogType) => {
    const newPost: PostType = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blogId,
        blogName: blogForNewPost.name,
        createdAt: new Date().toISOString(),
        extendedLikesInfo:{
            likesCount:0,
            dislikesCount:0
        }

    }
    return newPost
}