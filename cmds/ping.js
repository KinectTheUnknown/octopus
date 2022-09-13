exports.conf = {
  permLvl: 0,
  hide: false
}
exports.help = {
  name: "Ping",
  desc: "Ping the bot",
  syntax: "ping",
  usage: ["ping"]
}
const {stripIndents} = require("common-tags")
exports.run = async msg => {
  let m = await msg.channel.send("Ping")

  return m.edit(stripIndents`
    Pong!
    Api Latency: ${m.createdAt - msg.createdAt} ms
    Ws ping: ${msg.client.ws.ping.toFixed(0)} ms
  `)
}