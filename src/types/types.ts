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

export type SessionType = {
    ip: string | string []
    url: string
    date: Date
}

export type DeviceSessionDBType = {
    userId: string
    deviceId?: string
    title: string
    exp: string
    iat: string
    ip: string
    baseUrl: string
}

export class UserDBType {
    constructor(public accountData: UserType,
                public emailConfirmation: {
                    confirmationCode: string
                    expirationDate: Date
                    isConfirmed: boolean
                }) {

    }

}


export type UserTypeDB = {
    accountData: UserType
    emailConfirmation: {
        confirmationCode: string
        expirationDate: Date
        isConfirmed: boolean
    }
}

export type RecoveryPasswordCodeModelType = {
    email: string
    userId: string
    recoveryCode: string
    expirationDate: Date
}
export type RegistrationType = {
    login: string
    email: string
    password: string
}

export type BlackListRefreshTokensType = {
    refreshToken: string
}

export type LikeType={
    createdAt: string
    status: LikeStatus
    authorId: string
    parentId: string
}

export type LikeInfoType = {
    likesCount: number
    dislikesCount: number
    myStatus: LikeStatus
}

export type CommentType = {
    id?: string
    postId: string
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
    likes: LikeType[]
    likesInfo: LikeInfoType
}

type ErrorMessage = {
    message: string;
    field: string;
}

export type ExpectedErrorObjectType = {
    errorsMessages: ErrorMessage[]
}

export type RequestWithBody<T> = Request<{}, {}, T>
export type RequestWithQuery<T> = Request<{}, {}, {}, T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>
export type RequestWithParamsAndQuery<T, B> = Request<T, {}, {}, B>


export enum LikeStatus {
    like = 'like',
    dislike = 'dislike',
    None = 'None'
}
