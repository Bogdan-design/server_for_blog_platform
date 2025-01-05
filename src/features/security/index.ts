import {Router, Request, Response} from "express";
import {authRefreshTokenMiddleware} from "../../middlewares/authRefreshTokenMiddleware";
import {authService} from "../../features/login/authService";

export const securityRouter = Router()


export const securityController = {
    async getAllActiveDevices(req: Request<any>, res: Response<any>): Promise<void> {
        const ip = req.headers['Remote address']
        const baseUrl = req.headers['Request URL'];


    },
    async deleteNotUseDevices (req:Request<any>, res:Response<any>){
        const currentDeviceId = req.cookie.deviceId

        const res = await authService.deleteNotUseDevices(currentDeviceId)
    }

}


securityRouter.get('/devices',authRefreshTokenMiddleware, securityController.getAllActiveDevices)
securityRouter.delete('/devices',authRefreshTokenMiddleware, securityController.getAllActiveDevices)
securityRouter.delete('/devices/:deviceId',authRefreshTokenMiddleware, securityController.getAllActiveDevices)