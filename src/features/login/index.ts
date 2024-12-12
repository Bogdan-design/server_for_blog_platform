import {NextFunction, Response, Router} from "express";
import {RequestWithBody} from "../../types/types";
import {AuthLoginModel} from "../../features/login/AuthLoginModel";
import {serviceUsers} from "../../features/users/service.users";
import {HTTP_STATUSES} from "../../status.code";
import {loginInputValidationBodyMiddleware} from "../../middlewares/errorsMiddleware";

export const loginRouter = Router()

export const loginController = {
    async authenticate(req: RequestWithBody<AuthLoginModel>, res: Response, next: NextFunction) {
        try {
            const {loginOrEmail, password} = req.body;

            const isAuthenticated = await serviceUsers.checkCredentials(loginOrEmail, password);

            if (!isAuthenticated) {
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

            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
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

loginRouter.post('/', loginInputValidationBodyMiddleware, loginController.authenticate)