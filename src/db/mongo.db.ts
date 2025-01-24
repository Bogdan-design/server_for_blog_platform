import {Collection, Db, MongoClient} from "mongodb";
import {
    BlackListRefreshTokensType,
    BlogType,
    CommentType,
    PostType,
    DeviceSessionDBType, SessionType,
    UserTypeDB, RecoveryPasswordCodeModelType
} from "../../src/types/types";
import {SETTINGS} from "../settings";
import mongoose from "mongoose";
import {BlogSchema, PasswordRecoverySchema, UserDBSchema, UserSchema} from "./schema";

const client: MongoClient = new MongoClient(SETTINGS.MONGO_URI)
export const db: Db = client.db(SETTINGS.DB_NAME);

// export const blogCollection: Collection<BlogType> = db.collection<BlogType>(SETTINGS.BLOG_COLLECTION_NAME)
export const postCollection: Collection<PostType> = db.collection<PostType>(SETTINGS.POST_COLLECTION_NAME)
// export const usersCollection: Collection<UserTypeDB> = db.collection<UserTypeDB>(SETTINGS.USERS_COLLECTION_NAME)
export const commentsCollection: Collection<CommentType> = db.collection<CommentType>(SETTINGS.COMMENTS_COLLECTION_NAME)
export const blackListCollection: Collection<BlackListRefreshTokensType> = db.collection<BlackListRefreshTokensType>(SETTINGS.BLACK_LIST_REFRESH_TOKENS_NAME)
export const devicesCollection: Collection<DeviceSessionDBType> = db.collection<DeviceSessionDBType>(SETTINGS.SECURITY)
export const sessionCollection: Collection<SessionType> = db.collection<SessionType>(SETTINGS.SESSIONS)


export const PasswordRecoveryModel = mongoose.model<RecoveryPasswordCodeModelType>(SETTINGS.RECOVERY_PASSWORD, PasswordRecoverySchema)
export const BlogModel = mongoose.model<BlogType>(SETTINGS.BLOG_COLLECTION_NAME, BlogSchema)
export const UserModel = mongoose.model<UserTypeDB>(SETTINGS.USERS_COLLECTION_NAME,UserDBSchema)

export const connectToDB = async () => {
    try {
        await client.connect()
        await mongoose.connect(SETTINGS.MONGO_URI+SETTINGS.DB_NAME)
        console.log('connected to db')
        return true
    } catch (e) {
        console.log('no connection with db')
        await client.close()
        await mongoose.disconnect()
        return false
    }
}