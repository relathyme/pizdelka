const Eris = require("eris")
const fetch = require("node-fetch")
const config = require("./config.json")
const client = new Eris.Client(config.token)
client.options.allowedMentions.replied_user = true

let limit = config.limit
let messages = []

function u(){
    let uptime=require("os").uptime()
    let m=Math.floor(uptime/60%60)
    let h=Math.floor(uptime/60/60%24)
    let d=Math.floor(uptime/60/60/24)
    const name=`for ${d}d ${h}h ${m}m`
    return client.editStatus("online", {name})
}

client.once("ready", () => {
    u()
    setInterval(u, 60000)
    console.log("I'm ready!")
})
.on("messageCreate", async message => {
    if(message.content == config.phrase && (message.author.id == client.user.id || message.author.id == config.owner)) {
        if(!client.pizdelka){
            console.log("fetching messages...")
            let start = Date.now()
            let channel = client.getChannel(config.channel) || message.channel
            messages = await channel.getMessages({limit}).catch(console.error)
            limit = messages.length
            console.log(`fetched ${limit} msgs from ${channel.name} in ${(Date.now()-start)/1000} sec`)
            client.pizdelka = true
            client.pizdelkaid = message.channel.id
        }else if(client.pizdelka){
            messages = []
            delete client.pizdelka
            delete client.pizdelkaid
        }
    }
    else if(client.pizdelka && message.author.id != client.user.id && client.pizdelkaid == message.channel.id && (!config.users.length || config.users.includes(message.author.id))){
        const msg = messages[Math.floor(Math.random()*limit)]
        let file = []
        if(msg.attachments.length) for(const attach of msg.attachments){
            file.push({
                name: attach.url.split("?")[0].slice(attach.url.lastIndexOf("/")).slice(1),
                file: await fetch(attach.url).then(r => r.buffer())
            })
        }
        await client.createMessage(message.channel.id, {content: msg.content, embed: msg.embed,
            messageReference: {channelID: message.channel.id, guildID: message.channel.guild.id, messageID: message.id}}, file).catch(console.error)
    }
})
.on("messageCreate", async message => {
    if(message.author.id!=config.owner) return
    if(message.content.split(" ")[0]==config.prefix+"eval"){
        const code=message.content.split(" ").slice(1).join(" ")
        const acode=`(async () => {${code}})()`
        try{
            let result=await eval(acode)
            if(typeof result != "string") result=require("util").inspect(result)
            await client.createMessage(message.channel.id, `\`\`\`js\n${result}\`\`\``)
        }catch(error){
            await client.createMessage(message.channel.id, `\`\`\`js\n${error}\`\`\``)
        }
    }
    if(message.content.split(" ")[0]==config.prefix+"exec"){
        const command=message.content.split(" ").slice(1).join(" ")
        try{
            let result=require("child_process").execSync(command).toString()
            await client.createMessage(message.channel.id, `\`\`\`sh\n${result}\`\`\``)
        }catch(error){
            await client.createMessage(message.channel.id, `\`\`\`sh\n${error}\`\`\``)
        }
    }
})
.on("error", console.error)

client.connect().then(() => client.emit("ready"))
