import mongoose from "mongoose";
import {
    BlackListRefreshTokensType,
    BlogType,
    CommentType, DeviceSessionDBType,
    LikeInfoType, LikeStatusEnum,
    PostType,
    RecoveryPasswordCodeModelType, SessionType, UserDBType,
    UserType
} from "../types/types";

export const BlogSchema = new mongoose.Schema<BlogType>({
    id: String,
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: String, required: true},
    isMembership: {type: Boolean, required: true},
});

export const LikeInfoSchema = new mongoose.Schema<LikeInfoType>({
    likesCount: {type: Number, required: true},
    dislikesCount: {type: Number, required: true},
})
export const PostSchema = new mongoose.Schema<PostType>({
    id: String,
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: String, required: true},
    extendedLikesInfo: {type: LikeInfoSchema, required: true}
})

export const LikesForPostsSchema = new mongoose.Schema({
    addedAt:{type:String,required:true},
    status:{type:String,required:true},
    userId:{type:String,required:true},
    login:{type:String,required:true},
    postId:{type:String,required:true}

})


export const LikesSchema = new mongoose.Schema({
        createdAt: {type: Date, required: true},
        status: {type: String, enum: Object.values(LikeStatusEnum), required: true},
        authorId: {type: String, required: true},
        commentId: {type: String, required: true},
    }
)



export const CommentsSchema = new mongoose.Schema<CommentType>({
    id: String,
    postId: {type: String, required: true},
    content: {type: String, required: true},
    commentatorInfo: {
        userId: {type: String, required: true},
        userLogin: {type: String, required: true}
    },
    createdAt: {type: String, required: true},
    likesInfo: {type: LikeInfoSchema, required: true}
})

export const PasswordRecoverySchema = new mongoose.Schema<RecoveryPasswordCodeModelType>({
    email: {type: String, required: true},
    userId: {type: String, required: true},
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
    accountData: {type: UserSchema},
    emailConfirmation: {
        confirmationCode: {type: String, required: true},
        expirationDate: {type: Date, required: true},
        isConfirmed: {type: Boolean, required: true}
    }
})

export const BlackListRefreshTokenSchema = new mongoose.Schema<BlackListRefreshTokensType>({
    refreshToken: {type: String, required: true},
})

export const DeviceSessionSchema = new mongoose.Schema<DeviceSessionDBType>({
    userId: {type: String, required: true},
    deviceId: {type: String, required: true},
    title: {type: String, required: true},
    exp: {type: String, required: true},
    iat: {type: String, required: true},
    ip: {type: String, required: true},
    baseUrl: {type: String, required: true}
})

export const SessionSchema = new mongoose.Schema<SessionType>({
    ip: {type: String, required: true},
    url: {type: String, required: true},
    date: {type: Date, required: true}
})