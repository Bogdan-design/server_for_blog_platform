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
    extendedLikesInfo:LikeInfoType
}

export type NewestLikeType = {
    addedAt: string;
    userId: string;
    login: string;
    postId?: string
}


export type OutputPostModelType = PostType & {
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: LikeStatusEnum;
        newestLikes: Array<NewestLikeType>;
    };
};


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

export type LikeForPostType = {
    addedAt:string
    status:LikeStatusEnum
    userId:string
    login:string
    postId:string
}

export type LikeForCommentType ={
    createdAt: string
    status: LikeStatusEnum
    authorId: string
    commentId: string
}

export type LikeInfoType = {
    likesCount: number
    dislikesCount: number
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


export enum LikeStatusEnum {
    lIKE = 'Like',
    DISLIKE = 'Dislike',
    NONE = 'None'
}
