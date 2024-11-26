import express from "express";
import {HTTP_STATUSES} from "../../status.code";
import {blogCollection, postCollection} from "../../db/mongo.db";

export const testRouter = express.Router()

export const testingController = {
    deleteAllData: async (req: any, res:any)=>{
        try{
            await blogCollection.drop()
            await postCollection.drop()
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)

        } catch(err){
            console.log(err)
            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        }
    }
}


testRouter.delete('/all-data', testingController.deleteAllData)