import {securityRepository} from "../../features/security/repository.security";
import {DeviceSessionDBType} from "../../types/types";
import jwt from "jsonwebtoken";
import UAParser from "ua-parser-js";


export const securityService = {
    async getAllActiveDevisesByUserId(userId: string) {

        const allDevises = await securityRepository.findAllDevises(userId)
        return allDevises
    },
    async securityRepository({titleForParsing, refreshToken,ip,baseUrl}: { titleForParsing: string, refreshToken: string,ip:string,baseUrl:string }) {

        const secret = process.env.JWT_SECRET

        const parser = new (UAParser as any)()
        parser.setUA(titleForParsing)
        const title = parser.getResult().ua

        const payload = jwt.verify(refreshToken, secret)
        if(typeof payload === 'string'){
            throw new Error('payload is string')
        }

        const userId:string = payload.userId
        const deviceId:string = payload.deviceId

        const iat = new Date(payload.iat *1000).toISOString()


        const exp = new Date(payload.exp*1000).toISOString()

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
    async deleteAllNotActiveDevices (deviceId: string){
        const res = await securityRepository.deleteAllDevices(deviceId)
        return res
    }

}