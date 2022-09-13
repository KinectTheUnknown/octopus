exports.conf = {
  permLvl: 4,
  hide: false
}
exports.help = {
  name: "Restart",
  desc: "Restart the bot",
  syntax: "restart",
  usage: ["restart"]
}
exports.run = async msg => {
  await Promise.all([
    msg.channel.send("Restarting bot..."),
    msg.client.user.setStatus("away")
  ])

  return process.exit()
}