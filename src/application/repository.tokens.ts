import {BlackLIstRefreshTokensModel} from "../db/mongo.db";

export const repositoryTokens = {
    async saveRefreshTokenToBlackList(refreshToken: string) {
        const result = await BlackLIstRefreshTokensModel.insertMany([{refreshToken}])
        return result
    },
    async checkTokenInBlackList(refreshToken: string) {
        const result = await BlackLIstRefreshTokensModel.findOne({refreshToken})
        return result
    }
}