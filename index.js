const Eris = require("eris")
const fetch = require("node-fetch")
const client = new Eris.Client(require("./config.json").token)
client.options.allowedMentions.everyone = false
client.options.allowedMentions.roles = false
client.options.allowedMentions.users = false
client.options.allowedMentions.repliedUser = true

let limit = 10000
let messages = []

client.on("ready", () => {
    console.log("I'm ready!")
})
.on("messageCreate", async message => {
    if(message.content == "p!zdelka" && message.author.id == client.user.id) {
        if(!client.pizdelka){
            await message.channel.createMessage("собираем мусор")
            let start = Date.now()
            messages = await message.channel.getMessages({limit}).catch(async e => await message.channel.createMessage(`:warning: пошел нахуй \n\`\`\`${e.message}\`\`\``))
            limit = messages.length
            await message.channel.createMessage(`я могу пиздеть ура (${limit} за ${(Date.now()-start)/1000} сек)`)
            client.pizdelka = true
            client.pizdelkaid = message.channel.id
        }else if(client.pizdelka){
            messages = []
            delete client.pizdelka
            delete client.pizdelkaid
        }
    }
    else if(client.pizdelka && message.author.id != client.user.id && client.pizdelkaid == message.channel.id){
        const msg = messages[Math.floor(Math.random()*(limit+1))]
        let file = []
        if(msg.attachments.length) for(const attach of msg.attachments){
            file.push({
                name: attach.url.slice(attach.url.lastIndexOf("/")),
                file: await fetch(attach.url).then(r => r.buffer())
            })
        }
        await client.createMessage(message.channel.id, {content: msg.content, embed: msg.embed,
            messageReference: {channelID: message.channel.id, guildID: message.channel.guild.id, messageID: message.id}}, file).catch(() => void 0)
    }
})

client.connect().then(() => client.emit("ready"))