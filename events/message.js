const Cmd = require("../cmds")
const config = require("../config.json")
const reqPerms = ["SEND_MESSAGES", "VIEW_CHANNEL"]
exports.run = async msg => {
  if (msg.author.bot)
    return
  
  if (!msg.guild)
    return
  
  if (!msg.guild.me.permissionsIn(msg.channel).has(reqPerms))
    return
  
  let prefix
  if (msg.content.startsWith(config.prefix)) {
    prefix = config.prefix
  } else {
    let ma = msg.content.match(`^<@!?${msg.client.user.id}>`)
    if (!ma)
      return
    
    prefix = ma[0]
  }
  const args = msg.content.slice(prefix.length).trim().split(/ +/g)
  let c = args.shift().toLowerCase()
  let cmd = Cmd.resolveCmd(c)
  if (!cmd)
    return
  
  let uLvl = permLvl(msg)
  if (cmd.conf.permLvl && cmd.conf.permLvl > uLvl)
    return msg.channel.send("You don't have permission to do that")
  
  if (cmd.conf.args > args.length)
    return msg.channel.send(`Syntax: ${cmd.help.syntax}`)
  
  try {
    await cmd.run(msg, args, {uLvl})
  } catch (e) {
    console.error(e)

    return msg.channel.send("An error has occurred:\n" + e.message)
      .catch(() => {})
  }
}
function permLvl(msg) {
  if (config.owners.includes(msg.author.id))
    return 4

  if (msg.author.id === msg.guild.ownerID)
    return 3

  //Admin
  /*if (msg.member.roles.has())
     return 2*/
  //Mod
  /*if (msg.member.roles.has())
     eturn 1*/
  return 0
}