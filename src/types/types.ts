import {Request, Response} from 'express'
import {ObjectId} from "mongodb";

export type BlogType = {
    id?: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string,
    isMembership: boolean,
}

export type blogsFromDB = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BlogType[],
}

export type postsFromDB = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostType[],
}


export type PostType = {
    id?: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string,
}

type ErrorMessage = {
    message: string;
    field: string;
}

export type ErrorMessages = ErrorMessage[]

export type ExpectedErrorObjectType = {
    errorsMessages: ErrorMessage[]
}


export type MongoDBType = {
    blogs: BlogType[];
    posts: PostType[];
}

export type RequestWithBody<T> = Request<{}, {}, T>
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>
export type RequestWithParamsAndQuery<T, B> = Request<T, {}, {},B>

