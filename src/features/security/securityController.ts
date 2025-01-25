import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {SecurityService} from "./securityService";
import {DeviceSessionDBType, RequestWithParams, UserTypeDB} from "../../types/types";
import {ObjectId, WithId} from "mongodb";
import {SecurityRepository} from "./securityRepository";
import {repositoryTokens} from "../../application/repository.tokens";


const getDevisesViewModel = (dbDevise: DeviceSessionDBType) => {
    return {
        ip: dbDevise.ip,
        title: dbDevise.title,
        lastActiveDate: dbDevise.iat,
        deviceId: dbDevise.deviceId
    }
}


export class SecurityController {

    securityService: SecurityService
    securityRepository: SecurityRepository
    constructor(){
        this.securityService = new SecurityService()
        this.securityRepository = new SecurityRepository()
    }

    async getAllActiveDevices(req: Request<any> & { user: { _id: ObjectId } }, res: Response<any>): Promise<void> {

        try {
            const userId = req.user._id.toString()
            const devises = await this.securityService.getAllActiveDevisesByUserId(userId)


            res
                .status(HTTP_STATUSES.OK_200)
                .json(devises.map(getDevisesViewModel))
            return

        } catch (e) {
            console.log(e)
            res
                .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json(`Some error:${e}`)
            return
        }

    }
    async deleteNotUseDevices(req: Request<any> & { user: { _id: ObjectId } }, res: Response<any>) {
        try {
            const refreshToken: string = req.cookies.refreshToken
            if (!refreshToken) {
                res.sendStatus(HTTP_STATUSES.TO_MANY_REQUESTS_429)
                return
            }

            const deleteResult = await this.securityService.deleteAllNotActiveDevices(refreshToken)
            if (!deleteResult.acknowledged) {
                res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                return
            }
            // const success =  await repositoryTokens.saveRefreshTokenToBlackList(refreshToken)
            //
            // if(!success.acknowledged){
            //     res.status(HTTP_STATUSES.UNAUTHORIZED_401).send('Unauthorized');
            //     return
            // }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return


        } catch (e) {
            console.log(e)
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json(`Some server error:${e}`)
        }


    }
    async deleteDevicesSessionById(req: RequestWithParams<{ deviceId: string }> & {
        user: WithId<UserTypeDB>
    }, res: Response<any>) {
        try {

            const deviceId = req.params.deviceId
            const userId = req.user._id.toString()
            const token = req.cookies.refreshToken

            if (!deviceId) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json('Cant find id in params')
                return
            }

            const device = await this.securityRepository.findSessionByDeviceId(deviceId)
            if (!device) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json('Cant find device by id')
                return
            }

            if (userId !== device.userId) {
                res.status(HTTP_STATUSES.NOT_OWN_403).json('You not owner')
                return
            }


            if (!token) {
                res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
                return
            }

            const deleteResult = await this.securityService.deleteDevicesSessionById(token, deviceId)
            if (!deleteResult.acknowledged) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            console.log(e)
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json(`Some server error:${e}`)
            return
        }
    }

}


