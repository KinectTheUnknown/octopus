const {Collection} = require("discord.js")
const {shuffle, fill, map} = require("../../utils/array.js")
const defDecks = require("./defDecks.js")
const BlackCard = require("./blackCard.js")
const WhiteCard = require("./whiteCard.js")
const BlankCard = require("./blankCard.js")

class DeckManager extends Collection {
  constructor() {
    super()
    this.enabled = new Set()
    this.disabled = new Set()
    this.decks = {
      black: [],
      white: []
    }
    this.blank = 0
  }
  async getDefault() {
    let decks = await defDecks()
    for (let [n, d] of decks)
      this.add(n, d)
  }
  add(id, deck) {
    if (typeof id !== "string")
      throw new TypeError("Invalid id provided")

    if (!deck || typeof deck !== "object")
      throw new TypeError("Invalid deck type provided")

    if (["black", "white", "name"].some(p => !Object.keys(deck).includes(p)))
      throw new TypeError("Invalid deck structure")

    if (this.has(id))
      return false

    let d = {}
    console.log(`Loading the ${deck.name} deck`)
    d.black = map(deck.black, c => new BlackCard(c.text, c.pick))
    d.white = map(deck.white, c => new WhiteCard(c))
    this.set(id, d)

    return this.enabled.add(id)
  }
  get blankCards() {
    if (!this.blank)
      return []

    return fill(Array(this.blank), () => new BlankCard())
  }
  delete(id) {
    if (!this.has(id))
      return false

    this.decks.delete(id)
    this.enabled.delete(id)

    return super.delete(id)
  }
  enable(id) {
    if (!this.has(id) || this.enabled.has(id))
      return false

    this.disabled.delete(id)

    return this.enabled.add(id)
  }
  disable(id) {
    if (!this.has(id) || this.disabled.has(id))
      return false

    this.enabled.delete(id)

    return this.disabled.add(id)
  }
  all(color) {
    if (!this.decks[color])
      throw new TypeError("Color must be black or white")

    let [a, ...b] = map(Array.from(this.enabled), d => this.get(d)[color])
    b && (a = a.concat(...b))
    color === "white" && (a = a.concat(this.blankCards))

    return a;
  }
  refill(color) {
    if (!this.decks[color])
      throw new TypeError("Color must be black or white")

    let cards = this.all(color)
    if (color === "white")
      cards.concat(this.blankCards)

    this.decks[color].push(...shuffle(cards))
  }
  takeBlack() {
    this.decks.black.length || this.refill("black")

    return this.decks.black.shift()
  }
  takeWhite(num = 1) {
    if (num < 1)
      throw new RangeError("Number must be a whole number greater than 0")

    while (this.decks.white.length < num)
      this.refill("white")

    return this.decks.white.splice(0, num)
  }
  fetchDecks() {
    return this.getDefault()
  }
  async init() {
    await this.fetchDecks()
  }
  reset() {
    this.decks = {
      black: [],
      white: []
    }
  }
}
module.exports = DeckManager