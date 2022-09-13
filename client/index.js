const {Client, Intents} = require("discord.js")
const intents = new Intents()
  .add(Intents.FLAGS.GUILDS)
  .add(Intents.FLAGS.GUILD_MESSAGES)
  .add(Intents.FLAGS.DIRECT_MESSAGES)
module.exports = new Client({intents, partials: ["CHANNEL"]})