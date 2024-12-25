import {repositoryUsers} from "../../features/users/repository.users";
import {emailsManager} from "../../managers/email.manager";

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
            await emailsManager.sendEmailConfirmationMessage(user)
        } catch (e) {
            return false
        }
        return true
    }
}