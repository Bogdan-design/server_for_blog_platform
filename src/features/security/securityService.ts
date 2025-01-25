import {SecurityRepository} from "./securityRepository";
import {DeviceSessionDBType} from "../../types/types";
import jwt from "jsonwebtoken";
import UAParser from "ua-parser-js";
import {JwtService} from "../../application/jwtService";
import {ObjectId} from "mongodb";
import {repositoryTokens} from "../../application/repository.tokens";


export class SecurityService {
    securityRepository: SecurityRepository
    jwtService: JwtService
    constructor(){
        this.securityRepository = new SecurityRepository()
        this.jwtService = new JwtService()
    }

    async getAllActiveDevisesByUserId(userId: string) {

        const allDevises = await this.securityRepository.findAllDevises(userId)
        return allDevises
    }
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
        const res = await this.securityRepository.saveDeviseDataToDB(newDevice)
        return res
    }
    async countSessionsForDevice(deviceId: string) {
        const afterThatTime: Date = new Date(Date.now() - 10 * 1000)

        const count = await this.securityRepository.countSessions(deviceId, afterThatTime)
        return count
    }
    async deleteAllNotActiveDevices(token: string) {
        const userId: ObjectId = await this.jwtService.getUserIdByToken(token)
        const deviceId: string = await this.jwtService.getDeviceIdByToken(token)

        const res = await this.securityRepository.deleteAllDevices(userId, deviceId)
        return res
    }
    async deleteDevicesSessionById(token: string, deviceIdFromParams: string) {

        const userId: ObjectId = await this.jwtService.getUserIdByToken(token)
        const deviceId: string = await this.jwtService.getDeviceIdByToken(token)

        const findSessionByDeviceId = await this.securityRepository.findSessionByDeviceId(deviceId)
        if (findSessionByDeviceId.userId !== userId.toString()) {
            throw new Error('You are not the owner of this device')

        }
        if (deviceId === deviceIdFromParams) {
            throw new Error('You try delete device what use now')

        }

        const res = await this.securityRepository.deleteAllSessionsByDeviceId(deviceIdFromParams)
        return res
    }
    async updateSessionTime(refreshToken: string) {

        const secret = process.env.JWT_SECRET

        const payload = jwt.verify(refreshToken, secret)
        if (typeof payload === 'string') {
            throw new Error('payload is string')
        }


        const deviceId: string = payload.deviceId

        const iat = new Date(payload.iat * 1000).toISOString()


        const exp = new Date(payload.exp * 1000).toISOString()

        const res = await this.securityRepository.updateSessionTime({deviceId, iat, exp})

        return res

    }
    async findSessionByDeviceIdAndIat (deviceId:string,iat:number){
        const searchIat = new Date(iat * 1000).toISOString()

        const res = await this.securityRepository.findSessionByDeviceIdAndIat(deviceId,searchIat)
        return res

    }
}