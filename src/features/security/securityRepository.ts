import {DeviceSessionDBType} from "../../types/types";
import {ObjectId} from "mongodb";
import {DevicesModel} from "../../db/mongo.db";

export class SecurityRepository {

    async countSessions(deviceId: string, afterThatTime: Date) {


        const filter = deviceId ? {deviceId: deviceId, iat: {$gte: afterThatTime.toISOString()}} : {}

        const result = await DevicesModel.countDocuments(filter)
        return result
    }
    async findAllDevises(userId: string) {
        const filter = userId ? {userId} : {}
        const devises: DeviceSessionDBType[] = await DevicesModel.find(filter).lean()
        return devises
    }
    async saveDeviseDataToDB(data: DeviceSessionDBType) {
        return DevicesModel.insertMany(data)
    }
    async deleteAllDevices(userId: ObjectId, deviceId: string) {
        return DevicesModel.deleteMany(
            {
                $nor: [
                    {userId: userId.toString(), deviceId}
                ]
            }
        )
    }
    async findSessionByDeviceId(deviceId: string) {
        return DevicesModel.findOne({deviceId})
    }
    async updateSessionTime({deviceId, iat, exp}: { deviceId: string, iat: string, exp: string }) {
        return DevicesModel.updateOne({deviceId}, {$set: {iat, exp}})
    }
    async deleteAllSessionsByDeviceId(deviceId: string) {
        return DevicesModel.deleteMany({deviceId})
    }
    async findSessionByDeviceIdAndIat(deviceId: string, iat: string) {
        const filter = {
            $and: [
                {deviceId},
                {iat}
            ]
        }
        return DevicesModel.findOne(filter)
    }
}