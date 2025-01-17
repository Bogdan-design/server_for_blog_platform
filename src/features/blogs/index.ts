import {
    blogInputValidationBodyMiddleware,
    errorsMiddleware, idValidation,
    postInputValidationBodyMiddleware
} from "../../middlewares/errorsMiddleware";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {postsController} from "../../features/posts/postsController";
import {Router} from "express";
import {blogsController} from "./blogsController";

export const blogsRouter = Router()

blogsRouter.get('/', errorsMiddleware, blogsController.getBlogs);
blogsRouter.post('/', authMiddleware, blogInputValidationBodyMiddleware, blogsController.createBlog);
blogsRouter.get('/:blogId/posts', errorsMiddleware, blogsController.findAllPostsForBlog);
blogsRouter.post('/:blogId/posts',authMiddleware,postInputValidationBodyMiddleware, postsController.createPost);
blogsRouter.get('/:id', idValidation, errorsMiddleware, blogsController.findBlog);
blogsRouter.put('/:id', authMiddleware, idValidation, blogInputValidationBodyMiddleware, blogsController.updateBlog);
blogsRouter.delete('/:id', authMiddleware, idValidation, blogsController.deleteBlog);