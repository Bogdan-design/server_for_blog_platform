import {NextFunction, Response} from "express";
import {HTTP_STATUSES} from "../status.code";
import {repositoryTokens} from "../application/repository.tokens";
import {SecurityService} from "../features/security/securityService";
import {UsersRepository} from "../features/users/usersRepository";
import {JwtService} from "../application/jwtService";

const usersRepository = new UsersRepository();
const jwtService = new JwtService();
const securityService = new SecurityService();


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
        req.user = await usersRepository.getUserById(userId.toString());
        req.deviceId = deviceId

        return next()

    }

    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
}