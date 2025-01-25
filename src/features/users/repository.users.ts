import {PasswordRecoveryModel, UserModel} from "../../db/mongo.db";
import {QueryModel} from "../../helpers/paginationQuereis";
import {ObjectId, WithId} from "mongodb";
import {RecoveryPasswordCodeModelType, UserTypeDB} from "../../types/types";

export class UsersRepository {
    async getUsers({pageSize, sortBy, pageNumber, sortDirection, searchLoginTerm, searchEmailTerm}: QueryModel) {


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
        return UserModel
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 'asc' : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();
    }

    async getUsersCount({searchLoginTerm, searchEmailTerm}: Partial<{
        searchLoginTerm: string,
        searchEmailTerm: string
    }>) {

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

        const totalCount = await UserModel.countDocuments(filter)
        return totalCount
    }

    async createUser(newUser: UserTypeDB) {

        return UserModel.insertMany([newUser])
    }

    async getUserById(id: string) {
        return UserModel.findOne({_id: new ObjectId(id)})
    }

    async findByLoginOrEmail(loginOrEmail: string) {

        let filter: any = {}
        if (loginOrEmail) {
            filter = {
                $or: [
                    {"accountData.login": {$regex: `^${loginOrEmail}$`, $options: "i"}},
                    {"accountData.email": {$regex: `^${loginOrEmail}$`, $options: "i"}}
                ]
            }
        }

        const result = await UserModel.findOne<WithId<UserTypeDB>>(filter)
        return result
    }

    async findUserByConfirmationCode(code: string) {
        return UserModel.findOne({'emailConfirmation.confirmationCode': {$regex: code}})
    }

    async deleteUserById(id: string) {
        return UserModel.deleteOne({_id: new ObjectId(id)})
    }

    async updateUserConfirmation(id: string) {
        const result = await UserModel.updateOne({_id: new ObjectId(id)}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    }

    async updateUserConfirmationCode(id: string, code: string) {
        const result = await UserModel.updateOne({_id: new ObjectId(id)}, {$set: {'emailConfirmation.confirmationCode': code}})
        return result.modifiedCount === 1
    }

    async createRecoveryCode(recoveryCodeModel: RecoveryPasswordCodeModelType) {
        return await PasswordRecoveryModel.insertMany([recoveryCodeModel])
    }

    async findRecoveryCodeDB(code: string) {
        return PasswordRecoveryModel.findOne({recoveryCode: code})
    }

    async updatePassword(userId: string, newPassword: string, passwordSalt: string) {
        return UserModel.updateOne({_id: new ObjectId(userId)}, {
            $set: {
                'accountData.passwordHash': newPassword,
                'accountData.passwordSalt': passwordSalt
            }
        })
    }
}

