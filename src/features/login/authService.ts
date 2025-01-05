import {repositoryUsers} from "../../features/users/repository.users";
import {emailsManager} from "../../managers/email.manager";
import {v4 as uuidv4} from "uuid";
import {SessionDBType, SessionType} from "../../types/types";
import {securityRepository} from "../../features/security/repository.security";

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
    },
    // async saveSession (data: SessionType){
    //
    //     const newSession: SessionDBType = {
    //         userId: data.ip,
    //         ip: data.ip,
    //         baseUrl: data.baseUrl,
    //         date: new Date().toISOString(),
    //         deviceId: uuidv4()
    //     }
    //
    //     const res = await securityRepository.saveSession(newSession)
    //     if(!res.acknowledged){
    //         throw new Error('Error while saving session')
    //     }
    //
    //
    //
    //     return{
    //
    //     }
    // },



}