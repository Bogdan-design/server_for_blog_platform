import {Router, Request, Response} from "express";
import {authRefreshTokenMiddleware} from "../../middlewares/authRefreshTokenMiddleware";

export const securityRouter = Router()


export const securityController = {
    async getAllActiveDevices(req: Request<any>, res: Response<any>): Promise<void> {
        const ip = req.headers['Remote address']
        const baseUrl = req.headers['Request URL'];


    }
}


securityRouter.get('/devices',authRefreshTokenMiddleware, securityController.getAllActiveDevices)