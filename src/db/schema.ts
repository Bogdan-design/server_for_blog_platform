import mongoose from "mongoose";
import {BlogType, RecoveryPasswordCodeModelType} from "../types/types";

export const BlogSchema = new mongoose.Schema<BlogType>({
    id: String,
    name: String,
    description: String,
    websiteUrl: String,
    createdAt: String,
    isMembership: String,
});

export const PasswordRecoverySchema = new mongoose.Schema<RecoveryPasswordCodeModelType>({
    email: {type: String, required: true},
    userId:{type: String, required: true},
    recoveryCode: {type: String, required: true},
    expirationDate: {type: Date, required: true},
})
