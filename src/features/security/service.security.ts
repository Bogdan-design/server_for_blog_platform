import {securityRepository} from "../../features/security/repository.security";
import {DeviceSessionDBType} from "../../types/types";
import jwt from "jsonwebtoken";
import UAParser from "ua-parser-js";
import {jwtService} from "../../application/jwt.service";
import {ObjectId} from "mongodb";


export const securityService = {
    async getAllActiveDevisesByUserId(userId: string) {

        const allDevises = await securityRepository.findAllDevises(userId)
        return allDevises
    },
    async securityRepository({titleForParsing, refreshToken, ip, baseUrl}: {
        titleForParsing: string,
        refreshToken: string,
        ip: string,
        baseUrl: string
    }) {

        const secret = process.env.JWT_SECRET

        const parser = new (UAParser as any)()
        parser.setUA(titleForParsing)
        const title = parser.getResult().ua

        const payload = jwt.verify(refreshToken, secret)
        if (typeof payload === 'string') {
            throw new Error('payload is string')
        }

        const userId: string = payload.userId

        const deviceId: string = payload.deviceId

        const iat = new Date(payload.iat * 1000).toISOString()


        const exp = new Date(payload.exp * 1000).toISOString()

        const newDevice: DeviceSessionDBType = {
            userId,
            title,
            deviceId,
            iat,
            exp,
            ip,
            baseUrl,
        }
        const res = await securityRepository.saveDeviseDataToDB(newDevice)
        return res
    },
    async deleteAllNotActiveDevices(token: string) {
        const userId: ObjectId = await jwtService.getUserIdByToken(token)
        const deviceId: string = await jwtService.getDeviceIdByToken(token)

        const res = await securityRepository.deleteAllDevices(userId, deviceId)
        return res
    },
    async terminateDevicesSessionById(token: string, deviceIdFromParams: string) {

        const userId: ObjectId = await jwtService.getUserIdByToken(token)
        const deviceId: string = await jwtService.getDeviceIdByToken(token)

        const findUserByDeviceId = await securityRepository.findUserByDeviceId(deviceId)
        if (findUserByDeviceId.userId !== userId.toString()){
            throw new Error('You are not the owner of this device')

        }
        if (deviceId === deviceIdFromParams) {
            throw new Error('You tri delete device what use now')

        }
        const res = await securityRepository.deleteDevice(deviceIdFromParams)
        return res
    }

}