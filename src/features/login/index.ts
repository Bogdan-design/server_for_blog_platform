import {NextFunction, Response, Router} from "express";
import {RequestWithBody} from "../../types/types";
import {AuthLoginModel} from "../../features/login/AuthLoginModel";
import {serviceUsers} from "../../features/users/service.users";
import {HTTP_STATUSES} from "../../status.code";
import {authInputValidationBodyMiddleware} from "../../middlewares/errorsMiddleware";
import {jwtService} from "../../application/jwt.service";

export const authRouter = Router()

export const authController = {
    async authenticate(req: RequestWithBody<AuthLoginModel>, res: Response, next: NextFunction) {
        try {
            const {loginOrEmail, password} = req.body;

            const user = await serviceUsers.checkCredentials(loginOrEmail, password);

            if (!user) {
                res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                    "errorsMessages": [
                        {
                            "message": "login or email incorrect",
                            "field": "login or email"
                        }
                    ]
                });
                return
            }

            const token = await jwtService.createJWT(user)
            if (!token) {
                res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({message:'Some going wrong token'})
                return
            }
            res.status(HTTP_STATUSES.OK_200).json({
                accessToken: token
            })
            return

        } catch (e: any) {
            res.status(HTTP_STATUSES.UNAUTHORIZED_401).json({
                "errorsMessages": [
                    {
                        "message": "login or email incorrect",
                        "field": "login or email"
                    }
                ]
            })
            return
        }

    }
}

authRouter.post('/login', authInputValidationBodyMiddleware, authController.authenticate)
authRouter.get('/me',authController.authenticate)