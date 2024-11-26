import {MongoDBType} from "../types/types";


export const db: Partial<MongoDBType> = {
    blogs: [],
    posts: [],
}


export const setDB = (dataset?: Partial<MongoDBType>) => {
    if (!dataset) {
        db.blogs = []
        db.posts = []
        return
    }

    db.blogs = dataset.blogs || db.blogs
    db.posts = dataset.posts || db.posts
}