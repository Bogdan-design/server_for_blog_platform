import {DeviceSessionDBType} from "../../types/types";
import {devicesCollection} from "../../db/mongo.db";
import {ObjectId} from "mongodb";

export const securityRepository = {

    async countSessions(deviceId: string, afterThatTime: Date) {


        const filter = deviceId ? {deviceId: deviceId, iat: {$gte: afterThatTime.toISOString()}} : {}

        const result = await devicesCollection.countDocuments(filter)
        return result
    },
    async findAllDevises(userId: string) {
        const filter = userId ? {userId} : {}
        const devises: DeviceSessionDBType[] = await devicesCollection.find(filter).toArray()
        return devises
    },
    async saveDeviseDataToDB(data: DeviceSessionDBType) {
        return devicesCollection.insertOne(data)
    },
    async deleteAllDevices(userId: ObjectId, deviceId: string) {
        return devicesCollection.deleteMany(
            {
                $nor: [
                    {userId: userId.toString(), deviceId}
                ]
            }
        )
    },
    async findSessionByDeviceId(deviceId: string) {
        return await devicesCollection.findOne({deviceId})
    },
    async updateSessionTime({deviceId, iat, exp}: { deviceId: string, iat: string, exp: string }) {
        return await devicesCollection.updateOne({deviceId}, {$set: {iat, exp}})
    },
    async deleteAllSessionsByDeviceId(deviceId: string) {
        return await devicesCollection.deleteMany({deviceId})
    },
    async findSessionByDeviceIdAndIat(deviceId: string, iat: string) {
        const filter = {
            $and: [
                {deviceId},
                {iat}
            ]
        }
        return await devicesCollection.findOne(filter)
    }
}