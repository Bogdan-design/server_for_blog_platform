import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {commentsInputValidationParamsMiddleware} from "../../middlewares/errorsMiddleware";
import {Router} from "express";
import {CommentsController} from "./commentsController";
export const commentsRouter = Router()

const commentsController = new CommentsController()

commentsRouter.put('/:commentId/like-status', authBearerMiddleware, commentsController.likeStatus.bind(commentsController))
commentsRouter.put('/:commentId', authBearerMiddleware,commentsInputValidationParamsMiddleware, commentsController.updateComment.bind(commentsController))
commentsRouter.delete('/:commentId', authBearerMiddleware, commentsController.deleteComment.bind(commentsController))
commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsController))