import {repositoryUsers} from "../../features/users/repository.users";

export const authService = {
    async confirmEmail(code: string) {
        const user = await repositoryUsers.findUserByConfirmationCode(code)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate < new Date()) return false
        const result = await repositoryUsers.updateUserConfirmation(user._id.toString())
        return result
    }
}