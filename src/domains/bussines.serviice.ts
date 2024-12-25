import {emailsManager} from "../managers/email.manager";

export const businessService = {
    async doSomething() {
        let user:any
        await emailsManager.sendEmailConfirmationMessage(user)
    }
}