import {body, FieldValidationError, param, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../status.code";
import {blogCollection} from "../db/mongo.db";
import {ObjectId} from "mongodb";

export const idValidation = param("id").notEmpty().isString()
export const blogIdParamsValidation = param("blogId").notEmpty().isString().custom(
    async (blogId: string) => {

        const res = await blogCollection.findOne({_id: new ObjectId(blogId)})
        if (!res) {
            throw new Error("blogId not found")
        }
        return true
    }).withMessage("Wrong blogId")

export const blogIdValidation = body("blogId").notEmpty().isString().custom(
    async (blogId: string) => {

        const res = await blogCollection.findOne({_id: new ObjectId(blogId)})
        if (!res) {
            throw new Error("blogId not found")
        }
        return true
    }).withMessage("Wrong blogId")

export const errorsMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const fieldErrors = errors.array({onlyFirstError: true}).map((error: FieldValidationError) => ({
            message: error.msg,
            field: error.path
        }));


        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({
            errorsMessages: fieldErrors
        });
        return
    } else {
        next()
    }

}


export const blogInputValidationBodyMiddleware = [
    body("name").trim().notEmpty().isLength({max: 15}),
    body('description').trim().notEmpty().isString().isLength({max: 500}),
    body('websiteUrl').trim().notEmpty().isURL().isLength({max: 100}),
    errorsMiddleware
]

export const postInputValidationBodyMiddleware = [
    body("title").trim().notEmpty().isLength({max: 30}),
    body('shortDescription').trim().notEmpty().isString().isLength({max: 100}),
    body('content').trim().notEmpty().isString().isLength({max: 1000}),

    errorsMiddleware
]
export const userInputValidationBodyMiddleware = [
    body("login").trim().notEmpty().isLength({min:3,max: 10}).matches(/^[a-zA-Z0-9_-]*$/),
    body('password').trim().notEmpty().isString().isLength({min:6,max: 20}),
    body('email').trim().notEmpty().isString().isEmail(),

    errorsMiddleware
]




