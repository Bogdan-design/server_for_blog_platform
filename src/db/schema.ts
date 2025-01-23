import mongoose from "mongoose";
import {BlogType, RecoveryPasswordCodeModelType, UserDBType, UserType} from "../types/types";

export const BlogSchema = new mongoose.Schema<BlogType>({
    id: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: String, required: true},
    isMembership: {type: Boolean, required: true},
});

export const PasswordRecoverySchema = new mongoose.Schema<RecoveryPasswordCodeModelType>({
    email: {type: String, required: true},
    userId:{type: String, required: true},
    recoveryCode: {type: String, required: true},
    expirationDate: {type: Date, required: true},
})

export const UserSchema = new mongoose.Schema<UserType>({
    id: String,
    login: {type: String, required: true},
    email: {type: String, required: true},
    passwordSalt: String,
    passwordHash: String,
    createdAt: {type: String, required: true}
})

export const UserDBSchema = new mongoose.Schema<UserDBType>({
    accountData: [UserSchema],
    emailConfirmation: {
        confirmationCode: {type: String, required: true},
        expirationDate: {type: Date, required: true},
        isConfirmed: {type: Boolean, required: true}
    }
})