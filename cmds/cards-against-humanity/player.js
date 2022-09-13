const moment = require("moment")
const {randItems} = require("../../utils/array.js")
module.exports = class Player {
  constructor(game, user) {
    this.user = user
    this.id = user.id
    this.game = game
    this.hand = []
    this.points = 0
    this.coll = null
  }
  get dmChannel() {
    return this.user.dmChannel
  }
  get isCzar() {
    return this.game.czar === this.id
  }
  get won() {
    return this.points >= this.game.points
  }
  async turn() {
    if (this.isCzar)
      return null

    await this.sendHand()

    return this.chooseCard()
      .then(res => {
        let mapped = res.map(n => this.hand[n])
        this.hand = this.hand
          .filter((c, i) => !res.includes(i))

        return {id: this.id, cards: mapped}
      }, () => null)
  }
  sendHand() {
    return this.user.send([
      `You have ${moment.duration(this.game.time, "ms").format("m [min and] s [sec]")} to respond`,
      "Cards:",
      this.hand.map((c, i) => (i + 1) + ": " + c).join("\n"),
      "Black Card:",
      "`" + this.game.black.text + "`"
    ])
  }
  chooseCard() {
    let chosen = []
    let blank = false
    this.dmChannel.send("Respond with the respective number to choose a card")

    return new Promise((res, rej) => {
      this.coll = this.dmChannel.createMessageCollector(
        m => m.author.id === this.id && (blank || parseInt(m.content)),
        {time: this.game.time}
      )
      this.coll.on("collect", m => {
        if (blank) {
          blank = false
          this.hand[chosen[chosen.length - 1]].text = m.content
          this.user.send("Success!")
          if (this.game.black.amount === chosen.length)
            this.coll.stop()
        }
        let num = parseInt(m.content) - 1
        if (!this.hand[num])
          return

        if (chosen.includes(num))
          return void m.channel.send("You already selected that card")
        
        chosen.push(num)
        if (this.hand[num].type === "blank") {
          blank = true

          return void this.user.send(
            "What would you like the blank card to say?"
          )
        }
        if (this.game.black.amount === chosen.length)
          this.coll.stop()
      })
      this.coll.once("end", (c, reason) => {
        this.coll = null
        if (reason === "player left")
          return rej(reason)

        if (chosen < this.game.black.amount) {
          if (!this.game.autoFillChoice) {
            this.user.send(
              "You took too long to answer, so you will be skipped"
            )

            return rej() //eslint-disable-line prefer-promise-reject-errors
          }
          this.user.send(
            "You took too long to answer, so ur answers has been chosen for you"
          )
          fillRemain.call(this, chosen)
        } else {
          this.user.send(
            "Success! Answers will be judged in " + this.game.channel
          )
        }
        res(chosen)
      })
    })
  }
  leave() {
    this.coll && this.coll.stop("player left")
  }
  toString() {
    return `<@${this.id}>`
  }
}
function fillRemain(curr) {
  if (!Array.isArray(curr))
    throw new TypeError("Array must be an array")

  let remain = this.game.black.amount - curr.length
  if (remain < 0)
    throw new RangeError("Too many cards picked")

  if (!remain)
    throw new RangeError("Remaining amount needed is 0")

  let fill = randItems(
    this.hand
      .map((c, i) => i)
      .filter(n => !curr.includes(n)),
    remain
  )
  curr.push(...fill)

  return curr
}