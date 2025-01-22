import {repositoryUsers} from "../../features/users/repository.users";
import {InsertOneResult, WithId} from "mongodb";
import {QueryModel} from "../../helpers/paginationQuereis";
import {RecoveryPasswordCodeModelType, UserTypeDB} from "../../types/types";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import bcrypt from "bcrypt";
import {v4 as uuidv4} from 'uuid';
import {add} from "date-fns";
import {emailsManager} from "../../managers/email.manager";


export const serviceUsers = {
    async getUsers(
        paginationQueriesForUsers: QueryModel
    ) {
        const {pageSize, pageNumber, searchLoginTerm, searchEmailTerm} = paginationQueriesForUsers

        const users: WithId<UserTypeDB>[] = await repositoryUsers.getUsers(paginationQueriesForUsers)
        const totalCount = await repositoryUsers.getUsersCount({searchLoginTerm, searchEmailTerm})
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            users
        }
    },
    async createUser({login, password, email, confirmed}: CreateUserModel) {

        const passwordSalt = await bcrypt.genSalt()
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser = {
            accountData: {
                login,
                email,
                passwordSalt,
                passwordHash,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(),
                    {hours: 1, minutes: 0}),
                isConfirmed: !!confirmed
            }

        }

        const foundObjectByLogin = await repositoryUsers.findByLoginOrEmail(login)

        const foundObjectByEmail = await repositoryUsers.findByLoginOrEmail(email)

        let result: InsertOneResult<WithId<UserTypeDB>> | null
        let newUserFromDB: WithId<UserTypeDB> | null

        if (!foundObjectByLogin && !foundObjectByEmail) {
            result = await repositoryUsers.createUser(newUser)

            newUserFromDB = await repositoryUsers.getUserById(result.insertedId.toString())
            try {
                emailsManager.sendEmailConfirmationMessage(newUserFromDB).catch(e => {
                    console.log(e)
                    throw new Error('Mail not send')
                })

            } catch (e) {
                console.log(e)
                await repositoryUsers.deleteUserById(result.insertedId.toString())
                return null
            }
        }


        return {
            result,
            newUserFromDB,
            login: foundObjectByLogin,
            email: foundObjectByEmail,

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

        if (!user.emailConfirmation.isConfirmed) return false

        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        if (user.accountData.passwordHash === passwordHash) {
            return user
        } else {
            return false
        }
    },
    async createRecoveryCode(user: WithId<UserTypeDB>,email:string) {

        const recoveryCodeDBModel: RecoveryPasswordCodeModelType = {
            email,
            userId: user._id.toString(),
            recoveryCode: uuidv4(),
            expirationDate: add(new Date(), {minutes: 10})
        } // create recovery code

        await repositoryUsers.createRecoveryCode(recoveryCodeDBModel) // save recovery code to db


        emailsManager.sendPasswordRecoveryMessage(email, recoveryCodeDBModel.recoveryCode).catch(e => {
            console.log(e)
            throw new Error('Cant send mail')
        })
        return true
    },
    async changePasswordByRecoveryCode(code: string, newPassword: string) {
        const codeModelDB = await repositoryUsers.findRecoveryCodeDB(code)
        if (!codeModelDB) return false
        if (codeModelDB.expirationDate < new Date()) return false
        const user = await repositoryUsers.findByLoginOrEmail(codeModelDB.email)
        if (!user) return false

        const passwordSalt = await bcrypt.genSalt()
        const passwordHash = await this._generateHash(newPassword, passwordSalt)
        const res = await repositoryUsers.updatePassword(user._id.toString(), passwordHash, passwordSalt)


        return res.modifiedCount === 1
    }


}