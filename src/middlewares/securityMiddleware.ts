import {securityService} from "../features/security/service.security";

export const securityMiddleware = async (req, res, next) => {

    const ip = req.headers['Remote address']
    const baseUrl = req.headers['Request URL'];

    await securityService.saveSession({ip, baseUrl})

    if (ip && baseUrl) {
        return next()
    }

    res.sendStatus(401)
    return

}