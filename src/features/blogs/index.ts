import {
    blogInputValidationBodyMiddleware,
    errorsMiddleware, idValidation,
    postInputValidationBodyMiddleware
} from "../../middlewares/errorsMiddleware";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {PostsController} from "../../features/posts/postsController";
import {Router} from "express";
import {BlogsController} from "./blogsController";

export const blogsRouter = Router()

const blogsController = new BlogsController()
const postsController = new PostsController()

blogsRouter.get('/', errorsMiddleware, blogsController.getBlogs.bind(blogsController));
blogsRouter.post('/', authMiddleware, blogInputValidationBodyMiddleware, blogsController.createBlog.bind(blogsController));
blogsRouter.get('/:blogId/posts', errorsMiddleware, blogsController.findAllPostsForBlog.bind(blogsController));
blogsRouter.post('/:blogId/posts',authMiddleware,postInputValidationBodyMiddleware, postsController.createPost.bind(postsController));
blogsRouter.get('/:id', idValidation, errorsMiddleware, blogsController.findBlog.bind(blogsController));
blogsRouter.put('/:id', authMiddleware, idValidation, blogInputValidationBodyMiddleware, blogsController.updateBlog.bind(blogsController));
blogsRouter.delete('/:id', authMiddleware, idValidation, blogsController.deleteBlog.bind(blogsController));