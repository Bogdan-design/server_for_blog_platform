import {req} from "./test.helpers";
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/status.code";
import {blogsTestManager} from "./blogsTestManager";
import {UpdateBlogModel} from "../src/features/blogs/models/UpdateBlogModel";
import {authTestManager} from "./authTestManager";
import {codedAuth, expectedErrorBlogModel, newBlogModel, notValidBlogModel} from "./datasets";
import {Collection, Db} from "mongodb";
import {BlogType, ExpectedErrorObjectType, ObjectModelFromDB, PostType} from "../src/types/types";
import {getInMemoryDb, stopInMemoryDb} from "./test.db";


describe('/blogs', () => {
    let db: Db;
    let blogCollection: Collection<BlogType>;

    beforeAll(async () => {

        db = await getInMemoryDb()
        blogCollection = db.collection<BlogType>("blogs");

        await req
            .delete(`${SETTINGS.PATH.TESTING}/all-data`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    beforeEach(async () => {
        await blogCollection.deleteMany({})
    })

    afterAll(async () => {
        await stopInMemoryDb();
    })

    it('+Should return empty array with status 200', async () => {
        await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('-Should be unauthorized', async () => {

        const codedAuth = authTestManager.authForTests("Wrong token")
        await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': `Basic ${codedAuth}`})
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('-POST does not create the blog without required ore incorrect  data from client (name,description,URI) with status 400', async () => {

        await blogsTestManager
            .createBlog(notValidBlogModel, codedAuth, HTTP_STATUSES.BAD_REQUEST_400, expectedErrorBlogModel)

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
        expect(res.body).toEqual<ObjectModelFromDB<BlogType>>({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        })
    })

    it('+POST create the entity with status 201 ', async () => {

        const res = await blogsTestManager
            .createBlog(newBlogModel, codedAuth)

        expect(res.body).toEqual<BlogType>({
            id: res.body.id,
            createdAt: res.body.createdAt,
            isMembership: res.body.isMembership,
            name: res.body.name,
            description: res.body.description,
            websiteUrl: res.body.websiteUrl
        })
    })

    it('-GET does not find any post with wrong or unavailable blogId with status 404', async () => {
        await req
            .get(`${SETTINGS.PATH.BLOGS}/wrong id/posts`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

    })

    it('+GET find all posts by blogId with status 200', async () => {
        const res = await blogsTestManager.createBlog(newBlogModel, codedAuth)
        const blogId = res.body.id
        const resPost = await req
            .post(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send({
                title: "string",
                shortDescription: "string",
                content: "string"
            })
       await req
           .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
           .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [
                     {
                          id: resPost.body.id,
                          title: "string",
                          shortDescription: "string",
                          content: "string",
                          blogId,
                          blogName: res.body.name,
                          createdAt: resPost.body.createdAt
                     }
                ]
           })

    })

    it('-GET does not create post for special blog if the input model has incorrect values with status 400 ', async () => {
        const res = await blogsTestManager.createBlog(newBlogModel, codedAuth)
        const blogId = res.body.id
        const resPost = await req
            .post(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send({
                title: "",
                shortDescription: "",
                content: ""
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
        expect(resPost.body).toEqual<ExpectedErrorObjectType>({
            errorsMessages:[
                {
                    field: 'title',
                    message: 'Invalid value'
                },
                {
                    field: 'shortDescription',
                    message: 'Invalid value'
                },
                {
                    field: 'content',
                    message: 'Invalid value'
                }
            ]
        })

    })

    it('-Post dose not create post for special blogId if the blogId is wrong with status 404', async () =>{
        await req
            .post(`${SETTINGS.PATH.BLOGS}/wrong blogId/posts`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send({
                title: "string",
                shortDescription: "string",
                content: "string"
            })
            .expect(HTTP_STATUSES.NOT_FOUND_404,{
                errorsMessages:[
                    {
                        field: 'blogId',
                        message: 'Wrong blogId'
                    }
                ]
            })
    })
    it('+Post create post for special blogId with status 201', async()=>{
        const res = await blogsTestManager.createBlog(newBlogModel, codedAuth)
        const blogId = res.body.id
        const resPost = await req
            .post(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send({
                title: "string",
                shortDescription: "string",
                content: "string"
            })
            .expect(HTTP_STATUSES.CREATED_201)
        expect(resPost.body).toEqual<PostType>({
            id: resPost.body.id,
            title: "string",
            shortDescription: "string",
            content: "string",
            blogId,
            blogName: res.body.name,
            createdAt: resPost.body.createdAt
        })
    })

    it('-GET find some entity with wrong id with status 404 ', async () => {

        await req
            .get(`${SETTINGS.PATH.BLOGS}/wrong id`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('+GET find some entity by id', async () => {


        const res = await blogsTestManager.createBlog(newBlogModel, codedAuth)

        const foundBlog = await req
            .get(`${SETTINGS.PATH.BLOGS}/${res.body.id}`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual<BlogType>({
            id: foundBlog.body.id,
            name: foundBlog.body.name,
            createdAt: foundBlog.body.createdAt,
            isMembership: foundBlog.body.isMembership,
            description: foundBlog.body.description,
            websiteUrl: foundBlog.body.websiteUrl
        })
    })

    it('-PUT does not change entity with incorrect data', async () => {


        const res = await blogsTestManager.createBlog(newBlogModel, codedAuth)

        await req
            .put(`${SETTINGS.PATH.BLOGS}/${res.body.id}`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send(notValidBlogModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, expectedErrorBlogModel)
    })

    it('+PUT should change data with status code 204', async () => {


        const res = await blogsTestManager.createBlog(newBlogModel, codedAuth)

        const updatedBlogModel: UpdateBlogModel = {
            name: 'newBohdan',
            description: 'newSomething something',
            websiteUrl: 'https://www.linkedin.com/new'
        }

        await req
            .put(`${SETTINGS.PATH.BLOGS}/${res.body.id}`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send(updatedBlogModel)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const updatedRes = await req
            .get(`${SETTINGS.PATH.BLOGS}/${res.body.id}`)
            .expect(HTTP_STATUSES.OK_200);
        expect(updatedRes.body).toEqual<BlogType>({
            id: res.body.id,
            createdAt: res.body.createdAt,
            isMembership: res.body.isMembership,
            name: updatedBlogModel.name,
            description: updatedBlogModel.description,
            websiteUrl: updatedBlogModel.websiteUrl
        })
    })

    it('-DELETE does not delete the entity with wrong id', async () => {


        await req
            .delete(`${SETTINGS.PATH.BLOGS}/wrong id`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('+DELETE should delete the entity by id', async () => {

        const res = await blogsTestManager.createBlog(newBlogModel, codedAuth)

        await req
            .delete(`${SETTINGS.PATH.BLOGS}/${res.body.id}`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })


})


