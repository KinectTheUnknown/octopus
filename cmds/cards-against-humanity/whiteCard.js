const badArr = require("./bad_words.json")
const badReg = new RegExp(`(^|[\\W_])(${badArr.join("|")})([\\W_]|$)`, "i")
module.exports = class WhiteCard {
  constructor(text) {
    if (typeof text !== "string")
      throw new TypeError("Text must be a string")

    if (!text)
      throw new TypeError("Text cannot be empty")

    this.text = text
    this.type = "white"
    this.explicit = badReg.test(text)
  }
  toString() {
    return this.text
  }
}