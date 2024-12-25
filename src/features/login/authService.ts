import {repositoryUsers} from "../../features/users/repository.users";
import {emailsManager} from "../../managers/email.manager";
import {v4 as uuidv4} from "uuid";

export const authService = {
    async confirmEmail(code: string) {
        const user = await repositoryUsers.findUserByConfirmationCode(code)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate < new Date()) return false
        const result = await repositoryUsers.updateUserConfirmation(user._id.toString())
        return result
    },
    async resendEmailConfirmationMessage(email: string) {
        const user = await repositoryUsers.findByLoginOrEmail(email)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        try {
            const newCode = uuidv4()
            await repositoryUsers.updateUserConfirmationCode(user._id.toString(), newCode)
            const userWithNewConfirmationCode = await repositoryUsers.findByLoginOrEmail(email)
            await emailsManager.sendEmailConfirmationMessage(userWithNewConfirmationCode)
        } catch (e) {
            return false
        }
        return true
    }
}