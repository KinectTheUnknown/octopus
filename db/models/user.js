const base62 = require("../../utils/baseConv.js")(10, 62)
module.exports = (sql, types) => {
  const User = sql.define("User", {
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
    token: {
      type: types.STRING,
      validate: {
        notEmpty: true,
        hasExp(tok) {
          if (!tok) {
            this.setDataValue("tokExp", null)
            
            return true
          }
          let exp = this.getDataValue("tokExp")
          
          return exp && exp >= Date.now()
        }
      }
    },
    tokExp: {
      type: types.DATE
    }
  }, {
    indexes: [{
      fields: ["id"],
      using: "hash"
    }]
  })
  
  return User
}