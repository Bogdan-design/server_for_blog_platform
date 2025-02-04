import {ObjectId, WithId} from "mongodb";
import {LikeStatusEnum, NewestLikeType, OutputPostModelType, PostType} from "../../../types/types";
import {FlattenMaps, Schema} from "mongoose";

export const getPostViewModel = (
    dbPost: WithId<PostType>,
    likeStatus?: LikeStatusEnum,
    likes?: (FlattenMaps<{
        addedAt: string,
        status: LikeStatusEnum,
        userId: string,
        login: string,
        postId: string
    }> & { _id: ObjectId } & { __v: number })[]):

    OutputPostModelType => {

    let filteredLikes: NewestLikeType[] = []

    if (likes) {

        filteredLikes = likes.reduce((acc, like) => {
            if (like.status === LikeStatusEnum.lIKE) {
                acc.push({
                    addedAt: like.addedAt,
                    userId: like.userId,
                    login: like.login
                });
            }
            return acc;
        }, [] as NewestLikeType[])
            .sort((a, b) => new Date(b.addedAt)
                .getTime() - new Date(a.addedAt)
                .getTime())
            .slice(0, 3)

    }

    return {
        id: dbPost._id.toString(),
        title: dbPost.title,
        shortDescription: dbPost.shortDescription,
        content: dbPost.content,
        blogId: dbPost.blogId,
        blogName: dbPost.blogName,
        createdAt: dbPost.createdAt,
        extendedLikesInfo: {
            likesCount: dbPost.extendedLikesInfo.likesCount,
            dislikesCount: dbPost.extendedLikesInfo.dislikesCount,
            myStatus: likeStatus ? likeStatus : LikeStatusEnum.NONE,
            newestLikes:filteredLikes
        },

    }
}