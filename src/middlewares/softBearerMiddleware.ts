import {NextFunction, Response} from "express";
import {JwtService} from "../application/jwtService";

const jwtService = new JwtService();

export const softBearerMiddleware = async (req: any, res: Response<any>, next: NextFunction) => {

    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const userId = await jwtService.getUserIdByToken(token);

        if (userId) {
            req.userId = userId
        }

    }
    return next()
}