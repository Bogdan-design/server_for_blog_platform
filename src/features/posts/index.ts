import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {
    blogIdValidation,
    errorsMiddleware, idValidation, postInputValidationBodyMiddleware,
    postInputValidationCommentBodyValidationMiddleware
} from "../../middlewares/errorsMiddleware";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {Router} from "express";
import {postsController} from "./postsController";

export const postsRouter = Router()

postsRouter.get('/:postId/comments', postsController.getCommentsByPostId);

postsRouter.post('/:postId/comments', authBearerMiddleware, ...postInputValidationCommentBodyValidationMiddleware, postsController.createComment);
postsRouter.get('/', errorsMiddleware, postsController.getPosts);
postsRouter.post('/', authMiddleware, blogIdValidation, postInputValidationBodyMiddleware, postsController.createPost);
postsRouter.get('/:id', idValidation, errorsMiddleware, postsController.findPost);
postsRouter.put('/:id', authMiddleware, idValidation, blogIdValidation, postInputValidationBodyMiddleware, postsController.updatePost);
postsRouter.delete('/:id', authMiddleware, idValidation, errorsMiddleware, postsController.deletePost);