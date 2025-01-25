import {UsersRepository} from "../../features/users/repository.users";
import {WithId} from "mongodb";
import {QueryModel} from "../../helpers/paginationQuereis";
import {RecoveryPasswordCodeModelType, UserDBType, UserTypeDB} from "../../types/types";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import bcrypt from "bcrypt";
import {v4 as uuidv4} from 'uuid';
import {add} from "date-fns";
import {emailsManager} from "../../managers/email.manager";


export class UsersService {

    usersRepository: UsersRepository

    constructor() {

        this.usersRepository = new UsersRepository()

    }

    async getUsers(
        paginationQueriesForUsers: QueryModel
    ) {
        const {pageSize, pageNumber, searchLoginTerm, searchEmailTerm} = paginationQueriesForUsers

        const users: WithId<UserTypeDB>[] = await this.usersRepository.getUsers(paginationQueriesForUsers)
        const totalCount = await this.usersRepository.getUsersCount({searchLoginTerm, searchEmailTerm})
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount,
            users
        }
    }
    async createUser({login, password, email, confirmed}: CreateUserModel) {

        const passwordSalt = await bcrypt.genSalt()
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser: UserDBType = new UserDBType({
            login,
            email,
            passwordSalt,
            passwordHash,
            createdAt: new Date().toISOString()
        }, {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(),
                {hours: 1, minutes: 0}),
            isConfirmed: !!confirmed
        })

        const foundObjectByLogin = await this.usersRepository.findByLoginOrEmail(login)

        const foundObjectByEmail = await this.usersRepository.findByLoginOrEmail(email)

        let result: WithId<UserTypeDB>[]
        let newUserFromDB: WithId<UserTypeDB> | null

        if (!foundObjectByLogin && !foundObjectByEmail) {
            result = await this.usersRepository.createUser(newUser)
            newUserFromDB = await this.usersRepository.getUserById(result[0]._id.toString())
            try {
                emailsManager.sendEmailConfirmationMessage(newUserFromDB).catch(e => {
                    console.log(e)
                    throw new Error('Mail not send')
                })

            } catch (e) {
                console.log(e)
                await this.usersRepository.deleteUserById(result[0]._id.toString())
                return null
            }
        }


        return {
            result,
            newUserFromDB,
            login: foundObjectByLogin,
            email: foundObjectByEmail,

        }
    }
    async deleteUserById(id: string) {
        const result = await this.usersRepository.deleteUserById(id)
        return result
    }
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
    async checkCredentials(loginOrEmail: string, password: string) {
        const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return false

        if (!user.emailConfirmation.isConfirmed) return false

        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        if (user.accountData.passwordHash === passwordHash) {
            return user
        } else {
            return false
        }
    }
    async createRecoveryCode(user: WithId<UserTypeDB>,email:string) {

        const recoveryCodeDBModel: RecoveryPasswordCodeModelType = {
            email,
            userId: user._id.toString(),
            recoveryCode: uuidv4(),
            expirationDate: add(new Date(), {minutes: 10})
        } // create recovery code

        await this.usersRepository.createRecoveryCode(recoveryCodeDBModel) // save recovery code to db


        emailsManager.sendPasswordRecoveryMessage(email, recoveryCodeDBModel.recoveryCode).catch(e => {
            console.log(e)
            throw new Error('Cant send mail')
        })
        return true
    }
    async changePasswordByRecoveryCode(code: string, newPassword: string) {
        const codeModelDB = await this.usersRepository.findRecoveryCodeDB(code)
        if (!codeModelDB) return false
        if (codeModelDB.expirationDate < new Date()) return false
        const user = await this.usersRepository.findByLoginOrEmail(codeModelDB.email)
        if (!user) return false

        const passwordSalt = await bcrypt.genSalt()
        const passwordHash = await this._generateHash(newPassword, passwordSalt)
        const res = await this.usersRepository.updatePassword(user._id.toString(), passwordHash, passwordSalt)


        return res.modifiedCount === 1
    }
}

