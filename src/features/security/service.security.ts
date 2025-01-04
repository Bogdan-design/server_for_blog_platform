import {SecurityDBType, SessionType} from "../../types/types";
import {securityRepository} from "../../features/security/repository.security";

export const securityService ={
    async saveSession (data: SessionType){

        const newSession: SecurityDBType = {
            ip: data.ip,
            baseUrl: data.baseUrl,
            date: new Date().toISOString()
        }

        const res = await securityRepository.saveSession(newSession)
        if(!res.acknowledged){
            throw new Error('Error while saving session')
        }



        return{

        }
    }

}