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
        return await usersCollection.countDocuments(filter)
    },
    createUser: async (newUser:OptionalId<UserType>)=>{
        return await usersCollection.insertOne(newUser)
    },
    getUserById: async (id:string)=>{
        return await usersCollection.findOne({_id: new ObjectId(id)})
    },
    getUser: async ({login,password}:{login:string,password:string})=>{

        const filter: any = {}
        if (login) filter.login = login;
        if (password) filter.password = password;
        const keys = Object.keys(filter);
        if (keys.length === 0) {
            return null;
        }
        return await usersCollection.findOne({ [keys[0]]: filter[keys[0]] })
    },
    deleteUserById: async (id:string)=>{
        return await usersCollection.deleteOne({_id: new ObjectId(id)})
    }
}