module.exports = class BlankCard {
  constructor() {
    this._text = null
    this.type = "blank"
  }
  get text() {
    return this._text || "**BLANK CARD**"
  }
  set text(txt) {
    if (this._text)
      throw new Error("The text has already been set")

    if (!txt || typeof txt !== "string")
      throw new TypeError("Text must be a non-empty string")

    this._text = txt
  }
  toString() {
    return this.text
  }
}