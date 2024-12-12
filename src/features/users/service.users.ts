import {repositoryUsers} from "../../features/users/repository.users";
import {WithId} from "mongodb";
import {QueryModel} from "../../helpers/paginationQuereis";
import {UserType} from "../../types/types";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import bcrypt from "bcrypt";

export const serviceUsers = {
    async getUsers(
        paginationQueriesForUsers: QueryModel
    ) {
        const {pageSize, pageNumber, searchLoginTerm, searchEmailTerm} = paginationQueriesForUsers

        const users: WithId<UserType>[] = await repositoryUsers.getUsers(paginationQueriesForUsers)
        const totalCount = await repositoryUsers.getUsersCount({searchLoginTerm, searchEmailTerm})
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            items: users
        }
    },
    async createUser({login, password, email}: CreateUserModel) {

        const passwordSalt = await bcrypt.genSalt()
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser = {
            login,
            email,
            passwordSalt,
            passwordHash,
            createdAt: new Date().toISOString()
        }

        const foundObjectByLogin = await repositoryUsers.findByLoginOrEmail(login)

        const foundObjectByEmail = await repositoryUsers.findByLoginOrEmail(email)

        let result
        let newUserFromDB

        if (!foundObjectByLogin && !foundObjectByEmail) {

            result = await repositoryUsers.createUser(newUser)

            newUserFromDB = await repositoryUsers.getUserById(result.insertedId.toString())
        }


        return {
            result,
            newUserFromDB,
            login: foundObjectByLogin,
            email: foundObjectByEmail
        }
    },
    async deleteUserById(id: string) {
        const result = await repositoryUsers.deleteUserById(id)
        return result
    },
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    },
    async checkCredentials(loginOrEmail: string, password: string) {
        const user = await repositoryUsers.findByLoginOrEmail(loginOrEmail)
        if (!user) return false

        const passwordHash = await this._generateHash(password, user.passwordSalt)

        return user.passwordHash === passwordHash
    }

}