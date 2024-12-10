import {usersCollection} from "../../db/mongo.db";
import {QueryModel} from "../../helpers/paginationQuereis";
import {ObjectId, OptionalId} from "mongodb";
import {UserType} from "../../types/types";
import {CreateUserModel} from "../../features/users/models/CreateUserModel";
import bcrypt from "bcrypt";

export const repositoryUsers = {
    getUsers: async ({pageSize, sortBy, pageNumber, sortDirection, searchLoginTerm, searchEmailTerm}: QueryModel) => {

        const filter: any = {}
        if (searchLoginTerm) filter.login = {$regex: searchLoginTerm, $options: "i"};
        if (searchEmailTerm) filter.email = {$regex: searchEmailTerm, $options: "i"};
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

        const filter: any = {}
        if (searchLoginTerm) filter.login = {$regex: searchLoginTerm, $options: "i"};
        if (searchEmailTerm) filter.email = {$regex: searchEmailTerm, $options: "i"}
        return await usersCollection.countDocuments(filter)
    },
    createUser: async (newUser: {
        login:string
        email:string
        passwordSalt:string
        passwordHash:string
        createdAt:string
    }) => {


        return await usersCollection.insertOne(newUser)
    },
    getUserById: async (id: string) => {
        return await usersCollection.findOne({_id: new ObjectId(id)})
    },
    findByLoginOrEmail: async (loginOrEmail:string) => {

        const user = await usersCollection.findOne({$or:[{email:loginOrEmail},{login:loginOrEmail}]})
        return user
    },
    deleteUserById: async (id: string) => {
        return await usersCollection.deleteOne({_id: new ObjectId(id)})
    },
}