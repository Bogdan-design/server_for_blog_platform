import {
    authInputValidationBodyMiddleware,
    confirmationInputValidationBodyMiddleware,
    newPasswordInputValidationBodyMiddleware,
    recoveryPasswordInputValidationBodyMiddleware,
    registrationInputValidationBodyMiddleware,
    resendingEmailValidationBodyMiddleware
} from "../../middlewares/errorsMiddleware";
import {authRefreshTokenMiddleware} from "../../middlewares/authRefreshTokenMiddleware";
import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {Router} from "express";
import {sessionMiddleware} from "../../middlewares/sessionMiddleware";
import {AuthController} from "../../features/login/authController";
export const authRouter = Router()

const authController = new AuthController()

authRouter.post('/login',authInputValidationBodyMiddleware,sessionMiddleware, authController.login.bind(authController))
authRouter.post('/password-recovery',sessionMiddleware,recoveryPasswordInputValidationBodyMiddleware, authController.passwordRecovery.bind(authController))
authRouter.post('/new-password',sessionMiddleware,newPasswordInputValidationBodyMiddleware, authController.newPassword.bind(authController))
authRouter.post('/refresh-token',authRefreshTokenMiddleware,authController.refresh.bind(authController))
authRouter.post('/registration-confirmation',sessionMiddleware, confirmationInputValidationBodyMiddleware, authController.confirmation.bind(authController))
authRouter.post('/registration',sessionMiddleware,registrationInputValidationBodyMiddleware, authController.registration.bind(authController))
authRouter.post('/registration-email-resending',sessionMiddleware,resendingEmailValidationBodyMiddleware, authController.resending.bind(authController))
authRouter.post('/logout',authRefreshTokenMiddleware,authController.logout.bind(authController))
authRouter.get('/me', authBearerMiddleware, authController.authMe.bind(authController))