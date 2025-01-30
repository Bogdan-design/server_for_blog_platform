import {
    BlackListRefreshTokensType,
    BlogType,
    CommentType,
    DeviceSessionDBType,
    LikeForCommentType,
    LikeForPostType,
    PostType,
    RecoveryPasswordCodeModelType,
    SessionType,
    UserTypeDB
} from "../../src/types/types";
import {SETTINGS} from "../settings";
import mongoose from "mongoose";
import {
    BlackListRefreshTokenSchema,
    BlogSchema,
    CommentsSchema,
    DeviceSessionSchema,
    LikesForPosts,
    LikesSchema,
    PasswordRecoverySchema,
    PostSchema,
    SessionSchema,
    UserDBSchema
} from "./schema";

// const client: MongoClient = new MongoClient(SETTINGS.MONGO_URI)
// export const db: Db = client.db(SETTINGS.DB_NAME);

// export const blogCollection: Collection<BlogType> = db.collection<BlogType>(SETTINGS.BLOG_COLLECTION_NAME)
// export const postCollection: Collection<PostType> = db.collection<PostType>(SETTINGS.POST_COLLECTION_NAME)
// export const usersCollection: Collection<UserTypeDB> = db.collection<UserTypeDB>(SETTINGS.USERS_COLLECTION_NAME)
// export const commentsCollection: Collection<CommentType> = db.collection<CommentType>(SETTINGS.COMMENTS_COLLECTION_NAME)
// export const blackListCollection: Collection<BlackListRefreshTokensType> = db.collection<BlackListRefreshTokensType>(SETTINGS.BLACK_LIST_REFRESH_TOKENS_NAME)
// export const devicesCollection: Collection<DeviceSessionDBType> = db.collection<DeviceSessionDBType>(SETTINGS.SECURITY)
// export const sessionCollection: Collection<SessionType> = db.collection<SessionType>(SETTINGS.SESSIONS)


export const BlogModel = mongoose.model<BlogType>(SETTINGS.BLOG_COLLECTION_NAME, BlogSchema)
export const PostModel = mongoose.model<PostType>(SETTINGS.POST_COLLECTION_NAME, PostSchema)
export const CommentsModel = mongoose.model<CommentType>(SETTINGS.COMMENTS_COLLECTION_NAME, CommentsSchema)
export const UserModel = mongoose.model<UserTypeDB>(SETTINGS.USERS_COLLECTION_NAME,UserDBSchema)
export const BlackLIstRefreshTokensModel  = mongoose.model<BlackListRefreshTokensType>(SETTINGS.BLACK_LIST_REFRESH_TOKENS_NAME,BlackListRefreshTokenSchema)
export const DevicesModel = mongoose.model<DeviceSessionDBType>(SETTINGS.SECURITY, DeviceSessionSchema)
export const SessionModel = mongoose.model<SessionType>(SETTINGS.SESSIONS, SessionSchema)
export const PasswordRecoveryModel = mongoose.model<RecoveryPasswordCodeModelType>(SETTINGS.RECOVERY_PASSWORD, PasswordRecoverySchema)
export const LikesModel = mongoose.model<LikeForCommentType>(SETTINGS.LIKES, LikesSchema)
export const LikeForPostsModel = mongoose.model<LikeForPostType>(SETTINGS.POSTS_LIKES,LikesForPosts)



export const connectToDB = async () => {
    try {
        // await client.connect()
        await mongoose.connect(SETTINGS.MONGO_URI+SETTINGS.DB_NAME)
        console.log('connected to db')
        return true
    } catch (e) {
        console.log('no connection with db')
        // await client.close()
        await mongoose.disconnect()
        return false
    }
}