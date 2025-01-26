import {Response} from "express";
import {HTTP_STATUSES} from "../../status.code";
import {paginationQueries, QueryModel} from "../../helpers/paginationQuereis";
import {
    ExpectedErrorObjectType,
    ObjectModelFromDB,
    RequestWithBody,
    RequestWithParams,
    UserType,
    UserTypeDB
} from "../../types/types";
import {UsersService} from "../../features/users/usersService";
import {WithId} from "mongodb";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import {UserId} from "../../features/users/models/URIParamsUserIdModel";
import {inject, injectable} from "inversify";


const getUsersViewModel = (dbUser: WithId<UserTypeDB>): UserType => {
    return {
        id: dbUser._id.toString(),
        login: dbUser.accountData.login,
        email: dbUser.accountData.email,
        createdAt: dbUser.accountData.createdAt,
    }
}

@injectable()
export class UsersController {


    constructor(@inject(UsersService) protected usersService: UsersService){}

    async getUsers(req: any, res: Response<ObjectModelFromDB<UserType> | { error: string }>): Promise<void> {
        // RequestWithQuery<QueryModel>
        try {
            const query = req.query
            const paginationQueriesForUsers: QueryModel = paginationQueries(query)

            const usersFromDB = await this.usersService.getUsers(
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
                    items: usersFromDB.users.map(getUsersViewModel)
                })
            return

        } catch (e) {
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({error: 'Not Found'})
            return
        }
    }

    async createUser(req: RequestWithBody<CreateUserModel>,
                     res: Response<UserType | { error: string } | ExpectedErrorObjectType>) {
        try {


            const {login, newUserFromDB, email, result} = await this.usersService.createUser({
                login: req.body.login,
                password: req.body.password,
                email: req.body.email,
                confirmed: true
            });


            if (login) {
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

            if (email) {
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


            if (!result[0]) {
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

        } catch (e) {
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({error: "Not Found"})
            return
        }
    }

    async deleteUser(req: RequestWithParams<UserId> & {}, res: Response<{ error: string }>) {
        try {
            if (!req.params.id) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Not Found"})
                return
            }

            const resDelete = await this.usersService.deleteUserById(req.params.id)

            if (resDelete.deletedCount === 0) {
                res
                    .status(HTTP_STATUSES.NOT_FOUND_404)
                    .json({error: "Not Found"})
                return
            }
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
            return

        } catch (e) {
            res
                .status(HTTP_STATUSES.NOT_FOUND_404)
                .json({error: "Not Found"})
            return
        }
    }
}

