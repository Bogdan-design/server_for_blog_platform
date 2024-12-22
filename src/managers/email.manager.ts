import {UserTypeDB} from "../types/types";
import {WithId} from "mongodb";

export const emailsManager = {
    async sendEmailConfirmationMessage(newUserFromDB: WithId<UserTypeDB>) {
        // send email
    }
}