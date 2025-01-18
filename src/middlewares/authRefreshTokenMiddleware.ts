import {NextFunction, Response} from "express";
import {HTTP_STATUSES} from "../status.code";
import {jwtService} from "../application/jwt.service";
import {repositoryUsers} from "../features/users/repository.users";
import {repositoryTokens} from "../application/repository.tokens";
import {securityService} from "../features/security/service.security";

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

    const {deviceId, iat, userId} = await jwtService.getTokenPayload(token)

    const validDeviceSession = await securityService.findSessionByDeviceIdAndIat(deviceId, iat)
    if(!validDeviceSession){
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    if (!deviceId) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    if (userId) {
        req.user = await repositoryUsers.getUserById(userId.toString());
        req.deviceId = deviceId

        return next()

    }

    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
}