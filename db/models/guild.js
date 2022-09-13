const config = require("../../config.json")
const base62 = require("../../utils/baseConv.js")(10, 62)
module.exports = (sql, types) => {
  const Guild = sql.define("Guild", {
    id: {
      type: types.STRING,
      allowNull: false,
      primaryKey: true,
      validate: {
        isAlphaNumeric: true,
        notEmpty: true
      },
      get() {
        return base62.decode(this.getDataValue("id"))
      },
      set(val) {
        return this.setDataValue("id", base62.encode(val))
      }
    },
    prefix: {
      type: types.STRING,
      allowNull: true,
      validate: {
        len: [1, 5],
        notEmpty: true
      },
      get() {
        let res = this.getDataValue("prefix")

        return res === null ? config.prefix : res
      },
      set(prefix) {
        return this.setDataValue(
          "prefix",
          prefix === config.prefix ? null : prefix
        )
      }
    }
  }, {
    indexes: [{
      fields: ["id"],
      using: "hash"
    }]
  })
  
  return Guild
}