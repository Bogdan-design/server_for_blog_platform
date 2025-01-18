import {
    authInputValidationBodyMiddleware,
    confirmationInputValidationBodyMiddleware,
    registrationInputValidationBodyMiddleware,
    resendingEmailValidationBodyMiddleware
} from "../../middlewares/errorsMiddleware";
import {authRefreshTokenMiddleware} from "../../middlewares/authRefreshTokenMiddleware";
import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {Router} from "express";
import {authController} from "./authController";
import {sessionMiddleware} from "../../middlewares/sessionMiddleware";
export const authRouter = Router()

authRouter.post('/login',sessionMiddleware,authInputValidationBodyMiddleware, authController.login)
authRouter.post('/refresh-token',authRefreshTokenMiddleware,authController.refresh)
authRouter.post('/registration-confirmation',sessionMiddleware, confirmationInputValidationBodyMiddleware, authController.confirmation)
authRouter.post('/registration',sessionMiddleware,registrationInputValidationBodyMiddleware, authController.registration)
authRouter.post('/registration-email-resending',sessionMiddleware,resendingEmailValidationBodyMiddleware, authController.resending)
authRouter.post('/logout',authRefreshTokenMiddleware,authController.logout)
authRouter.get('/me', authBearerMiddleware, authController.authMe)