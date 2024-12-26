import {UserTypeDB} from "../types/types";
import jwt from "jsonwebtoken";
import {ObjectId, WithId} from "mongodb";
import {repositoryUsers} from "../features/users/repository.users";
import {repositoryTokens} from "./repository.tokens";

export const jwtService = {
    async createJWT(user: WithId<UserTypeDB>) {
        const accessToken = jwt.sign({userId: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES});
        const refreshToken = jwt.sign({userId: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRES});
        return {accessToken, refreshToken}
    },
    async getUserIdByToken(token: string) {
        try {
            const result: any = await jwt.verify(token, process.env.JWT_SECRET);
            return new ObjectId(result.userId)
        } catch (e) {
            return null;
        }
    },
    async refreshToken(refreshToken: string) {
        try {
            const result: ObjectId = this.getUserIdByToken(refreshToken)
            const user = await repositoryUsers.getUserById(result.toString())

            if (!user) {
                return null
            }
            const resBlackList = await repositoryTokens.checkInBlackList(refreshToken)
            if (resBlackList) return null
            await repositoryTokens.saveRefreshToken(refreshToken)
            return await this.createJWT(user)


        } catch (e) {
            return null
        }
    },



}
