exports.conf = {
  permLvl: 4,
  hide: false
}
exports.help = {
  name: "Evaluate",
  desc: "Evaluate js code",
  syntax: "eval [...code]",
  usage: ["eval 1 + 1"],
  aliases: ["eval"]
}
const Util = require("util")
exports.run = async (msg, args) => {
  try {
    let res = Util.inspect(await eval(args.join` `))
    console.log(res)

    return msg.channel.send(res.slice(0, 1900), {code: "js"})
  } catch (e) {
    console.error(e)

    return msg.channel.send("Fail:```\n" + e.message + "```")
  }
}