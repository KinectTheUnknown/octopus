const db = require("./db")
const client = require("./client")
const cmdHandler = require("./cmds")
const evtHandler = require("./events")
const {stripIndent} = require("common-tags")
async function main() {
  await Promise.all([
    db.init(),
    cmdHandler.init(),
    evtHandler.init()
  ])
  console.log(stripIndent`
    Loaded:
      Events: ${evtHandler.size}
      Cmds: ${cmdHandler.size}
  `)

  return client.login(process.env.TOKEN)
}
main()