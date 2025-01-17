import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {securityService} from "../../features/security/service.security";
import {DeviceSessionDBType, RequestWithParams} from "../../types/types";
import {ObjectId} from "mongodb";


const getDevisesViewModel = (dbDevise: DeviceSessionDBType) => {
    return {
        ip: dbDevise.ip,
        title: dbDevise.title,
        lastActiveDate: dbDevise.iat,
        deviceId: dbDevise.deviceId
    }
}


export const securityController = {

    async getAllActiveDevices(req: Request<any> & { user: { _id: ObjectId } }, res: Response<any>): Promise<void> {

        try {

            const userId = req.user._id.toString()
            const devises = await securityService.getAllActiveDevisesByUserId(userId)

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

    },
    async deleteNotUseDevices(req: Request<any> & { user: { _id: ObjectId } }, res: Response<any>) {
        try {
            const jwt: string = req.cookies.refreshToken
            if (!jwt) {
                res.sendStatus(HTTP_STATUSES.TO_MANY_REQUESTS_429)
                return
            }

            const deleteResult = await securityService.deleteAllNotActiveDevices(jwt)
            if (!deleteResult.acknowledged) {
                res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                return
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return


        } catch (e) {
            console.log(e)
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                .json(`Some server error:${e}`)
        }


    },
    async terminateDevicesSessionById(req: RequestWithParams<{ deviceId: string }>, res: Response<any>) {
        try {

            const deviceIdFromParams = req.params.deviceId
            if (!deviceIdFromParams) {
                res.status(HTTP_STATUSES.NOT_FOUND_404).json('Cant find id in params')
                return
            }

            const token = req.cookies.refreshToken
            if (!token) {
                res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
                return
            }

            const deleteResult = await securityService.terminateDevicesSessionById(token, deviceIdFromParams)
            if (!deleteResult.acknowledged) {
                res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
                return
            }

        } catch (e) {
            console.log(e)
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json(`Some server error:${e}`)
            return
        }
    }

}


