import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {SETTINGS} from "./settings";
import {blogsRouter} from "./features/blogs";
import {testRouter} from "./features/testing/testing";
import {postsRouter} from "./features/posts";
import {usersRouter} from "./features/users";
import {authRouter} from "./features/login";
import {commentsRouter} from "./features/comments";

export const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.use(cookieParser())
app.use(SETTINGS.PATH.LOGIN,authRouter)


app.use(SETTINGS.PATH.BLOGS,blogsRouter);
app.use(SETTINGS.PATH.COMMENTS,commentsRouter)
app.use(SETTINGS.PATH.POSTS,postsRouter);
app.use(SETTINGS.PATH.USERS,usersRouter);
app.use(SETTINGS.PATH.TESTING,testRouter);
