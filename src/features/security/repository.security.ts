import {SessionDBType, SessionType} from "../../types/types";
import {sessionCollection} from "../../db/mongo.db";

export const securityRepository = {
    async saveSession (data: SessionDBType){
        return await sessionCollection.insertOne(data)
    }
}