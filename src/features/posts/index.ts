import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {
    blogIdValidation,
    errorsMiddleware, idValidation, postInputValidationBodyMiddleware,
    postInputValidationCommentBodyValidationMiddleware
} from "../../middlewares/errorsMiddleware";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {Router} from "express";
import {PostsController} from "./postsController";

export const postsRouter = Router()


const postsController = new PostsController()

postsRouter.get('/:postId/comments', postsController.getCommentsByPostId.bind(postsController));

postsRouter.post('/:postId/comments', authBearerMiddleware, ...postInputValidationCommentBodyValidationMiddleware, postsController.createComment.bind(postsController));
postsRouter.get('/', errorsMiddleware, postsController.getPosts.bind(postsController));
postsRouter.post('/', authMiddleware, blogIdValidation, postInputValidationBodyMiddleware, postsController.createPost.bind(postsController));
postsRouter.get('/:id', idValidation, errorsMiddleware, postsController.findPost.bind);
postsRouter.put('/:id', authMiddleware, idValidation, blogIdValidation, postInputValidationBodyMiddleware, postsController.updatePost.bind(postsController));
postsRouter.delete('/:id', authMiddleware, idValidation, errorsMiddleware, postsController.deletePost.bind(postsController));