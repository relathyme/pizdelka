const Eris = require("eris")
const Markov = require('markov-strings').default
const config = require("./config.json")
const client = new Eris.Client(config.token)

const markov = new Markov({ stateSize: config.stateSize })

const messages = require("./data.json")
let markov_options = {
    maxTries: config.maxTries,
    prng: Math.random,
    filter: (result) => {
        const result_array = result.string.split(' ')
        return (result_array.length >= config.minWords) & (result_array[result_array.length - 1].length > 2)
    }
}

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
.once("shardReady", async () => {
    console.log("initializing markov chain...")
    markov.addData(messages)
    console.log("data imported")
    client.pizdelka = true
    client.pizdelkaid = config.channel_to
})
.on("messageCreate", async message => {
    if(client.pizdelka && message.author.id != client.user.id && client.pizdelkaid == message.channel.id && (!config.users.length || config.users.includes(message.author.id))){
        try{
            const msg = markov.generate(markov_options)
            await client.createMessage(message.channel.id, {content: msg.string,
                messageReference: {channelID: message.channel.id, guildID: message.channel.guild.id, messageID: message.id},
                allowedMentions: {everyone: false, roles: [], users: [message.author.id], repliedUser: true}}).catch(console.error)
        }catch(error){
            console.log(error)
        }
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
process.on("uncaughtException", console.error).on("unhandledRejection", console.error)

client.connect().then(() => client.emit("ready"))
