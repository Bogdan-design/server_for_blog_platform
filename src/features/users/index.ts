import {authMiddleware} from "../../middlewares/authMiddleware";
import {idValidation, userInputValidationBodyMiddleware} from "../../middlewares/errorsMiddleware";
import {Router} from "express";
import {UsersController} from "./usersController";
import {usersController} from "../../../src/compositions.root";
export const usersRouter = Router();



usersRouter.get('/',authMiddleware, usersController.getUsers.bind(usersController))
usersRouter.post('/',authMiddleware,userInputValidationBodyMiddleware, usersController.createUser.bind(usersController))
usersRouter.delete('/:id',authMiddleware, idValidation, usersController.deleteUser.bind(usersController))