import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {SETTINGS} from "./settings";
import {testRouter} from "./features/testing/testing";
import session from "express-session";
import {authRouter} from "./features/login";
import {blogsRouter} from "./features/blogs";
import {commentsRouter} from "./features/comments";
import {postsRouter} from "./features/posts";
import {usersRouter} from "./features/users";
import {securityRouter} from "./features/security";


export const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.use(cookieParser())
app.set('trust proxy', true)
const sass = {
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true,maxAge: 30 * 60 * 1000}
}

app.use(session(sass))

app.use(SETTINGS.PATH.LOGIN, authRouter)
app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter)
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.TESTING, testRouter);
app.use(SETTINGS.PATH.SECURITY, securityRouter);
