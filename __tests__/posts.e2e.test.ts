import {req} from "./test.helpers";
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/status.code";
import {authTestManager} from "./authTestManager";
import {postsTestManager} from "./postsTestManager";
import {codedAuth, expectedErrorPostModel, notValidPostModel} from "./datasets";
import {Collection, Db} from "mongodb";
import {ObjectModelFromDB, PostType} from "../src/types/types";
import {getInMemoryDb, stopInMemoryDb} from "./test.db";

describe('/posts', () => {

    let db: Db;
    let postCollection: Collection<PostType>;


    beforeAll(async () => {

        db = await getInMemoryDb()
        postCollection = db.collection<PostType>("posts");

        await req
            .delete(`${SETTINGS.PATH.TESTING}/all-data`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    beforeEach(async () => {
        await postCollection.deleteMany({})
    })

    afterAll(async () => {
        await stopInMemoryDb();
    })

    it('+GET Should return empty array with status 200', async () => {
        await req
            .get(SETTINGS.PATH.POSTS)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('-POST Should be unauthorized', async () => {

        const codedAuth = authTestManager.authForTests("Wrong token")

        await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': `Basic ${codedAuth}`})
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('-POST does not create the blog without required ore incorrect  data from client (name,description,URI)', async () => {


        await postsTestManager.createPost(codedAuth, HTTP_STATUSES.BAD_REQUEST_400, notValidPostModel, expectedErrorPostModel)

        const res = await req
            .get(SETTINGS.PATH.POSTS)
        expect(res.body).toEqual<ObjectModelFromDB<PostType>>({pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})


    })

    it('+POST create the entity with status 201 ', async () => {


        await postsTestManager.createPost(codedAuth)

    })

    it('-GET find some entity with wrong id ', async () => {
        await req
            .get(`${SETTINGS.PATH.POSTS}/wrong id`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('+GET find some entity by id', async () => {


        const res = await postsTestManager.createPost(codedAuth)

        const foundPost = await req
            .get(`${SETTINGS.PATH.POSTS}/${res.body.id}`)
            .expect(HTTP_STATUSES.OK_200)
        expect(res.body).toEqual<PostType>(foundPost.body)
    })

    it('-PUT does not change entity with incorrect data', async () => {

        const res = await postsTestManager.createPost(codedAuth)


        await req
            .put(`${SETTINGS.PATH.POSTS}/${res.body.id}`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send(notValidPostModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400,expectedErrorPostModel)
    })

    it('+PUT should change data with status code 204 if not beck status code 404', async () => {

        const res = await postsTestManager.createPost(codedAuth)

        await req
            .put(`${SETTINGS.PATH.POSTS}/${res.body.id}`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .send({
                title: 'Some title2',
                shortDescription: 'Some description2',
                content: 'Some content',
                blogId: res.body.blogId
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const getPostById = await req
            .get(`${SETTINGS.PATH.POSTS}/${res.body.id}`)

        expect(getPostById.body).toEqual<PostType>({
            id: res.body.id,
            title: 'Some title2',
            shortDescription: 'Some description2',
            content: 'Some content',
            blogId: res.body.blogId,
            blogName: res.body.blogName,
            createdAt: res.body.createdAt
        })

    })

    it('-DELETE does not delete the entity with wrong id', async () => {

        await req
            .delete(`${SETTINGS.PATH.POSTS}/wrong id`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('+DELETE should delete the entity by id', async () => {

        const res = await postsTestManager.createPost(codedAuth)

        await req
            .delete(`${SETTINGS.PATH.POSTS}/${res.body.id}`)
            .set({'Authorization': `Basic ${codedAuth}`})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await req
            .get(`${SETTINGS.PATH.POSTS}/${res.body.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })


})


