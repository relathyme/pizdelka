const Eris = require("eris")
const fs=require("fs")
const config = require("./config.json")
const client = new Eris.Client(config.token)

let limit = config.limit
let messages = []

client.once("ready", () => {
    console.log("I'm ready!")
})
.once("shardReady", async () => {
    console.log("fetching messages...")
    let start = Date.now()
    let channel = client.getChannel(config.channel_from)
    messages = await channel.getMessages({limit}).catch(console.error)
    limit = messages.length
    console.log(`fetched ${limit} msgs from ${channel.name} in ${(Date.now()-start)/1000} sec`)
    const amessages=messages.filter(m=>m.content.length>0).map(m=>m.content)
    const amessages_json=JSON.stringify(amessages)
    fs.writeFileSync("data.json", amessages_json)
    client.disconnect()
    process.exit()
})
.on("error", console.error)
process.on("uncaughtException", console.error).on("unhandledRejection", console.error)

client.connect().then(() => client.emit("ready"))
