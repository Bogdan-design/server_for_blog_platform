import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";

let mongoServer: MongoMemoryServer | null = null;
let client: MongoClient | null = null;
let database: Db | null = null;


export async function getInMemoryDb(): Promise<Db> {

    if (database) {
        return database;
    }
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();


    database = client.db("test");

    return database;
}

export async function stopInMemoryDb() {
    if (client) {
        await client.close();
        client = null;
    }
    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
    database = null;
}
