import {Response, Router} from "express";
import {RequestWithBody, UserTypeDB} from "../../types/types";
import {AuthLoginModel} from "../../features/login/AuthLoginModel";
import {serviceUsers} from "../../features/users/service.users";
import {HTTP_STATUSES} from "../../status.code";
import {
    authInputValidationBodyMiddleware,
    confirmationInputValidationBodyMiddleware,
    registrationInputValidationBodyMiddleware,
    resendingEmailValidationBodyMiddleware
} from "../../middlewares/errorsMiddleware";
import {jwtService} from "../../application/jwt.service";
import {authBearerMiddleware} from "../../middlewares/authBearerMiddleware";
import {repositoryUsers} from "../../features/users/repository.users";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import {WithId} from "mongodb";
import {authService} from "../../features/login/authService";

export const authRouter = Router()


export const authController = {
    async login(req: RequestWithBody<AuthLoginModel>, res: Response<any>) {
        try {
            const {loginOrEmail, password} = req.body;

            const user = await serviceUsers.checkCredentials(loginOrEmail, password);

            if (!user) {
                res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                    "errorsMessages": [
                        {
                            message: "login or email incorrect",
                            field: "login or email"
                        }
                    ]
                });
                return
            }

            const {accessToken:token,refreshToken} = await jwtService.createJWT(user)
            if (!token) {
                res
                    .status(HTTP_STATUSES.UNAUTHORIZED_401)
                    .json({message: 'Some going wrong token'})
                return
            }
            res
                .cookie('refreshToken', refreshToken, {httpOnly: true})
                .status(HTTP_STATUSES.OK_200)
                .json({
                accessToken: token
            })
            return

        } catch (e: any) {
            res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                errorsMessages: [
                    {
                        message: "login or email incorrect",
                        field: "login or email"
                    }
                ]
            })
            return
        }

    },
    async refresh(req: RequestWithBody<{ refreshToken: string }>, res: Response<any>) {

        try{
            const refreshToken = req.cookies['refreshToken']
            if (!refreshToken) {
                res.status(HTTP_STATUSES.UNAUTHORIZED_401).send('Unauthorized');
                return
            }

            const token = await jwtService.refreshToken(refreshToken)

            res
                .cookie('refreshToken', token.refreshToken, {httpOnly: true})
                .status(HTTP_STATUSES.OK_200)
                .json({accessToken: token.accessToken})
            return

        }catch (e){
            res
                .status(HTTP_STATUSES.UNAUTHORIZED_401).json('Unauthorized')
            return
        }
    },
    async confirmation(req: RequestWithBody<{ code: string }> & { user: WithId<UserTypeDB> }, res: Response<any>) {
        try {

            const codeFromMessage: string = req.body.code

           const result =  await authService.confirmEmail(codeFromMessage)

            if (!result) {
                res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
                    errorsMessages: [
                        {
                            message: "Code is not valid",
                            field: "code"
                        }
                    ]
                })
                return
            }

            res
                .status(HTTP_STATUSES.NO_CONTENT_204)
                .json({message: 'Email was verified. Account was activated'})
            return
        } catch (e) {
            console.error('Some error:', e)
            res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({error: `Some error:${e}`})
        }
    },
    async registration(req: RequestWithBody<CreateUserModel>, res: Response<any>) {
        try {
            const {email, login} = await serviceUsers.createUser({
                login: req.body.login,
                email: req.body.email,
                password: req.body.password
            })

            if (login) {
                res
                    .status(HTTP_STATUSES.BAD_REQUEST_400)
                    .json({
                        errorsMessages: [
                            {
                                message: 'Login already exists',
                                field: 'login',
                            }
                        ]
                    })
                return
            }

            if (email) {
                res
                    .status(HTTP_STATUSES.BAD_REQUEST_400)
                    .json({
                        errorsMessages: [
                            {
                                message: 'Email already exists',
                                field: 'email',
                            }
                        ]
                    })
                return
            }

            res
                .status(HTTP_STATUSES.NO_CONTENT_204)
                .json({message: 'Confirmation message was sent'})
            return

        } catch (e) {
            console.error('Some error:', e)
            res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            return

        }

    },
    async resending(req: RequestWithBody<{email:string}>, res: Response<any>) {
        try {
            const email = await authService.resendEmailConfirmationMessage(req.body.email)

            if (!email) {
                res
                    .status(HTTP_STATUSES.BAD_REQUEST_400)
                    .json({
                        errorsMessages: [
                            {
                                message: 'Email already exists',
                                field: 'email',
                            }
                        ]
                    })
                return
            }

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            console.error('Some error:', e)
            res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            return

        }

    },
    async authMe(req: any, res: Response<{
        email: string
        login: string
        userId: string
    }>) {
        try {
            const userId = req.user._id.toString();

            const user = await repositoryUsers.getUserById(userId);
            if (!user) {
                res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                return
            }

            res.status(HTTP_STATUSES.OK_200).json({
                email: user.accountData.email,
                login: user.accountData.login,
                userId: user._id.toString(),
            })
            return


        } catch (e) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }
    },
    async logout(req: any, res: Response<any>) {}
}

authRouter.post('/login', authInputValidationBodyMiddleware, authController.login)
authRouter.post('/refresh-token',authBearerMiddleware, authController.refresh)
authRouter.post('/registration-confirmation', confirmationInputValidationBodyMiddleware, authController.confirmation)
authRouter.post('/registration',registrationInputValidationBodyMiddleware, authController.registration)
authRouter.post('/registration-email-resending',resendingEmailValidationBodyMiddleware, authController.resending)
authRouter.post('/logout',authBearerMiddleware, authController.logout)
authRouter.get('/me', authBearerMiddleware, authController.authMe)