import {NextFunction, Response} from "express";
import {HTTP_STATUSES} from "../status.code";
import {jwtService} from "../application/jwt.service";
import {repositoryUsers} from "../features/users/repository.users";
import {ObjectId} from "mongodb";
import {repositoryTokens} from "../application/repository.tokens";

export const authRefreshTokenMiddleware = async (req: any, res: Response<any>, next: NextFunction) => {

    if (!req.cookies.refreshToken) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const token = req.cookies.refreshToken;

    const resBlackList = await repositoryTokens.checkTokenInBlackList(token)
    if (resBlackList) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }
    await repositoryTokens.saveRefreshTokenToBlackList(token)
    const userId: ObjectId = await jwtService.getUserIdByToken(token);
    const deviceId: ObjectId = await jwtService.getDeviceIdByToken(token)

    if(!deviceId){
        res.sendStatus(HTTP_STATUSES.TO_MANY_REQUESTS_429)
        return
    }

    if (userId) {
        req.user = await repositoryUsers.getUserById(userId.toString());

        const {refreshToken} = await jwtService.createJWT(req.user,deviceId)
        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true,})


        return next()

    }

    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
}