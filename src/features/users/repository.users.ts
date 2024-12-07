import {usersCollection} from "../../db/mongo.db";
import {QueryModel} from "../../helpers/paginationQuereis";
import {ObjectId, OptionalId} from "mongodb";
import {UserType} from "../../types/types";

export const repositoryUsers ={
    getUsers: async ({pageSize,sortBy,pageNumber,sortDirection,searchLoginTerm,searchEmailTerm}: QueryModel) => {

        const filter: any = {}
        if (searchLoginTerm) filter.login = { $regex: searchLoginTerm, $options: "i" };
        if (searchEmailTerm) filter.email = { $regex: searchEmailTerm, $options: "i" };
        return await usersCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber-1)*pageSize)
            .limit(pageSize)
            .toArray();
    },
    getUsersCount:async ({searchLoginTerm,searchEmailTerm}: Partial<{searchLoginTerm:string,searchEmailTerm:string}>) => {

        const filter: any = {}
        if (searchLoginTerm) filter.login = { $regex: searchLoginTerm, $options: "i" };
        if (searchEmailTerm) filter.email = { $regex: searchEmailTerm, $options: "i" }

        console.log(filter)
        return await usersCollection.countDocuments(filter)
    },
    createUser: async (newUser:OptionalId<UserType>)=>{
        return await usersCollection.insertOne(newUser)
    },
    getUserById: async (id:string)=>{
        return await usersCollection.findOne({_id: new ObjectId(id)})
    },
    deleteUserById: async (id:string)=>{
        return await usersCollection.deleteOne({_id: new ObjectId(id)})
    }
}