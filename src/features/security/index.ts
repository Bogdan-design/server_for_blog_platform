import {Request, Response, Router} from "express";
import {authRefreshTokenMiddleware} from "../../middlewares/authRefreshTokenMiddleware";
import {HTTP_STATUSES} from "../../status.code";
import {securityService} from "../../features/security/service.security";
import {DeviceSessionDBType} from "../../types/types";
import {ObjectId} from "mongodb";

export const securityRouter = Router()

const getDevisesViewModel = (dbDevise:DeviceSessionDBType)=>{
    return{
        ip:dbDevise.ip,
        title:dbDevise.title,
        lastActiveDate:dbDevise.iat,
        deviceId:dbDevise.deviceId
    }
}


export const securityController = {

    async getAllActiveDevices(req: Request<any> & {user:{_id:ObjectId}}, res: Response<any>): Promise<void> {

        try{

            const userId = req.user._id.toString()
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
    async deleteNotUseDevices (req:Request<any>& {user:{_id:ObjectId}}, res:Response<any>){

        const userId= req.user._id

    }

}


securityRouter.get('/devices',authRefreshTokenMiddleware, securityController.getAllActiveDevices)
securityRouter.delete('/devices',authRefreshTokenMiddleware, securityController.getAllActiveDevices)
securityRouter.delete('/devices/:deviceId',authRefreshTokenMiddleware, securityController.getAllActiveDevices)