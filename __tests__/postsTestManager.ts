import {SETTINGS} from "../src/settings";
import {req} from "./test.helpers";
import {HTTP_STATUSES, HttpStatusType} from "../src/status.code";
import {BlogType, ExpectedErrorObjectType} from "../src/types/types";
import {CreatePostModel} from "../src/features/posts/models/CreatePostModel";
import {blogsTestManager} from "./blogsTestManager";
import {newBlogModel} from "./datasets";


export const postsTestManager = {
    async createPost(codedAuth: string,
                     expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
                     data?: CreatePostModel,
                     expectedObject?: ExpectedErrorObjectType | BlogType) {

        const resBlog = await blogsTestManager.createBlog(newBlogModel, codedAuth)


        const newPost: CreatePostModel = {
            title: 'Some title',
            shortDescription: 'Some description',
            content: 'Some content',
            blogId: resBlog.body.id
        }


        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send(data || newPost)

        expect(res.status).toBe(expectedStatusCode);
        if (res.status === HTTP_STATUSES.CREATED_201) {
            expect(res.body).toEqual({
                id: res.body.id,
                title: res.body.title,
                shortDescription: res.body.shortDescription,
                content: res.body.content,
                blogId: res.body.blogId,
                blogName: res.body.blogName,
            })
        }

        if (expectedObject) {
            expect(res.body).toEqual(expectedObject);
        }
        return res
    }

}