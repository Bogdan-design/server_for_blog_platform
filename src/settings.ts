import {config} from 'dotenv'
config()

export const SETTINGS = {

    PORT: process.env.PORT || 3000,
    PATH:{
        BLOGS:'/blogs',
        POSTS:'/posts',
        TESTING:'/testing',
    },
    AUTH_TOKEN:process.env.AUTH_TOKEN || 'admin:qwerty',
    MONGO_URI:process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    DB_NAME:'sprint_3',
    BLOG_COLLECTION_NAME:'blogs',
    POST_COLLECTION_NAME:'posts'

}