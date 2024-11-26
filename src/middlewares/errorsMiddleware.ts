import {body, FieldValidationError, param, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../status.code";
import {blogCollection} from "../db/mongo.db";

export const idValidation = param("id").notEmpty().isString()

export const blogIdValidation =body("blogId").notEmpty().isString().custom(
    async (blogId) => await blogCollection.findOne({_id:blogId})).withMessage("blogId")

export const errorsMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const fieldErrors = errors.array({ onlyFirstError: true }).map((error: FieldValidationError) => ({
            message: error.msg,
            field: error.path
        }));


        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            errorsMessages:fieldErrors
        });
        return
    } else {
        next()
    }

}




export const blogInputValidationBodyMiddleware = [
    body("name").trim().notEmpty().isLength({max:15}),
    body('description').trim().notEmpty().isString().isLength({max:500}),
    body('websiteUrl').trim().notEmpty().isURL().isLength({max:100}),
    errorsMiddleware
]

export const postInputValidationBodyMiddleware = [
    body("title").trim().notEmpty().isLength({max:30}),
    body('shortDescription').trim().notEmpty().isString().isLength({max:100}),
    body('content').trim().notEmpty().isString().isLength({max:1000}),
    blogIdValidation,
    errorsMiddleware
]





