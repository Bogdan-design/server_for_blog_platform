import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {commentsInputValidationParamsMiddleware} from "../../middlewares/errorsMiddleware";
import {Router} from "express";
import {commentsController} from "./commentsController";
export const commentsRouter = Router()

commentsRouter.put('/:commentId/like-status', authBearerMiddleware, commentsController.likeStatus)
commentsRouter.put('/:commentId', authBearerMiddleware,commentsInputValidationParamsMiddleware, commentsController.updateComment)
commentsRouter.delete('/:commentId', authBearerMiddleware, commentsController.deleteComment)
commentsRouter.get('/:id', commentsController.getCommentById)