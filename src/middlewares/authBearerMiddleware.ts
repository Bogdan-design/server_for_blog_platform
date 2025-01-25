import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../status.code";
import {UsersRepository} from "../features/users/repository.users";
import {JwtService} from "../application/jwtService";

const usersRepository = new UsersRepository();
const jwtService = new JwtService();

export const authBearerMiddleware = async (req:any, res:Response<any>,next:NextFunction) => {

    if(!req.headers.authorization){
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const token = req.headers.authorization.split(' ')[1];

    const userId= await jwtService.getUserIdByToken(token);
    if(userId){
        req.user = await usersRepository.getUserById(userId.toString());


      return next()

    }

    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
}