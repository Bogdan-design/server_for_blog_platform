import {body, FieldValidationError, param, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../status.code";
import {ObjectId} from "mongodb";
import {BlogModel, PasswordRecoveryModel} from "../db/mongo.db";

export const idValidation = param("id").notEmpty().isString()
// export const blogIdParamsValidation = param("blogId").notEmpty().isString().custom(
//     async (blogId: string) => {
//
//         const res = await BlogModel.findOne({_id: new ObjectId(blogId)})
//         if (!res) {
//             throw new Error("blogId not found")
//         }
//         return true
//     }).withMessage("Wrong blogId")
//
// export const postIdParamValidation = param('postId').trim().notEmpty().custom(
//     async (postId: string) => {
//         const res = await repositoryPosts.findPostByPostId(postId)
//         if (!res) {
//             throw new Error("blogId not found")
//         }
//         return true
//     }
// )
//
// export const commentIdParamValidation = param('commentId').trim().notEmpty().custom(
//     async (commentId: string) => {
//         const res = await blogCollection.findOne({_id: new ObjectId(commentId)})
//         if (!res) {
//             throw new Error("commentId not found")
//         }
//         return true
//     }
// )

export const blogIdValidation = body("blogId").notEmpty().isString().custom(
    async (blogId: string) => {

        const res = await BlogModel.findOne({_id: new ObjectId(blogId)})
        if (!res) {
            throw new Error("blogId not found")
        }
        return true
    })

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
    body("login").trim().notEmpty().isLength({min: 3, max: 10}).matches(/^[a-zA-Z0-9_-]*$/),
    body('password').trim().notEmpty().isString().isLength({min: 6, max: 20}),
    body('email').trim().notEmpty().isString().isEmail(),

    errorsMiddleware
]

export const authInputValidationBodyMiddleware = [
    body("loginOrEmail").trim().notEmpty(),
    body('password').trim().notEmpty(),
    errorsMiddleware
]

export const newPasswordInputValidationBodyMiddleware = [
    body('newPassword').trim().notEmpty().isLength({min: 6, max: 20}),
    body("recoveryCode").trim().notEmpty().isString().custom(async (recoveryCode: string) => {
        const res = await PasswordRecoveryModel.findOne({recoveryCode})
        if (!res) {
            throw new Error("recoveryCode is not correct")
        }
        return true
    }),
    errorsMiddleware
]

export const recoveryPasswordInputValidationBodyMiddleware = [
    body('email').trim().notEmpty().isString().isEmail(),
    errorsMiddleware
]

export const postInputValidationCommentBodyValidationMiddleware = [
    body('content').trim().notEmpty().isString().isLength({min: 20, max: 300}),
    errorsMiddleware
]

export const commentsInputValidationParamsMiddleware = [
    body('content').trim().notEmpty().isString().isLength({min: 20, max: 300}),
    errorsMiddleware
]

export const confirmationInputValidationBodyMiddleware = [
    body('code').trim().trim().notEmpty().isString().custom(
        async (code: string) => {
            const res = await BlogModel.findOne({_id: new ObjectId(code)})
            if (!res) {
                throw new Error("code is not correct")
            }
            return true
        }
    )
]

export const resendingEmailValidationBodyMiddleware= [
    body('email').trim().notEmpty().isEmail(),
    errorsMiddleware
]

export const registrationInputValidationBodyMiddleware = [
    body("login").trim().notEmpty().isLength({min: 3, max: 10}).matches(/^[a-zA-Z0-9_-]*$/),
    body("password").trim().notEmpty().isLength({min: 6, max: 20}),
    body("email").trim().notEmpty().isEmail(),
    errorsMiddleware
]

