import {HTTP_STATUSES} from "../status.code";
import {Request, Response, NextFunction} from 'express'
import {authService} from "../features/login/authService";

const entityOfLimits = 10

export const sessionMiddleware = async (req: Request<any> & {
    userId: string
}, res: Response<any>, next: NextFunction) => {

    try {
        const ip = req.headers['Remote address']
        const url = req.baseUrl
        const userId = req.userId
        if (!userId) {

            await authService.saveSession(ip, url)
            const limit = await authService.countSessions(ip, url)

            if (limit >= entityOfLimits) {
                res.status(HTTP_STATUSES.TO_MANY_REQUESTS).json({
                    error: 'To many requests'
                })
            }

            return next()

        }



    } catch (e) {

        console.log(e)
        res
            .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            .json({error: 'Something going wrong'});
        return
    }

}