import {NextFunction,Request,Response} from "express";
import {SETTINGS} from "../settings";
import {HTTP_STATUSES} from "../status.code";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization'] as string
    if (!auth) {
        res
            .status(HTTP_STATUSES.UNAUTHORIZED_401)
            .json('Unauthorized')
        return
    }
    const buff = Buffer.from(auth.slice(6), 'base64')
    const decodedAuth = buff.toString('utf8')


    const buff2 = Buffer.from(SETTINGS.AUTH_TOKEN, 'utf8')
    const codedAuth = buff2.toString('base64')

    if (decodedAuth !== SETTINGS.AUTH_TOKEN || auth.slice(0, 6) !== 'Basic ') {

        res
            .status(HTTP_STATUSES.UNAUTHORIZED_401)
            .json('Unauthorized')
        return
    }

    next()
}