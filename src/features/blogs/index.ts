import {Response, Router} from "express";
import {blogInputValidationBodyMiddleware, errorsMiddleware, idValidation} from '../../middlewares/errorsMiddleware';
import {HTTP_STATUSES} from "../../status.code";
import {BlogType, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types/types";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {CreateBlogModel} from "../../features/blogs/models/CreateBlogModel";
import {BlogParamsType} from "../../features/blogs/models/URIParamsBlogIdModels";
import {UpdateBlogModel} from "../../features/blogs/models/UpdateBlogModel";
import {blogCollection} from "../../db/mongo.db";
import {ObjectId, WithId} from "mongodb";

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

    getBlogs: async (_: any, res: Response<BlogType[] | { error: string }>) => {
        try {
            const blogs = await blogCollection.find({}).toArray();

            res
                .status(HTTP_STATUSES.OK_200)
                .json(blogs.map(getBlogViewModel))
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

            const result = await blogCollection.insertOne(newBlogModel)
            if(!result.insertedId) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }
            const newBlog = await blogCollection.findOne({_id: result.insertedId})
            if(!newBlog) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            res
                .status(HTTP_STATUSES.CREATED_201)
                .json(getBlogViewModel(newBlog));
            return

        } catch (e) {
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
            return
        }
    },
    findBlog: async (req: RequestWithParams<BlogParamsType>, res: Response<BlogType | { error: string }>) => {
        try {
            const blogId = req.params.id;
            if (!blogId) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Bad Request"})
                return
            }
            const findBlogById = await blogCollection.findOne({_id: new ObjectId(blogId)})

            if (!findBlogById) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: 'Blog didnt find'})
                return
            }
            res
                .status(HTTP_STATUSES.OK_200)
                .json(getBlogViewModel(findBlogById));
            return
        } catch (e) {
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
            return
        }

    },

    updateBlog: async (req: RequestWithParamsAndBody<BlogParamsType, UpdateBlogModel>, res: Response<BlogType | {
        error: string
    }>) => {

        try {
            const blogId = req.params.id;
            if (!blogId) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Bad Request"})
                return
            }
             const resUpdate = await blogCollection.updateOne({_id: new ObjectId(blogId)}, {$set: {...req.body}});
            if(resUpdate.matchedCount === 0) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Bad Request"})
                return
            }
            res
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
            return
        }

    },

    deleteBlog: async (req: RequestWithParams<BlogParamsType>, res: any) => {

        try {
            const blogId = req.params.id;
           const resDelete =  await blogCollection.deleteOne({_id: new ObjectId(blogId)});
            if(resDelete.deletedCount === 0) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json({error: "Dont founded blog"})
                return
            }
            res
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } catch (e) {

            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error: "Internal Server Error" });
            return
        }

    }

}

blogsRouter.get('/', errorsMiddleware, blogsController.getBlogs);
blogsRouter.post('/', authMiddleware, blogInputValidationBodyMiddleware, blogsController.createBlog);
blogsRouter.get('/:id', idValidation, errorsMiddleware, blogsController.findBlog);
blogsRouter.put('/:id', authMiddleware, idValidation, blogInputValidationBodyMiddleware, blogsController.updateBlog);
blogsRouter.delete('/:id', authMiddleware, idValidation, blogsController.deleteBlog);