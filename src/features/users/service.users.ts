import {repositoryUsers} from "../../features/users/repository.users";
import {WithId} from "mongodb";
import {QueryModel} from "../../helpers/paginationQuereis";
import {UserType} from "../../types/types";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";

export const serviceUsers = {
    getUsers: async (
        paginationQueriesForUsers: QueryModel
    ) => {
        const {pageSize,pageNumber,searchLoginTerm,searchEmailTerm} =  paginationQueriesForUsers

        const users : WithId<UserType>[] = await repositoryUsers.getUsers(paginationQueriesForUsers)
        console.log(users)
        const usersCount = await repositoryUsers.getUsersCount({searchLoginTerm,searchEmailTerm})
        console.log(usersCount)
        return {
            pagesCount: Math.ceil(usersCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: usersCount,
            items: users
        }
    },
    createUser: async (newUser:UserType)=>{
        const result = await repositoryUsers.createUser(newUser)
        const newUserFromDB = await repositoryUsers.getUserById(result.insertedId.toString())

        return {
            result,
            newUserFromDB
        }
    },
    deleteUserById: async (id: string) => {
        const result = await repositoryUsers.deleteUserById(id)
        return result
    }

}