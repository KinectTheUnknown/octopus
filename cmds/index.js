const Handler = require("../handler")
const defs = {
  conf: {
    enabled: true,
    args: 0,
    permLvl: 0,
    hide: false
  },
  help: {
    name: "Unknown",
    desc: "No description provided",
    syntax: "Unknown"
  }
}

class CmdHandler extends Handler {
  constructor() {
    super(__dirname)
  }
  load(file) {
    let req = super.load(file)
    if (req.conf.enabled === false)
      return this.unload(file)
    
    if (typeof req.run !== "function")
      throw new TypeError()
    
    //req.run = req.run.bind(this)
    req.conf = {
      ...defs.conf,
      ...req.conf
    }
    req.help = {
      ...defs.help,
      aliases: [],
      usage: [],
      ...req.help
    }
    req.help.aliases = new Set(req.help.aliases)
    
    return req
  }
  resolveCmd(cmd) {
    return this.get(cmd) || this.find(c => c.help.aliases.has(cmd))
  }
  resolveKey(name) {
    return this.has(name) ? name : this.findKey(c => c.help.aliases.has(name))
  }
}
module.exports = new CmdHandler()
/**
 * @typedef {Object} CommandFile
 * @prop {Object} help
 * @prop {string} help.name
 * @prop {string} help.description
 * @prop {string} help.syntax
 * @prop {string[]} [help.usage]
 * @prop {string[]} help.aliases
 * @prop {Object} conf
 * @prop {number} permLvl
 * @prop {number} args
 * @prop {(msg: import("discord.js").Message & { channel: import("discord.js").TextChannel }, args: string[]) => unknown} run
 */