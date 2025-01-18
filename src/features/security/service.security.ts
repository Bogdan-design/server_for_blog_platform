import {securityRepository} from "../../features/security/repository.security";
import {DeviceSessionDBType} from "../../types/types";
import jwt from "jsonwebtoken";
import UAParser from "ua-parser-js";
import {jwtService} from "../../application/jwt.service";
import {ObjectId} from "mongodb";
import {repositoryTokens} from "../../application/repository.tokens";


export const securityService = {
    async getAllActiveDevisesByUserId(userId: string) {

        const allDevises = await securityRepository.findAllDevises(userId)
        return allDevises
    },
    async createDeviceSession({titleForParsing, refreshToken, ip, baseUrl}: {
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
    async countSessionsForDevice(deviceId: string) {
        const afterThatTime: Date = new Date(Date.now() - 10 * 1000)

        const count = await securityRepository.countSessions(deviceId, afterThatTime)
        return count
    },

    async deleteAllNotActiveDevices(token: string) {
        const userId: ObjectId = await jwtService.getUserIdByToken(token)
        const deviceId: string = await jwtService.getDeviceIdByToken(token)

        const res = await securityRepository.deleteAllDevices(userId, deviceId)
        return res
    },
    async deleteDevicesSessionById(token: string, deviceIdFromParams: string) {

        const userId: ObjectId = await jwtService.getUserIdByToken(token)
        const deviceId: string = await jwtService.getDeviceIdByToken(token)

        const findSessionByDeviceId = await securityRepository.findSessionByDeviceId(deviceId)
        if (findSessionByDeviceId.userId !== userId.toString()) {
            throw new Error('You are not the owner of this device')

        }
        if (deviceId === deviceIdFromParams) {
            throw new Error('You try delete device what use now')

        }

        const res = await securityRepository.deleteAllSessionsByDeviceId(deviceIdFromParams)
        return res
    },
    async updateSessionTime(refreshToken: string) {

        const secret = process.env.JWT_SECRET

        const payload = jwt.verify(refreshToken, secret)
        if (typeof payload === 'string') {
            throw new Error('payload is string')
        }


        const deviceId: string = payload.deviceId

        const iat = new Date(payload.iat * 1000).toISOString()


        const exp = new Date(payload.exp * 1000).toISOString()

        const res = await securityRepository.updateSessionTime({deviceId, iat, exp})

        return res

    },
    async findSessionByDeviceIdAndIat (deviceId:string,iat:number){
        const searchIat = new Date(iat * 1000).toISOString()

        const res = await securityRepository.findSessionByDeviceIdAndIat(deviceId,searchIat)
        return res

    }
}