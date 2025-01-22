import {config} from 'dotenv'
config()

export const SETTINGS = {

    PORT: process.env.PORT || 3000,
    PATH:{
        BLOGS:'/blogs',
        POSTS:'/posts',
        USERS:'/users',
        TESTING:'/testing',
        LOGIN:'/auth',
        COMMENTS:'/comments',
        SECURITY:'/security'
    },
    AUTH_TOKEN:process.env.AUTH_TOKEN || 'admin:qwerty',
    MONGO_URI:process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    DB_NAME:'Blogs_Platform',
    BLOG_COLLECTION_NAME:'blogs',
    POST_COLLECTION_NAME:'posts',
    USERS_COLLECTION_NAME:'users',
    COMMENTS_COLLECTION_NAME:'comments',
    BLACK_LIST_REFRESH_TOKENS_NAME:'blackListRefreshTokens',
    SECURITY:'security',
    SESSIONS:'sessions',
    RECOVERY_PASSWORD:'recovery_password',
}