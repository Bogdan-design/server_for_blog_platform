import {NextFunction, Request, Response} from "express";
import {sessionCollection} from "../db/mongo.db";
import {SessionType} from "../types/types";
import {HTTP_STATUSES} from "../status.code";

export const sessionMiddleware = async (req:Request<any>, res:Response<any>,next:NextFunction) =>{

    const ip = req.ip
    const url = req.baseUrl
    const date = new Date().toISOString()

    const newSession: SessionType = {
        ip,
        url,
        date
    }

    const createSession = await sessionCollection.insertOne(newSession)
    if(!createSession.acknowledged){
        res.sendStatus(HTTP_STATUSES.TO_MANY_REQUESTS_429)
        return
    }

    const limit: number = 5

    const timeLimit: Date = new Date(Date.now() - 10 * 1000)

    const countNewSession = await sessionCollection.countDocuments({ip,date: {$gte: timeLimit.toISOString()}})
    console.log(countNewSession)
    if(countNewSession>limit){
        res.sendStatus(HTTP_STATUSES.TO_MANY_REQUESTS_429)
        return
    }


    return next()

}