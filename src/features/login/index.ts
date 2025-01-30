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
import {UsersService} from "../../features/users/usersService";
import {UsersRepository} from "../../features/users/usersRepository";
import {JwtService} from "../../application/jwtService";
import {SecurityService} from "../../features/security/securityService";
import {SecurityRepository} from "../../features/security/securityRepository";
import {AuthService} from "../../features/login/authService";

export const authRouter = Router()


const usersRepository = new UsersRepository()
const authService = new AuthService(usersRepository)
const usersService = new UsersService(usersRepository)
const jwtService = new JwtService()
const securityService = new SecurityService()
const securityRepository = new SecurityRepository()
const authController = new AuthController(
    authService,
    usersService,
    usersRepository,
    jwtService,
    securityService,
    securityRepository)

authRouter.post('/login', authInputValidationBodyMiddleware, sessionMiddleware, authController.login.bind(authController))
authRouter.post('/password-recovery', sessionMiddleware, recoveryPasswordInputValidationBodyMiddleware, authController.passwordRecovery.bind(authController))
authRouter.post('/new-password', sessionMiddleware, newPasswordInputValidationBodyMiddleware, authController.newPassword.bind(authController))
authRouter.post('/refresh-token', authRefreshTokenMiddleware, authController.refresh.bind(authController))
authRouter.post('/registration-confirmation', sessionMiddleware, confirmationInputValidationBodyMiddleware, authController.confirmation.bind(authController))
authRouter.post('/registration', sessionMiddleware, registrationInputValidationBodyMiddleware, authController.registration.bind(authController))
authRouter.post('/registration-email-resending', sessionMiddleware, resendingEmailValidationBodyMiddleware, authController.resending.bind(authController))
authRouter.post('/logout', authRefreshTokenMiddleware, authController.logout.bind(authController))
authRouter.get('/me', authBearerMiddleware, authController.authMe.bind(authController))