import {authMiddleware} from "../../middlewares/authMiddleware";
import {idValidation, userInputValidationBodyMiddleware} from "../../middlewares/errorsMiddleware";
import {Router} from "express";
import {usersController} from "./usersController";
export const usersRouter = Router();

usersRouter.get('/',authMiddleware, usersController.getUsers)
usersRouter.post('/',authMiddleware,userInputValidationBodyMiddleware, usersController.createUser)
usersRouter.delete('/:id',authMiddleware, idValidation, usersController.deleteUser)