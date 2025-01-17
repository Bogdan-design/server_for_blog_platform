import {DeviceSessionDBType} from "../../types/types";
import {devicesCollection} from "../../db/mongo.db";
import {ObjectId} from "mongodb";

export const securityRepository = {

    async countSessions (deviceId:string,afterThatTime:Date){


        const filter = deviceId ? {deviceId:deviceId,iat: { $gte: afterThatTime.toISOString() }} : {}

        const result = await devicesCollection.countDocuments(filter)
        return result
    },
    async findAllDevises (userId:string){
        const filter = userId ? {userId: userId} : {}
        const devises :DeviceSessionDBType[] = await devicesCollection.find(filter).toArray()
        return devises
    },
    async saveDeviseDataToDB (data:DeviceSessionDBType){
        return devicesCollection.insertOne(data)
    },
    async deleteAllDevices (userId:ObjectId,deviceId:string){
        return devicesCollection.deleteMany(
            {
                $nor: [
                    { userId: userId.toString(),deviceId:deviceId }
                ]
            }
        )
    },
    async deleteDevice (deviceId:string){
        return await devicesCollection.deleteOne({deviceId:deviceId})
    },
    async findUserByDeviceId (deviceId:string) {
        return await devicesCollection.findOne({deviceId:deviceId})
    }

}