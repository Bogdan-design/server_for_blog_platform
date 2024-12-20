import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../status.code";
import {jwtService} from "../application/jwt.service";
import {repositoryUsers} from "../features/users/repository.users";

export const authBearerMiddleware = async (req:any, res:Response<any>,next:NextFunction) => {

    if(!req.headers.authorization){
        res.status(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const token = req.headers.authorization.split(' ')[1];

    const userId= await jwtService.getUserIdByToken(token);
    if(userId){
        req.user = await repositoryUsers.getUserById(userId.toString());


      return next()

    }

    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
}