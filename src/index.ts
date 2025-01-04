import {app} from "./app";
import {SETTINGS} from "./settings";
import {connectToDB} from "./db/mongo.db";

app.listen(SETTINGS.PORT,async () => {
    await connectToDB()
    console.log('...server started in port ' + SETTINGS.PORT)
})

console.log('Hello world')
