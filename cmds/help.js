exports.conf = {
  permLvl: 0,
  hide: false
}
exports.help = {
  name: "Help",
  desc: "Get a list of commands or info of a command",
  syntax: "help (list|cmd)",
  usage: ["help list", "help ping"]
}
const Cmd = require("./")
const {MessageEmbed} = require("discord.js")
const {stripIndents} = require("common-tags")
exports.run = (msg, [name = "list"]) => {
  name = name.toLowerCase()
  if (name === "list") {
    return msg.channel.send(stripIndents`
      Commands (${Cmd.size}):
      ${Cmd.map(c => c.help.name).join(", ")}
    `)
  }
  let cmd = Cmd.resolveCmd(name)
  if (!cmd)
    return msg.channel.send("Unable to resolve command")
  
  let embed = new MessageEmbed()
    .setTitle("Command")
    .setDescription(cmd.help.desc)
    .addField("Permission Level", cmd.conf.permLvl)
    .addField("Aliases", cmd.help.aliases.join`, `)
    .addField("Syntax", cmd.help.syntax)
    .addField("Examples", cmd.help.usage.map(u => `\`${u}\``).join`\n`)
    .setFooter("Octopus", msg.client.user.displayAvatarURL)
    .setTimestamp(msg.createdAt)
  
  return msg.channel.send({embeds: [embed])
}