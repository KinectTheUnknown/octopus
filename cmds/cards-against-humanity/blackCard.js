const WhiteCard = require("./whiteCard.js")
module.exports = class BlackCard extends WhiteCard {
  constructor(text, amount) {
    super(text)
    if (typeof amount !== "number")
      throw new TypeError("Amount must be a number")

    if (!Number.isInteger(amount))
      throw new TypeError("Amount must be an integer")

    if (amount < 0)
      throw new RangeError("Amount must be a number greater than 0")

    this.amount = amount
    this.type = "black"
  }
}