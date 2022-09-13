const {Collection} = require("discord.js")
const DeckManager = require("./deckManager")
const Player = require("./player.js")
const BlankCard = require("./blankCard.js")
const ArrUtil = require("../../utils/array.js")
module.exports = class Game {
  /**
   * A class to manage a CAH game
   * @param {import("discord.js").TextChannel} channel
   */
  constructor(channel, type = "Black") {
    this.client = channel.client
    this.channel = channel
    this.deckManager = new DeckManager()
    this.type = type
    this.started = false
    this.ended = false
    this.black = null
    //Player objects
    this.players = new Collection()
    this.minPlayers = 3
    //User ids
    this.czars = []
    //Cards placed in center
    this.center = null
    //White cards in hand
    this.numHand = 10
    //Points required to win
    this.points = 7
    this.czarResColl = null
    this.czarLeft = false
    //Amount of time for responses
    this.time = 60e3
    this.czarTime = 180e3
    this.autofillChoice = true
  }
  get czar() {
    return this.czars[0] || null
  }
  get host() {
    return this.players.first()
  }
  set host(id) {
    if (!this.players.has(id))
      throw new Error("Invalid user id provided")

    this.players.sort((a, b) => (a === id ? -1 : b === id ? 1 : 0))
  }
  addPlayer(user) {
    if (this.players.has(user.id))
      return false

    this.players.set(user.id, new Player(this, user))
    this.czars.push(user.id)

    return true
  }
  removePlayer(user) {
    let index = this.czars.indexOf(user.id)
    if (index === -1)
      return false

    this.czars.splice(index, 1)
    this.players.get(user.id).leave()
    this.players.delete(user.id)
    //If the user that left was card czar
    if (!index)
      this.czarResColl ? this.czarResColl.stop("left") : this.czarLeft = true

    return true
  }
  dealCards() {
    for (let p of this.players.values()) {
      let num = this.numHand - p.hand.length
      if (!num)
        continue

      let cards = this.deckManager.takeWhite(num)
      p.hand.push(...cards)
    }
  }
  changeCzars() {
    this.czars.push(this.czars.shift())
  }
  returnCards() {
    this.channel.send("Returning cards...")
    for (let [id, card] of this.center) {
      this.players.get(id).hand.push(
        card.type === "blank" ? new BlankCard() : card
      )
    }
  }
  nextBlack() {
    this.black = this.deckManager.takeBlack()
  }
  async init() {
    await this.deckManager.init()
  }
  async start() {
    if (this.started)
      throw new Error("Game already started")

    if (this.players.size < this.minPlayers)
      throw new Error("Not enough players to start game")

    if (!this.deckManager.enabled.size)
      throw new Error("There aren't and decks enabled")

    this.started = true
    ArrUtil.shuffle(this.czars)
    //eslint-disable-next-line max-len
    while (this.players.size >= this.minPlayers && !this.players.some(p => p.won)) {
      this.changeCzars()
      this.channel.send(`<@${this.czar}> is now card czar`)
      this.dealCards()
      this.nextBlack()
      await this.channel.send([
        "Black card: `" + this.black.text + "`",
        "Sending Dm's..."
      ])
      let center = await Promise.all(this.players.map(p => p.turn()))
      this.center = new Collection(
        ArrUtil.shuffle(
          center
            .filter(res => res)
            .map(res => [res.id, res.cards])
        )
      )
      if (this.czarLeft) {
        this.handleCzarLeave()
        continue
      }
      if (this.center.size < 2) {
        this.channel.send("Not enough people choose cards")
        this.returnCards()
        continue
      }
      await this.sendCenter()
      let res = await this.czarRes().catch(e => e)
      if (res === "czar left") {
        this.handleCzarLeave()
        continue
      }
      if (!res) {
        this.channel.send(
          "The czar took too long to answer and will be skipped"
        )
        this.returnCards()
        continue
      }
      let rWin = this.center.keyArray()[--res]
      rWin = this.players.get(rWin)
      if (!rWin)
        throw new Error("Win triggered, but no player found")

      this.channel.send(rWin + " got a point!")
      ++rWin.points
    }
    this.ended = true
    if (this.players.size < this.minPlayers)
      return this.channel.send("Not enough players to continue")

    let winner = this.players.find(p => p.won)

    return this.channel.send(winner + " has won the game!")
  }
  reset() {
    for (let user of this.players.values()) {
      this.players.set(user.id, new Player(this, user))
    }
    this.deckManager.reset()
    this.started = false
    this.ended = false
  }
  handleCzarLeave() {
    this.channel.send("The czar has left.")
    this.returnCards()
    this.czarLeft = false
  }
  sendCenter() {
    let cards = this.center
      .map((c, i) => (i + 1) + ": " + c.map(t => "`" + t + "`").join(", "))
      .join("\n")

    return this.channel.send("Responses:\n" + cards)
  }
  czarRes() {
    const max = this.center.size
    let chosen = null

    return new Promise((resolve, reject) => {
      this.czarResColl = this.channel.createMessageCollector(
        m => m.author.id === this.czar && Number.isInteger(parseInt(m.content)),
        {time: this.czarTime}
      )
      this.czarResColl.on("collect", msg => {
        let num = parseInt(msg.content)
        if (num < 1 || num > max)
          return

        chosen = num
        this.czarResColl.stop("answered")
      })
      this.czarResColl.once("end", (c, r) => {
        this.czarResColl = null
        switch (r) {
          case "time":
            if (this.autofillChoice)
              chosen = ~~(Math.random() * max) + 1
          //eslint-disable-next-line no-fallthrough
          case "answered":
            resolve(chosen)
            break
          default:
            reject("czar left") //eslint-disable-line prefer-promise-reject-errors
        }
      })
    })
  }
}