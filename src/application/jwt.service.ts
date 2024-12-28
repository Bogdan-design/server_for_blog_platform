import {UserTypeDB} from "../types/types";
import jwt, {JwtPayload} from "jsonwebtoken";
import {ObjectId, WithId} from "mongodb";

export const jwtService = {
    async createJWT(user: WithId<UserTypeDB>) {
        const accessToken = jwt.sign({userId: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES});
        const refreshToken = jwt.sign({userId: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRES});
        return {accessToken, refreshToken}
    },
    async getUserIdByToken(token: string) {
        try {
            const secret =  process.env.JWT_SECRET
            const payload = await jwt.verify(token,secret);
            return new ObjectId((payload as JwtPayload & { userId: string }).userId)
        } catch (e) {
            console.log(e)
            return null;
        }
    },



}
