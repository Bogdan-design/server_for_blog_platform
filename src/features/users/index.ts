import {Response, Router} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {paginationQueries, QueryModel} from "../../helpers/paginationQuereis";
import {
    ExpectedErrorObjectType,
    ObjectModelFromDB,
    RequestWithBody,
    RequestWithParams,
    RequestWithQuery,
    UserType
} from "../../types/types";
import {serviceUsers} from "../../features/users/service.users";
import {WithId} from "mongodb";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {UserId} from "../../features/users/models/URIParamsUserIdModel";
import {idValidation, userInputValidationBodyMiddleware} from "../../middlewares/errorsMiddleware";
import {repositoryUsers} from "../../features/users/repository.users";

export const usersRouter = Router();

const getUsersViewModel = (dbUser: WithId<UserType>): UserType => {
    return {
        id: dbUser._id.toString(),
        login: dbUser.login,
        email: dbUser.email,
        createdAt: dbUser.createdAt,
    }
}

export const usersController = {
    getUsers: async (req: RequestWithQuery<QueryModel>, res:  Response<ObjectModelFromDB<UserType> | { error: string }>) => {
        try {
            const paginationQueriesForUsers: QueryModel = paginationQueries(req)

            const usersFromDB = await serviceUsers.getUsers(
                paginationQueriesForUsers
            )


            if (!usersFromDB) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Not Found"})
                return
            }
            res
                .status(HTTP_STATUSES.OK_200)
                .json({
                    pagesCount: usersFromDB.pagesCount,
                    page: usersFromDB.page,
                    pageSize: usersFromDB.pageSize,
                    totalCount: usersFromDB.totalCount,
                    items: usersFromDB.items.map(getUsersViewModel)
                })
            return

        } catch (e) {
            res.status(HTTP_STATUSES.NOT_FOUND_404).json({
                'error': 'Not Found'
            })
            return
        }
    },
    createUser: async (req:RequestWithBody<CreateUserModel>, res: Response<UserType | {error: string} | ExpectedErrorObjectType>) => {
        try{


            const {isLogin,newUserFromDB,isEmail,result} = await serviceUsers.createUser({
                login:req.body.login,
                password:req.body.password,
                email:req.body.email
            });

            if(!isLogin) {
                res
                    .status(HTTP_STATUSES.UNAUTHORIZED_401)
                    .json({
                        errorsMessages: [
                            {
                                field: 'login',
                                message: 'login should be unique'
                            }
                        ]
                    })
                return
            }

            if(!isEmail) {
                res
                    .status(HTTP_STATUSES.UNAUTHORIZED_401)
                    .json({
                        errorsMessages: [
                            {
                                field: 'email', 
                                message: 'email should be unique'
                            }
                        ]
                    })
                return
            }


            if (!result.insertedId) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Not Found"})
                return
            }
            if (!newUserFromDB) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Not Found"})
                return
            }
            res
                .status(HTTP_STATUSES.CREATED_201)
                .json(getUsersViewModel(newUserFromDB))
            return

        }catch(e){
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({error:"Not Found"})
            return
        }
    },
    deleteUser: async (req: RequestWithParams<UserId>, res: Response<{error:string}>) => {
        try{
            if(!req.params.id){
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Not Found"})
                return
            }

            const resDelete = await serviceUsers.deleteUserById(req.params.id)

            if(resDelete.deletedCount ===0){
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error:"Not Found"})
                return
            }
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        }catch(e){
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({error:"Not Found"})
            return
        }
    },
}

usersRouter.get('/', usersController.getUsers)
usersRouter.post('/',authMiddleware,userInputValidationBodyMiddleware, usersController.createUser)
usersRouter.delete('/:id',authMiddleware, idValidation, usersController.deleteUser)