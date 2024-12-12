import {usersCollection} from "../../db/mongo.db";
import {QueryModel} from "../../helpers/paginationQuereis";
import {ObjectId} from "mongodb";

export const repositoryUsers = {
    getUsers: async ({pageSize, sortBy, pageNumber, sortDirection, searchLoginTerm, searchEmailTerm}: QueryModel) => {



        let filter:any = {}
        if(searchLoginTerm || searchEmailTerm){
            filter = {$or: [{email: {$regex:searchEmailTerm,$options:"i"}}, {login: {$regex:searchLoginTerm,$options:"i"}}]}
        }
        return await usersCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();
    },

    getUsersCount: async ({searchLoginTerm, searchEmailTerm}: Partial<{
        searchLoginTerm: string,
        searchEmailTerm: string
    }>) => {

        let filter:any = {}
        if(searchLoginTerm || searchEmailTerm){
            filter = {$or: [{email: {$regex:searchEmailTerm,$options:"i"}}, {login: {$regex:searchLoginTerm,$options:"i"}}]}
        }

        const totalCount = await usersCollection.countDocuments(filter)
        return totalCount
    },
    createUser: async (newUser: {
        login: string
        email: string
        passwordSalt: string
        passwordHash: string
        createdAt: string
    }) => {


        return await usersCollection.insertOne(newUser)
    },
    getUserById: async (id: string) => {
        return await usersCollection.findOne({_id: new ObjectId(id)})
    },
    findByLoginOrEmail: async (loginOrEmail: string) => {

        let filter:any = {}
        if(loginOrEmail){
            filter = {
                $or: [
                    { email: { $regex: `^${loginOrEmail}$`, $options: 'i' } },
                    { login: { $regex: `^${loginOrEmail}$`, $options: 'i' } }
                ]
            }
        }

        const result = await usersCollection.findOne(filter)
        return result
    },
    deleteUserById: async (id: string) => {
        return await usersCollection.deleteOne({_id: new ObjectId(id)})
    },
}