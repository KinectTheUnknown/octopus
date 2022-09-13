const base91 = require("../../utils/baseConv.js")(36, 91)
module.exports = (sql, types) => {
  const Deck = sql.define("Deck", {
    uuid: {
      type: types.UUID,
      primaryKey: false,
      unique: true,
      allowNull: true,
      get() {
        return base91.encode(this.getDataValue("id").replace("-", ""))
      },
      defaultValue: types.UUIDV4
    },
    name: {
      type: types.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    userID: {
      type: types.STRING,
      allowNull: false,
      references: {
        model: "User"
      },
      onUpdate: "CASCADE",
      onDelete: "NO ACTION"
    },
    size: {
      type: types.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    indexes: [{
      fields: ["userID", "name"]
    }]
  })
  
  return Deck
}