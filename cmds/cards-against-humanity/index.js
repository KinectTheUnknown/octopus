const ms = require("ms")
const Game = require("./game.js")
const {stripIndent} = require("common-tags")
const {MessageEmbed} = require("discord.js")
const {dualColumn} = require("../../utils/array.js")
const games = new Map()
const yn = ["y", "yes", "t", "true", "n", "no", "f", "false"]
/** @type {import("../").CommandFile} */
module.exports = {
  conf: {
    permLvl: 0,
    args: 1
  },
  help: {
    name: "Cards-Against-Humanity",
    description: "Start the game of Cards Against Humanity",
    aliases: ["cah"],
    /*synax: [
    "**cah** [join|leave|start|reset|decks|leaderboard]",
    //eslint-disable-next-line max-len
    "**cah** set ([blank-cards|white-cards|points|filter|host|auto-choose] [value])",
    "**cah** [add|remove] [all|deckID|deckOwner deckName]"
  ]*/
    syntax: stripIndent`
    cah [join|leave|start|reset|decks|leaderboard
       | set ([blank-cards|white-cards|points|filter|host|auto-choose] [value])
       | [add|remove] (default|custom) [all|deckID|deckName]]
    `
  },
  //eslint-disable-next-line complexity
  run: async (msg, [sub, ...args]) => {
    let g = games.get(msg.channel.id)
    switch (sub.toLowerCase()) {
      case "join":
        if (!g) {
          g = new Game(msg.channel)
          await g.init()
          games.set(g.channel.id, g)
          msg.channel.send("A new game of CAH has been opened")
        } else if (g.players.has(msg.author.id))
          return msg.channel.send("You are already in this game")

        g.addPlayer(msg.author)
      
        return msg.reply("has joined the game")
      case "leave":
        if (!g)
          return msg.channel.send("There is no game running in this channel")

        if (!g.players.has(msg.author.id))
          return msg.channel.send("You are not in this game")

        g.removePlayer(msg.author)
        g.players.size || games.delete(msg.channel.id)
      
        return msg.reply("has left the game")
      case "start":
        if (!g)
          return msg.channel.send("There is no game running in this channel")
      
        if (g.ended)
          return msg.channel.send("Please reset the game before starting again")

        if (g.started)
          return msg.channel.send("The game already started")

        if (g.players.size < g.minPlayers)
          return msg.channel.send(
            `There must be at least ${g.minPlayers} players to start`
          )

        if (!g.deckManager.enabled.size)
          return msg.channel.send("There are no decks enabled")

        if (!g.deckManager.all("black")[0])
          return msg.channel.send("Deck needs black cards")

        if (!g.deckManager.all("white").some(c => c.type === "white"))
          return msg.channel.send("Deck needs white cards")

        await msg.channel.send("Starting game...")
        try {
          await g.start()
        } catch (e) {
          console.error(e)

          return msg.channel.send("An error has occurred:\n" + e.message)
        }
        break
      case "restart":
      case "reset":
        if (!g)
          return msg.channel.send("There is no game running in this channel")

        if (!g.ended)
          return msg.channel.send("The game hasn't ended yet")

        if (msg.author.id !== g.host.id)
          return msg.channel.send("Only the host can reset the game")

        g.reset()

        return msg.channel.send("Successfully resetted game")
      case "lb":
      case "leaderboard": {
        if (!g)
          return msg.channel.send("There is no game running in this channel")

        let lb = g.players
          .sort((a, b) => b.points - a.points)
          .first(5)
          .map((p, i) => ++i + `: ${p} (${p.points} points)`)
        let embed = new MessageEmbed()
          .setTitle("Octo-Games: CAH Leaderboard")
          .setColor(3447003)
          .setDescription(lb.join`\n`)
          .setTimestamp()
          .setFooter("Octo-games", msg.client.user.displayAvatarURL())

        return msg.channel.send({embeds: [embed]})
      }
      case "decks": {
        if (!g)
          return msg.channel.send("There is no game running in this channel")

        let eArr = dualColumn([...g.deckManager.enabled].sort(), 10, false)
        let dArr = dualColumn([...g.deckManager.disabled].sort(), 10, false)
        let embed = new MessageEmbed()
          .setTitle("Octo-Games: CAH Decks")
          .setColor(3447003)
          .addField("Enabled:", cb(eArr.join`\n` || "None"))
          .addField("Disabled:", cb(dArr.join`\n` || "None"))
          .setTimestamp()
          .setFooter("Octo-games", msg.client.user.displayAvatarURL())

        return msg.channel.send({embeds: [embed]})
      }
      case "add":
      case "enable": {
        if (!g)
          return msg.channel.send("There is no game running in this channel")

        if (g.started ^ g.ended)
          return msg.channel.send("The game already started")

        if (msg.author.id !== g.host.id)
          return msg.channel.send("Only the host can edit the decks")

        if (!args[0])
          return msg.channel.send("You must provide a deck name to enable")

        let type = 0
        switch (args[0].toLowerCase()) {
          case "all": {
            for (let id of g.deckManager.disabled)
              g.deckManager.disable(id)

            return msg.channel.send("Successfully enabled all decks")
          }
          case "custom":
            type = 1
          case "default":
            args.shift()
            break
        }
        let req = args.join` `.toLowerCase()
        //Default decks
        let res = g.deckManager.findKey((d, k) => req === k.toLowerCase())
        if (!res)
          return msg.channel.send("I couldn't find that deck")

        if (g.deckManager.enabled.has(res))
          return msg.channel.send("That deck is already enabled")

        g.deckManager.enable(res)

        return msg.channel.send(`Successfully enabled the ${res} deck`)
      }
      case "remove":
      case "disable": {
        if (!g)
          return msg.channel.send("There is no game running in this channel")

        if (g.started ^ g.ended)
          return msg.channel.send("The game already started")

        if (msg.author.id !== g.host.id)
          return msg.channel.send("Only the host can edit the decks")

        if (!args[0])
          return msg.channel.send("You must provide a deck name to disable")

        let req = args.join` `.toLowerCase()
        if (req === "all") {
          for (let id of g.deckManager.enabled)
            g.deckManager.disable(id)

          return msg.channel.send("Successfully disabled all decks")
        }
        let res = g.deckManager.findKey(
          (d, k) => [d.name, k].some(s => req === s.toLowerCase())
        )
        if (!res)
          return msg.channel.send("I couldn't find that deck")

        if (g.deckManager.disabled.has(res))
          return msg.channel.send("That deck is already disabled")

        g.deckManager.disable(res)

        return msg.channel.send(`Successfully disabled the ${res} deck`)
      }
      case "set":
      case "setting":
      case "settings":
        if (!g)
          return msg.channel.send("There is no game running in this channel")

        if (!args[0]) {
          let embed = new MessageEmbed()
            .setColor(3447003)
            .setTitle("Octo-Games: CAH Settings")
            .setDescription(stripIndent`
            Host: ${g.host}
            Points: ${g.points}
            White Cards: ${g.numHand}
            Blank Cards: ${g.deckManager.blank}
            Filter Explicit Cards: ${g.deckManager.filter}
            Auto-Choose Cards: ${g.autofillChoice}
            Player Response Time: ${ms(g.time, {long: true})}
            Czar Response Time: ${ms(g.czarTime, {long: true})}
          `)
            .setTimestamp()
            .setFooter("Octo-Games", msg.client.user.displayAvatarURL())

          return msg.channel.send({embeds: [embed]})
        }
        if (g.started ^ g.ended)
          return msg.channel.send("The game already started")

        if (msg.author.id !== g.host.id)
          return msg.channel.send("Only the host can change the settings")

        switch (args[0].toLowerCase()) {
          case "host": {
            let user = msg.mentions.users.firstKey()
            if (!user)
              return msg.channel.send(
                "You must mention the user you want to set as host"
              )

            if (!g.players.has(user))
              return msg.channel.send("That user isn't in this game")

            if (user === msg.author.id)
              return msg.channel.send("You are already the host")

            g.host = user

            return msg.channel.send(`<@${user}> is now the host`)
          }
          case "white":
          case "white-card":
          case "white-cards": {
            let num = parseInt(args[1])
            if (!num || num < 1)
              return msg.channel.send("You must provide a valid number")

            if (num === 1)
              return msg.channel.send("The amount must at least be 2")

            if (num > 10)
              return msg.channel.send("The amount can't be greater than 10")

            g.numHand = num

            return msg.channel.send("Successfully set white-cards to " + num)
          }
          case "blank":
          case "blank-card":
          case "blank-cards": {
            let num = parseInt(args[1])
            if (num < 0)
              return msg.channel.send("You must provide a valid number")

            if (num > 20)
              return msg.channel.send("The amount can't be greater than 20")

            g.deckManager.blank = num

            return msg.channel.send("Successfully set blank-cards to " + num)
          }
          case "point":
          case "points": {
            let num = parseInt(args[1])
            if (!num || num < 1)
              return msg.channel.send("You must provide a valid number")

            if (num === 1)
              return msg.channel.send("The amount must at least be 2")

            if (num > 20)
              return msg.channel.send("The amount can't be greater than 20")

            g.points = num

            return msg.channel.send("Successfully set points to " + num)
          }
          case "filter":
          case "filter-explicit":
          case "filter-explicit-cards": {
            if (!yn.includes(args[1].toLowerCase()))
              return msg.channel.send("Valid options: true, false")

            let val = ["y", "t"].some(s => args[1].toLowerCase().startsWith(s))
            g.deckManager.filter = val

            return msg.channel.send("Successfully set filter to " + val)
          }
          case "prt":
          case "player-time":
          case "player-res-time":
          case "player-response-time": {
            if (!g)
              return msg.channel.send("There is no game running in this channel")

            if (g.started)
              return msg.channel.send("The game already started")

            let time = ms(args.slice(1).join` `)
            if (time < 6e4)
              return msg.channel.send("The time cannot be less than a minute")

            if (time > 12e5)
              return msg.channel.send("The time cannot exceed 20 minutes")

            g.time = time

            return msg.channel.send(
              "Successfully set the Player Response Time to " + ms(time)
            )
          }
          case "crt":
          case "czar-time":
          case "czar-res-time":
          case "czar-response-time": {
            let time = ms(args.slice(1).join(" "))
            if (time < 6e4)
              return msg.channel.send("The time cannot be less than a minute")

            if (time > 12e5)
              return msg.channel.send("The time cannot exceed 20 minutes")

            g.czarTime = time

            return msg.channel.send(
              "Successfully set the Czar Response Time to " + ms(time)
            )
          }
          case "acc":
          case "auto-choose":
          case "auto-choose-card":
          case "auto-choose-cards": {
            if (!yn.includes(args[1].toLowerCase()))
              return msg.channel.send("Valid options: true, false")

            let val = ["y", "t"].some(s => args[1].toLowerCase().startsWith(s))
            g.deckManager.autofillChoice = val

            return msg.channel.send(
              "Successfully set Auto-Choose Cards to " + val
            )
          }
          default: {
            return msg.channel.send("Usage: " + this.help.syntax)
          }
        }
    }

    return msg.channel.send("Usage:\n" + this.help.syntax)
  }
}
function cb(str, code = "") {
  return "```" + code + "\n```"
}