import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {
    blogIdValidation,
    errorsMiddleware, idValidation, likeInputValidationBodyMiddleware, postInputValidationBodyMiddleware,
    postInputValidationCommentBodyValidationMiddleware
} from "../../middlewares/errorsMiddleware";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {Router} from "express";
import {PostsController} from "./postsController";
import {softBearerMiddleware} from "../../middlewares/softBearerMiddleware";

export const postsRouter = Router()


const postsController = new PostsController()

postsRouter.put('/:postId/like-status',authBearerMiddleware,likeInputValidationBodyMiddleware, postsController.createLikesForPost.bind(postsController));
postsRouter.get('/:postId/comments', postsController.getCommentsByPostId.bind(postsController));
postsRouter.post('/:postId/comments', authBearerMiddleware, ...postInputValidationCommentBodyValidationMiddleware, postsController.createComment.bind(postsController));
postsRouter.get('/',softBearerMiddleware, errorsMiddleware, postsController.getPosts.bind(postsController));
postsRouter.post('/', authMiddleware, blogIdValidation, postInputValidationBodyMiddleware, postsController.createPost.bind(postsController));
postsRouter.get('/:id',softBearerMiddleware, idValidation, errorsMiddleware, postsController.findPost.bind(postsController));
postsRouter.put('/:id', authMiddleware, idValidation, blogIdValidation, postInputValidationBodyMiddleware, postsController.updatePost.bind(postsController));
postsRouter.delete('/:id', authMiddleware, idValidation, errorsMiddleware, postsController.deletePost.bind(postsController));