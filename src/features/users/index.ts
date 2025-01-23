import {authMiddleware} from "../../middlewares/authMiddleware";
import {idValidation, userInputValidationBodyMiddleware} from "../../middlewares/errorsMiddleware";
import {Router} from "express";
import {UsersController} from "./usersController";
export const usersRouter = Router();

const usersController = new UsersController()

usersRouter.get('/',authMiddleware, usersController.getUsers.bind(usersController))
usersRouter.post('/',authMiddleware,userInputValidationBodyMiddleware, usersController.createUser.bind(usersController))
usersRouter.delete('/:id',authMiddleware, idValidation, usersController.deleteUser.bind(usersController))