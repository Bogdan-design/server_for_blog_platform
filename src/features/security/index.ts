import {Request, Response, Router} from "express";
import {authRefreshTokenMiddleware} from "../../middlewares/authRefreshTokenMiddleware";
import {HTTP_STATUSES} from "../../status.code";
import {securityService} from "../../features/security/service.security";
import {SessionType} from "../../types/types";
import {WithId} from "mongodb";
import {authService} from "../../features/login/authService";

export const securityRouter = Router()

const getDevisesViewModel = (dbDevise:WithId<SessionType>)=>{
    return{
        ip:dbDevise.ip,
        title:dbDevise.title,
        lastActiveDate:dbDevise.date,
        deviceId:dbDevise.deviceId
    }
}


export const securityController = {

    async getAllActiveDevices(req: Request<any> &{userId:string}, res: Response<any>): Promise<void> {

        try{

            const userId = req.userId

            const devises = await securityService.getAllActiveDevisesByUserId(userId)

            res
                .status(HTTP_STATUSES.OK_200)
                .json(devises.map(getDevisesViewModel))
            return

        }catch(e){
            console.log(e)
            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json(`Some error:${e}`)
            return
        }

    },
    async deleteNotUseDevices (req:Request<any>, res:Response<any>){
        const currentDeviceId = req.cookie.deviceId

        const res = await authService.deleteNotUseDevices(currentDeviceId)
    }

}


securityRouter.get('/devices',authRefreshTokenMiddleware, securityController.getAllActiveDevices)
securityRouter.delete('/devices',authRefreshTokenMiddleware, securityController.getAllActiveDevices)
securityRouter.delete('/devices/:deviceId',authRefreshTokenMiddleware, securityController.getAllActiveDevices)