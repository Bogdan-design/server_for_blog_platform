import {authMiddleware} from "../../middlewares/authMiddleware";
import {idValidation, userInputValidationBodyMiddleware} from "../../middlewares/errorsMiddleware";
import {Router} from "express";
import {UsersRepository} from "./usersRepository";
import {UsersService} from "./usersService";
import {UsersController} from "./usersController";

export const usersRouter = Router();

const usersRepository = new UsersRepository()
const usersService = new UsersService(usersRepository)
export const usersController = new UsersController(usersService)

usersRouter.get('/',authMiddleware, usersController.getUsers.bind(usersController))
usersRouter.post('/',authMiddleware,userInputValidationBodyMiddleware, usersController.createUser.bind(usersController))
usersRouter.delete('/:id',authMiddleware, idValidation, usersController.deleteUser.bind(usersController))