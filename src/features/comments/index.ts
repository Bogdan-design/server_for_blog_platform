import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {
    commentsInputValidationParamsMiddleware,
    likeInputValidationBodyMiddleware
} from "../../middlewares/errorsMiddleware";
import {Router} from "express";
import {CommentsController} from "./commentsController";
import {softBearerMiddleware} from "../../middlewares/softBearerMiddleware";
export const commentsRouter = Router()

const commentsController = new CommentsController()

commentsRouter.put('/:commentId/like-status', authBearerMiddleware,likeInputValidationBodyMiddleware, commentsController.likeStatus.bind(commentsController))
commentsRouter.put('/:commentId', authBearerMiddleware,commentsInputValidationParamsMiddleware, commentsController.updateComment.bind(commentsController))
commentsRouter.delete('/:commentId', authBearerMiddleware, commentsController.deleteComment.bind(commentsController))
commentsRouter.get('/:id',softBearerMiddleware, commentsController.getCommentById.bind(commentsController))