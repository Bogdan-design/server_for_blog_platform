import {securityRepository} from "../../features/security/repository.security";
import {DeviceSessionDBType} from "../../types/types";
import {v4 as uuidv4} from 'uuid'
import jwt from "jsonwebtoken";
import UAParser from "ua-parser-js";


export const securityService = {
    async getAllActiveDevisesByUserId(userId: string) {

        const allDevises = await securityRepository.findAllDevises(userId)
        return allDevises
    },
    async securityRepository({titleForParsing, token,ip,baseUrl}: { titleForParsing: string, token: string,ip:string,baseUrl:string }) {

        const secret = process.env.JWT_SECRET

        const parser = new (UAParser as any)()
        parser.setUA(titleForParsing)
        const title = parser.getResult().ua

        const payload = jwt.verify(token, secret)
        if(typeof payload === 'string'){
            throw new Error('payload is string')
        }

        const userId = payload.userId

        const iat = new Date(payload.iat *1000).toISOString()


        const exp = new Date(payload.exp*1000).toISOString()

        const newDevice: DeviceSessionDBType = {
            userId,
            title,
            deviceId: uuidv4(),
            iat,
            exp,
            ip,
            baseUrl,
        }
        const res = await securityRepository.saveDeviseDataToDB(newDevice)
        return res
    }

}