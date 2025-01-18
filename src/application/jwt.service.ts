import {UserTypeDB} from "../types/types";
import jwt, {JwtPayload} from "jsonwebtoken";
import {ObjectId, WithId} from "mongodb";
import {v4 as uuidv4} from "uuid";

export const jwtService = {
    async createJWT(user: WithId<UserTypeDB>, oldDeviceId?: string) {

        const deviceId = oldDeviceId ? oldDeviceId : uuidv4()

        const accessToken = jwt.sign({userId: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES});

        const refreshToken = jwt.sign({
            userId: user._id.toString(),
            deviceId
        }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRES});



        return {accessToken, refreshToken}
    },
    async getUserIdByToken(token: string) {
        try {
            const secret = process.env.JWT_SECRET
            const payload = await jwt.verify(token, secret);

            if (typeof payload === 'string') {
                throw new Error('payload is string')

            }

            return new ObjectId((payload as JwtPayload & { userId: string }).userId)

        } catch (e) {
            console.log(e)
            return null;
        }
    },
    async getDeviceIdByToken(token: string) {
        try {
            const secret = process.env.JWT_SECRET
            const payload = await jwt.verify(token, secret);

            if (typeof payload === 'string') {
                throw new Error('payload is string')

            }

            const deviceId  = payload.deviceId


            return deviceId

        } catch (e) {
            console.log(e)
            return null;
        }

    },
    async getTokenPayload (token:string) {
        const secret = process.env.JWT_SECRET
        const payload = jwt.verify(token, secret);
        if (typeof payload === 'string') {
            throw new Error('payload is string')

        }
        return payload as JwtPayload & { userId: string } & {deviceId:string}
    }
    // async slidingExpirationTime (){
    //
    //     const notAuthorisedSessionId = uuidv4()
    //
    //     const sid = jwt.sign({userid:notAuthorisedSessionId}, process.env.JWT_SECRET, {expiresIn: '1h'})
    //
    //     return sid
    // }


}
