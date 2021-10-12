const Eris = require("eris")
const fetch = require("node-fetch")
const config = require("./config.json")
const client = new Eris.Client(config.token)
client.options.allowedMentions.replied_user = true

let limit = config.limit
let messages = []

client.on("ready", () => {
    console.log("I'm ready!")
})
.on("messageCreate", async message => {
    if(message.content == "пиздеть" && message.author.id == client.user.id) {
        if(!client.pizdelka){
            console.log("fetching messages...")
            let start = Date.now()
            messages = await message.channel.getMessages({limit}).catch(console.error)
            limit = messages.length
            console.log(`fetched ${limit} msgs in ${(Date.now()-start)/1000} sec`)
            client.pizdelka = true
            client.pizdelkaid = message.channel.id
        }else if(client.pizdelka){
            messages = []
            delete client.pizdelka
            delete client.pizdelkaid
        }
    }
    else if(client.pizdelka && message.author.id != client.user.id && client.pizdelkaid == message.channel.id && (!config.users.length || config.users.includes(message.author.id))){
        const msg = messages[Math.floor(Math.random()*(limit+1))]
        let file = []
        if(msg.attachments.length) for(const attach of msg.attachments){
            file.push({
                name: attach.url.slice(attach.url.lastIndexOf("/")),
                file: await fetch(attach.url).then(r => r.buffer())
            })
        }
        await client.createMessage(message.channel.id, {content: msg.content, embed: msg.embed,
            messageReference: {channelID: message.channel.id, guildID: message.channel.guild.id, messageID: message.id}}, file).catch(console.error)
    }
})

client.connect().then(() => client.emit("ready"))
