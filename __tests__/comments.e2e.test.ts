import {Collection, Db} from "mongodb";
import {CommentType} from "../src/types/types";
import {getInMemoryDb, stopInMemoryDb} from "./test.db";
import {req} from "./test.helpers";
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/status.code";

describe('/Comments', () => {
    let db: Db
    let commentsCollection: Collection<CommentType>

    beforeAll(async () => {
        db = await getInMemoryDb()
        commentsCollection = db.collection<CommentType>('comments')

        await req
            .delete(`${SETTINGS.PATH.TESTING}/all-data`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    beforeEach(async () => {
        await commentsCollection.deleteMany({})

    })
    afterAll(async () => {
        await stopInMemoryDb()
    })

    it('+Should return empty array with status 200', async () => {
        await req
            .get(SETTINGS.PATH.COMMENTS)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })
})