import {usersCollection} from "../../db/mongo.db";
import {QueryModel} from "../../helpers/paginationQuereis";
import {ObjectId, WithId} from "mongodb";
import {UserTypeDB} from "../../types/types";

export const repositoryUsers = {
    getUsers: async ({pageSize, sortBy, pageNumber, sortDirection, searchLoginTerm, searchEmailTerm}: QueryModel) => {


        let filter: any = {}
        if (searchLoginTerm || searchEmailTerm) {
            filter = {
                $or: [{email: {$regex: searchEmailTerm, $options: "i"}}, {
                    login: {
                        $regex: searchLoginTerm,
                        $options: "i"
                    }
                }]
            }
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

        let filter: any = {}
        if (searchLoginTerm || searchEmailTerm) {
            filter = {
                $or: [{email: {$regex: searchEmailTerm, $options: "i"}}, {
                    login: {
                        $regex: searchLoginTerm,
                        $options: "i"
                    }
                }]
            }
        }

        const totalCount = await usersCollection.countDocuments(filter)
        return totalCount
    },
    createUser: async (newUser: UserTypeDB) => {


        return await usersCollection.insertOne(newUser)
    },
    getUserById: async (id: string) => {
        return await usersCollection.findOne({_id: new ObjectId(id)})
    },
    findByLoginOrEmail: async (loginOrEmail: string) => {

        let filter: any = {}
        if (loginOrEmail) {
            filter = {
                $or: [
                    { "accountData.login": { $regex: `^${loginOrEmail}$`, $options: "i" } },
                    { "accountData.email": { $regex: `^${loginOrEmail}$`, $options: "i" } }
                ]
            }
        }

        const result = await usersCollection.findOne<WithId<UserTypeDB>>(filter)
        return result
    },

    findUserByConfirmationCode: async (code: string) => {
        return await usersCollection.findOne({'emailConfirmation.confirmationCode': {$regex: code}})
    },
    deleteUserById: async (id: string) => {
        return await usersCollection.deleteOne({_id: new ObjectId(id)})
    },
    updateUserConfirmation: async (id: string) => {
        const result = await usersCollection.updateOne({_id: new ObjectId(id)}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    },
    updateUserConfirmationCode: async (id: string, code: string) => {
        const result = await usersCollection.updateOne({_id: new ObjectId(id)}, {$set: {'emailConfirmation.confirmationCode': code}})
        return result.modifiedCount === 1
    }
}