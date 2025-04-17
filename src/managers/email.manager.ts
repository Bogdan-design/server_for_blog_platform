import {UserTypeDB} from "../types/types";
import {WithId} from "mongodb";
import {emailAdapter} from "../adapters/email.adapter";

export const emailsManager = {
    async sendEmailConfirmationMessage(newUserFromDB: WithId<UserTypeDB>) {
        await emailAdapter.sendEmail({
            email:newUserFromDB.accountData.email,
            message: `<h1>Thanks for your registration</h1>
        <p>To finish registration please, follow the link below:
            <a href='https://somesite.com/confirm-email?code=${newUserFromDB.emailConfirmation.confirmationCode}'>complete registration</a>
        </p>`,
            subject: 'Please confirm your email'
        })
    },
    async sendPasswordRecoveryMessage(email:string, recoveryCode: string) {
        await emailAdapter.sendEmail({
            email: email,
            message: `<h1>Recovery password</h1>
        <p>To recover your password please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>${recoveryCode}</a>
        </p>`,
            subject: 'Recover password'
        })
    }

}



