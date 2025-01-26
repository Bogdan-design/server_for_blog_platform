import {UsersRepository} from "../src/features/users/usersRepository";
import {UsersService} from "../src/features/users/usersService";
import {UsersController} from "../src/features/users/usersController";

const usersRepository = new UsersRepository()
const usersService = new UsersService(usersRepository)
export const usersController = new UsersController(usersService)