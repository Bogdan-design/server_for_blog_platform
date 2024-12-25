import {blackListCollection} from "../db/mongo.db";

export const repositoryTokens = {
    async saveRefreshToken(refreshToken: string) {
        const result = await blackListCollection.insertOne({refreshToken})
        return result
    },
    async checkInBlackList(refreshToken: string) {
        const result = await blackListCollection.findOne({refreshToken})
        return result
    }
}