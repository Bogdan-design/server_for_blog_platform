import {Collection, Db} from "mongodb";
import {DeviceSessionDBType} from "../src/types/types";
import {getInMemoryDb, stopInMemoryDb} from "./test.db";
import {req} from "./test.helpers";
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES} from "../src/status.code";

describe('/security', () => {
        let db: Db;
        let devisesCollection: Collection<DeviceSessionDBType>;


        beforeAll(async () => {

            db = await getInMemoryDb()
            devisesCollection = db.collection<DeviceSessionDBType>("devices");

            await req
                .delete(`${SETTINGS.PATH.TESTING}/all-data`)
                .expect(HTTP_STATUSES.NO_CONTENT_204)
        })

        beforeEach(async () => {
            await devisesCollection.deleteMany({})
        })

        afterAll(async () => {
            await stopInMemoryDb();
        })
        it('-GET Should not return list with devices for not unauthorized user with status 401', async () => {
            const res = await req
                .get(`${SETTINGS.PATH.SECURITY}/devices`)
            expect(res.status).toBe(401)
            expect(res.body.length).toEqual(0)
        })
        it('+GET Should return all active devices with status 200', async () => {
            const res = await req.get(`${SETTINGS.PATH.SECURITY}/devices`)
        })


    }
)