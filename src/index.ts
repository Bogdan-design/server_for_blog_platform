import {SETTINGS} from "./settings";
import {connectToDB} from "./db/mongo.db";
import express from "express";
import {setupApp} from "./setup-app";


const app = express()
setupApp(app)

app.listen(SETTINGS.PORT,async () => {
    await connectToDB()
    console.log('...server started in port ' + SETTINGS.PORT)
})


console.log('Hello world')
