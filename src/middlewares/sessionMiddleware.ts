import {NextFunction, Request, Response} from "express";
import {sessionCollection} from "../db/mongo.db";
import {SessionType} from "../types/types";
import {HTTP_STATUSES} from "../status.code";

export const sessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const url = req.originalUrl;
    const date = new Date();


    const newSession: SessionType = {ip, url, date};


    const createSession = await sessionCollection.insertOne(newSession);
    if (!createSession.acknowledged) {
        res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
        return;
    }

    const limit: number = 5;
    const timeLimit: Date = new Date(Date.now() - 10 * 1000);


    const countNewSession = await sessionCollection.countDocuments({ip, url, date: {$gte: timeLimit}});
    if (countNewSession > limit) {
        res.sendStatus(HTTP_STATUSES.TO_MANY_REQUESTS_429)
        return;
    }
    return next();

};