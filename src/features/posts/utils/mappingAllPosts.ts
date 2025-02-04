import {LikeForPostType, LikeStatusEnum, ObjectModelFromDB, PostType} from "../../../types/types";
import {ObjectId, WithId} from "mongodb";

export const mappingAllPosts = (
    item:WithId<PostType>,
    likes:WithId<LikeForPostType>[],
    posts:ObjectModelFromDB<WithId<PostType>>,
    userId?:ObjectId) =>{


    console.log(item, ' item')
    console.log(likes, ' likes')
    console.log(posts, ' posts')
    console.log(userId, ' userId')
    let status: {postId:string,likeStatus:LikeStatusEnum}[] =[]

    if (userId) {
        const myLikes = likes.filter(like => {
            if (like.userId === userId.toString()) return like
        })
        status = posts.items.map(post => {
            const like = myLikes.find(like => like.postId === post._id.toString());
            return {
                postId: post._id.toString(),
                likeStatus: like ? like.status : LikeStatusEnum.NONE
            };
        });
    }

    const newestLikes = (postId: string) => likes
        .filter(like => like.status === LikeStatusEnum.lIKE && like.postId === postId)
        .map(like => ({
            addedAt: like.addedAt,
            userId: like.userId,
            login: like.login
        }))
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, 3);

    return {
        id: item._id.toString(),
        title: item.title,
        shortDescription: item.shortDescription,
        content: item.content,
        blogId: item.blogId,
        blogName: item.blogName,
        createdAt: item.createdAt,
        extendedLikesInfo: {
            likesCount: item.extendedLikesInfo.likesCount,
            dislikesCount: item.extendedLikesInfo.dislikesCount,
            myStatus: userId ? status.find(s => item._id.toString() === s.postId)?.likeStatus : LikeStatusEnum.NONE,
            newestLikes: newestLikes(item._id.toString()) || []
        },

    }
}