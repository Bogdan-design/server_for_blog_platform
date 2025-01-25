import {emailsManager} from "../../managers/email.manager";
import {v4 as uuidv4} from "uuid";
import {UsersRepository} from "../../features/users/repository.users";

export class authService {
    repositoryUsers: UsersRepository

    constructor() {
        this.repositoryUsers = new UsersRepository()
    }

    async confirmEmail(code: string) {
        const user = await this.repositoryUsers.findUserByConfirmationCode(code)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate < new Date()) return false
        const result = await this.repositoryUsers.updateUserConfirmation(user._id.toString())
        return result
    }

    async resendEmailConfirmationMessage(email: string) {
        const user = await this.repositoryUsers.findByLoginOrEmail(email)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        try {
            const newCode = uuidv4()
            await this.repositoryUsers.updateUserConfirmationCode(user._id.toString(), newCode)
            const userWithNewConfirmationCode = await this.repositoryUsers.findByLoginOrEmail(email)
            emailsManager.sendEmailConfirmationMessage(userWithNewConfirmationCode).catch(e => {
                console.log(e)
                throw new Error('Cant send mail')
            })
        } catch (e) {
            return false
        }
        return true
    }

}