import express, { Express, Request, Response } from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import {SETTINGS} from "./settings";
import {authRouter} from "./features/login";
import {blogsRouter} from "./features/blogs";
import {commentsRouter} from "./features/comments";
import {postsRouter} from "./features/posts";
import {usersRouter} from "./features/users";
import {testRouter} from "./features/testing/testing";
import {securityRouter} from "./features/security";


export const setupApp = (app: Express) => {
    app.use(express.json());
    app.use(cors())

    app.get('/', (req: Request, res: Response) => {
        res.status(200).send('Hello world!');
    });

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

    return app;
};