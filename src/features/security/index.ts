import {authRefreshTokenMiddleware} from "../../middlewares/authRefreshTokenMiddleware";
import {Router} from "express";
import {securityController} from "./securityController";
export const securityRouter = Router()

securityRouter.get('/devices', authRefreshTokenMiddleware, securityController.getAllActiveDevices)
securityRouter.delete('/devices', authRefreshTokenMiddleware, securityController.deleteNotUseDevices)
securityRouter.delete('/devices/:deviceId', authRefreshTokenMiddleware, securityController.deleteDevicesSessionById)