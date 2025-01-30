import express from "express";
import {HTTP_STATUSES} from "../../status.code";
import {
    BlackLIstRefreshTokensModel,
    BlogModel, CommentsModel, DevicesModel, LikeForPostsModel, LikesModel,
    PasswordRecoveryModel,
    PostModel, SessionModel, UserModel,
} from "../../db/mongo.db";

export const testRouter = express.Router()

export const testingController = {
    async deleteAllData(req: any, res: any) {
        try {
            await Promise.all([
                BlogModel.deleteMany(),
                PostModel.deleteMany(),
                UserModel.deleteMany(),
                CommentsModel.deleteMany(),
                BlackLIstRefreshTokensModel.deleteMany(),
                DevicesModel.deleteMany(),
                SessionModel.deleteMany(),
                PasswordRecoveryModel.deleteMany(),
                LikesModel.deleteMany(),
                LikeForPostsModel.deleteMany()
            ])

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (err) {
            console.log(err)
            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            return
        }
    }
}


testRouter.delete('/all-data', testingController.deleteAllData)