import {UserType} from "../types/types";
import jwt from "jsonwebtoken";
import {ObjectId, WithId} from "mongodb";

export const jwtService = {
    async createJWT(user: WithId<UserType>) {
        const token = jwt.sign({userId: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES});
        return token
    },
    async getUserIdByToken(token: string) {
        try {
            const result: any = await jwt.verify(token, process.env.JWT_SECRET);
            return new ObjectId(result.userId)
        } catch (err) {
            return null;
        }
    }


}
