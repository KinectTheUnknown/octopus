exports.conf = {
  args: 1,
  permLvl: 4,
  hide: false
}
exports.help = {
  name: "Reload",
  desc: "Reload a command",
  syntax: "reload (cmd|evt) [name]",
  usage: ["reload ping"]
}
const Cmd = require("./")
const Evt = require("../events")
exports.run = (msg, [type, name]) => {
  if (!name) {
    name = type
    type = "cmd"
  }
  switch (type.toLowerCase()) {
    case "command":
    case "cmd": {
      let cmd = Cmd.resolveKey(name)
      if (!cmd)
        return msg.channel.send("Unable to resolve cmd")
      
      Cmd.reload(cmd)
    } break
    case "event":
    case "evt":
      if (!Evt.has(name))
        return msg.channel.send("Unable to resolve event")
      
      Evt.reload(name)
      break
    default:
      return msg.channel.send(`Syntax: ${exports.help.syntax}`)
  }

  return msg.channel.send(`Successfully reloaded ${name} ${type}`)
}