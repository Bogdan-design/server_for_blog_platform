import {SecurityDBType, SessionType} from "../../types/types";
import {securityCollection} from "../../db/mongo.db";

export const securityRepository = {
    async saveSession (data: SecurityDBType){
        return await securityCollection.insertOne(data)
    }
}