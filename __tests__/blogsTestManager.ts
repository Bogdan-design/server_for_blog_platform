import {SETTINGS} from "../src/settings";
import {req} from "./test.helpers";
import {CreateBlogModel} from "../src/features/blogs/models/CreateBlogModel";
import {HTTP_STATUSES, HttpStatusType} from "../src/status.code";
import {BlogType, ExpectedErrorObjectType} from "../src/types/types";


export const blogsTestManager = {
    async createBlog(data: CreateBlogModel,
                     codedAuth:string,
                     expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201,
                     expectedObject?: ExpectedErrorObjectType | BlogType) {


        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send(data)

        expect(res.status).toBe(expectedStatusCode);

        if (expectedObject) {
            expect(res.body).toEqual(expectedObject);
        }
        return res
    }

}