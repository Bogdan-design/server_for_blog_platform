import {blackListCollection} from "../db/mongo.db";

export const repositoryTokens = {
    async saveRefreshTokenToBlackList(refreshToken: string) {
        const result = await blackListCollection.insertOne({refreshToken})
        return result
    },
    async checkTokenInBlackList(refreshToken: string) {
        const result = await blackListCollection.findOne({refreshToken})
        return result
    }
}