import {Request} from 'express'

export type ObjectModelFromDB<T> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[],
}
export type BlogType = {
    id?: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string,
    isMembership: boolean,
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

export type UserType = {
    id?: string
    login: string
    email: string
    passwordSalt?: string
    passwordHash?: string
    createdAt: string,
}

export type UserTypeDB= {
    accountData: UserType
    emailConfirmation: {
        confirmationCode: string
        expirationDate: Date
        isConfirmed: boolean
    }
}
export type RegistrationType = {
    login: string
    email: string
    password: string
}

export type CommentType = {
    id?: string
    postId: string
    content: string
    commentatorInfo: {
        userId:string
        userLogin:string
    }
    createdAt: string
}

type ErrorMessage = {
    message: string;
    field: string;
}
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

