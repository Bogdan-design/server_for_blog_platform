import {Request, Response, Router} from "express";
import {RequestWithBody, UserTypeDB} from "../../types/types";
import {HTTP_STATUSES} from "../../status.code";
import {JwtService} from "../../application/jwtService";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import {WithId} from "mongodb";
import {authService} from "../../features/login/authService";
import {SecurityService} from "../../features/security/securityService";
import {repositoryTokens} from "../../application/repository.tokens";
import {AuthLoginModel} from "../../features/login/models/AuthLoginModel";
import {SecurityRepository} from "../../features/security/securityRepository";
import {UsersService} from "../../features/users/usersService";
import {UsersRepository} from "../../features/users/repository.users";

export class AuthController  {
    authService: authService
    usersService: UsersService
    usersRepository: UsersRepository
    jwtService: JwtService
    securityService: SecurityService
    securityRepository: SecurityRepository

    constructor(){
        this.authService = new authService()
        this.usersService = new UsersService()
        this.usersRepository = new UsersRepository()
        this.jwtService = new JwtService()
        this.securityService = new SecurityService()
        this.securityRepository = new SecurityRepository()
    }

    async login(req: RequestWithBody<AuthLoginModel>, res: Response<any>) {


        try {
            const {loginOrEmail, password} = req.body;
            const titleForParsing = req.headers['user-agent']

            const ip = req.ip
            const baseUrl = req.baseUrl

            const oldToken = req.cookies.refreshToken
            if(oldToken){
                await repositoryTokens.saveRefreshTokenToBlackList(oldToken)
            }

            const user = await this.usersService.checkCredentials(loginOrEmail, password);

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


            const {accessToken,refreshToken} = await this.jwtService.createJWT(user)
            if (!accessToken) {
                res
                    .status(HTTP_STATUSES.UNAUTHORIZED_401)
                    .json({message: 'Some going wrong token'})
                return
            }
            if(Array.isArray(ip)){
                res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
                return
            }

            await this.securityService.createDeviceSession({titleForParsing,baseUrl,ip,refreshToken})

            res
                .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true,})
                .status(HTTP_STATUSES.OK_200)
                .json({
                accessToken
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

    }
    async passwordRecovery(req: RequestWithBody<{email: string}>, res: Response<any>) {
        const email = req.body.email
        try{
            const user = await this.usersRepository.findByLoginOrEmail(email)
            if(!user){
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
                return
            }
            const recoveryCode = await this.usersService.createRecoveryCode(user,email)


            if(!recoveryCode){
                res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
                return
            }
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        }catch (e){
            console.log(e)
            res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            return
        }
    }
    async newPassword (req: RequestWithBody<{recoveryCode: string, newPassword: string}>, res: Response<any>) {
        const code = req.body.recoveryCode
        const password = req.body.newPassword
        try{
            const user = await this.usersService.changePasswordByRecoveryCode(code,password)
            if(!user){
                res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
                return
            }
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        }catch (e){
            console.log(e)
            res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
            return
        }
    }
    async refresh(req: Request & {user: WithId<UserTypeDB>, deviceId: string }, res: Response<any>) : Promise<void> {

        try{
            const user:  WithId<UserTypeDB> = req.user
            const oldToken: string = req.cookies.refreshToken
            const oldDeviceId = req.deviceId

            if (!user) {
                res.status(HTTP_STATUSES.UNAUTHORIZED_401).send('Unauthorized');
                return
            }

            const {accessToken, refreshToken} = await this.jwtService.createJWT(user,oldDeviceId)

            if (!refreshToken) {
                res.status(HTTP_STATUSES.UNAUTHORIZED_401).send('Unauthorized');
                return
            }

            const success =  await repositoryTokens.saveRefreshTokenToBlackList(oldToken)

            if(!success[0]){
                res.status(HTTP_STATUSES.UNAUTHORIZED_401).send('Unauthorized');
                return
            }

            await this.securityService.updateSessionTime(refreshToken)
            res
                .cookie('refreshToken',refreshToken, {httpOnly: true, secure: true,})
                .status(HTTP_STATUSES.OK_200)
                .json({accessToken: accessToken})
            return

        }catch (e){
            console.log(e)
            res
                .status(HTTP_STATUSES.UNAUTHORIZED_401)
                .json('Unauthorized')
            return
        }
    }
    async confirmation(req: RequestWithBody<{ code: string }> & { user: WithId<UserTypeDB> }, res: Response<any>) {
        try {

            const codeFromMessage: string = req.body.code

           const result =  await this.authService.confirmEmail(codeFromMessage)

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
    }
    async registration(req: RequestWithBody<CreateUserModel>, res: Response<any>) {
        try {

            const {email, login} = await this.usersService.createUser({
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

    }
    async resending(req: RequestWithBody<{email:string}>, res: Response<any>) {
        try {
            const email = await this.authService.resendEmailConfirmationMessage(req.body.email)

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

    }
    async authMe(req: Request & {user: WithId<UserTypeDB> }, res: Response<{
        email: string
        login: string
        userId: string
    }>) {
        try {



            const userId: string = req.user._id.toString()


            const user = await this.usersRepository.getUserById(userId);
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
    }
    async logout(req: Request<any> &{deviceId:string}, res: Response<any>) {
        try{


            const deviceId = req.deviceId

            const deletedDevice = await this.securityRepository.deleteAllSessionsByDeviceId(deviceId)
            if(!deletedDevice.acknowledged){
                res.status(HTTP_STATUSES.UNAUTHORIZED_401).send('Unauthorized');
                return
            }

            res
                .clearCookie('refreshToken')
                .sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return
        } catch (e) {
            res
                .status(HTTP_STATUSES.UNAUTHORIZED_401).json('Unauthorized')
            return
    }}
}
