import {Request, Response, Router} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {paginationQueries, QueryModel} from "../../helpers/paginationQuereis";
import {ObjectModelFromDB, RequestWithBody, RequestWithParams, RequestWithQuery, UserType} from "../../types/types";
import {serviceUsers} from "../../features/users/service.users";
import {WithId} from "mongodb";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import {authMiddleware} from "../../middlewares/authMiddleware";
import {UserId} from "../../features/users/models/URIParamsUserIdModel";

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
            console.log(`controller :${usersFromDB}`)

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
    createUser: async (req:RequestWithBody<CreateUserModel>, res: Response<UserType | {error: string}>) => {
        try{
            const newUser: UserType = {
                login: req.body.login,
                email: req.body.email,
                createdAt: new Date().toISOString()
            }

            const {result,newUserFromDB} = await serviceUsers.createUser(newUser)
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

        }catch(e){
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({error:"Not Found"})
            return
        }
    },
}

usersRouter.get('/', usersController.getUsers)
usersRouter.post('/',authMiddleware, usersController.createUser)
usersRouter.delete('/:id',authMiddleware, usersController.deleteUser)