import {DeviceSessionDBType, SessionType} from "../../types/types";
import {devicesCollection, sessionCollection} from "../../db/mongo.db";
import {ObjectId} from "mongodb";

export const securityRepository = {
    async saveSession (data: SessionType){
        return await sessionCollection.insertOne(data)
    },
    async countSessions (data: {ip:string | string[],url:string,periodOfTime:Date}){


        const filter = data ? {and:[
                { ip: data.ip },
                { url: data.url },
                { date: { $gte: data.periodOfTime } }
            ]} : {}

        const result = await sessionCollection.countDocuments(filter)
        return result
    },
    async findAllDevises (userId:string){
        const filter = userId ? {userId: {$regex:userId}} : {}
        const devises :DeviceSessionDBType[] = await devicesCollection.find(filter).toArray()
        return devises
    },
    async saveDeviseDataToDB (data:DeviceSessionDBType){
        return devicesCollection.insertOne(data)
    },
    async deleteAllDevices (deviceId:string){
        return devicesCollection.deleteMany(
            {
                $nor: [{ deviceId: {$regex: deviceId} }]
            }
        )
    }
}