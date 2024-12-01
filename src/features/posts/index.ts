import {Response, Router} from "express";
import {ObjectId, WithId} from "mongodb";
import {Result, ValidationError} from "express-validator";
import {errorsMiddleware, idValidation, postInputValidationBodyMiddleware} from '../../middlewares/errorsMiddleware';
import {HTTP_STATUSES} from "../../status.code";
import {db} from "../../db/db";
import {BlogType, PostType, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types/types";
import {CreatePostModel} from "../../features/posts/models/CreatePostModel";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {PostParamsType} from "../../features/posts/models/URIParamsPostIdModels";
import {UpdatePostModel} from "../../features/posts/models/UpdatePostModel";
import {blogCollection, postCollection} from "../../db/mongo.db";


export const postsRouter = Router()


const getPostViewModel = (dbPost: WithId<PostType>): PostType => {

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

    getPosts: async (req: any, res: Response<PostType[] | { error: string }>) => {

        try {

            const posts = await postCollection.find({}).toArray()
            res
                .status(HTTP_STATUSES.OK_200)
                .json(posts.map(getPostViewModel))
            return

        } catch (e) {
            console.error("Error fetching posts:", e);
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
            return;
        }

    },

    createPost: async (req: RequestWithBody<CreatePostModel>, res: Response<PostType | { error: string }>) => {
        try {
            const blogId = req.body.blogId;

            if (!ObjectId.isValid(blogId)) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Invalid blog ID"});
                return
            }

            const blogForNewPost = await blogCollection.findOne<WithId<BlogType>>({_id: new ObjectId(blogId)})
            if (!blogForNewPost) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Cannot find blog"})
                return;
            }
            const newPost: PostType = {
                title: req.body.title,
                shortDescription: req.body.shortDescription,
                content: req.body.content,
                blogId: blogId,
                blogName: blogForNewPost.name,
                createdAt: new Date().toISOString()

            }

            const result = await postCollection.insertOne(newPost)
            if (!result.insertedId) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: 'Cannot create Post'})
                return
            }

            const createdNewPost = await postCollection.findOne<WithId<PostType>>({_id: result.insertedId})
            if (!createdNewPost) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: 'Cannot find Post'})
                return
            }


            res
                .status(HTTP_STATUSES.CREATED_201)
                .json(getPostViewModel(createdNewPost));
            return

        } catch (e) {
            console.error("Error creating post:", e);
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
            return

        }

    },


    findPost: async (req: RequestWithParams<PostParamsType>, res: Response<PostType | { error: string }>) => {
        try {

            const postId = req.params.id;
            if (!ObjectId.isValid(postId)) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({ error: "Invalid post ID" });
                return;
            }

            const findPostsById = await postCollection.findOne({_id: new ObjectId(postId)})


            if (!findPostsById ) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({ error: "Post not found" })
                return
            }

            res
                .status(HTTP_STATUSES.OK_200)
                .json(getPostViewModel(findPostsById));
            return

        } catch (e) {
            console.error("Error finding post:", e);
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
            return

        }


    },

    updatePost:
        async (req: RequestWithParamsAndBody<PostParamsType, UpdatePostModel>, res: any) => {
            try {
                const postId = req.params.id;

                const foundPost = await postCollection.updateOne(
                    {_id: new ObjectId(postId)},
                    {$set: {...req.body}},
                )
                if (foundPost.matchedCount===0) {
                    res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Cannot find post with that id"})
                }

                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
                return

            } catch (e) {
                console.error("Error updating post:", e);
                res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
                return
            }


        },

    deletePost:
        async (req: RequestWithParams<PostParamsType>, res: any) => {
            try {
                const postId = req.params.id;
              const resDelete =  await postCollection.deleteOne({_id: new ObjectId(postId)});
                if(resDelete.deletedCount === 0) {
                    res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Dont founded post"})
                    return
                }
                res
                    .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
                    return

            } catch (e) {
                console.error("Error deleting post:", e);
                res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
                return
            }
        },

}

postsRouter
    .get('/', errorsMiddleware, postsController.getPosts);
postsRouter
    .post('/', authMiddleware, postInputValidationBodyMiddleware, postsController.createPost);
postsRouter
    .get('/:id', idValidation, errorsMiddleware, postsController.findPost);
postsRouter
    .put('/:id', authMiddleware, idValidation, postInputValidationBodyMiddleware, postsController.updatePost);
postsRouter
    .delete('/:id', authMiddleware, idValidation, postsController.deletePost);