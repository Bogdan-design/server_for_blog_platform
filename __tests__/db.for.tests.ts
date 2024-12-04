import { MongoMemoryServer } from 'mongodb-memory-server'
import {MongoClient} from "mongodb";

// // запуск виртуального сервера с временной бд
// const server = await MongoMemoryServer.create()
//
// const uri = server.getUri()
// const client: MongoClient = new MongoClient(uri)
//
// // ...
//
// // остановка виртуально сервера с бд после выполнения тестов
// await server.stop()
