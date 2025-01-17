import {Collection, Db, MongoClient} from "mongodb";
import {
    BlackListRefreshTokensType,
    BlogType,
    CommentType,
    PostType,
    DeviceSessionDBType, SessionType,
    UserTypeDB
} from "../../src/types/types";
import {SETTINGS} from "../settings";

const client: MongoClient = new MongoClient(SETTINGS.MONGO_URI)
export const db: Db = client.db(SETTINGS.DB_NAME);

export const blogCollection: Collection<BlogType> = db.collection<BlogType>(SETTINGS.BLOG_COLLECTION_NAME)
export const postCollection: Collection<PostType> = db.collection<PostType>(SETTINGS.POST_COLLECTION_NAME)
export const usersCollection: Collection<UserTypeDB> = db.collection<UserTypeDB>(SETTINGS.USERS_COLLECTION_NAME)
export const commentsCollection: Collection<CommentType> = db.collection<CommentType>(SETTINGS.COMMENTS_COLLECTION_NAME)
export const blackListCollection: Collection<BlackListRefreshTokensType> = db.collection<BlackListRefreshTokensType>(SETTINGS.BLACK_LIST_REFRESH_TOKENS_NAME)
export const devicesCollection: Collection<DeviceSessionDBType> = db.collection<DeviceSessionDBType>(SETTINGS.SECURITY)

export const connectToDB = async () => {
    try {
        await client.connect()
        console.log('connected to db')
        return true
    } catch (e) {
        console.log(e)
        await client.close()
        return false
    }
}