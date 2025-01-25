import {authRefreshTokenMiddleware} from "../../middlewares/authRefreshTokenMiddleware";
import {Router} from "express";
import {SecurityController} from "./securityController";
export const securityRouter = Router()

const securityController = new SecurityController()

securityRouter.get('/devices', authRefreshTokenMiddleware, securityController.getAllActiveDevices.bind(securityController))
securityRouter.delete('/devices', authRefreshTokenMiddleware, securityController.deleteNotUseDevices.bind(securityController))
securityRouter.delete('/devices/:deviceId', authRefreshTokenMiddleware, securityController.deleteDevicesSessionById.bind(securityController))