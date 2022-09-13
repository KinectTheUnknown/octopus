'use strict'
module.exports = {
  async up(query, Sequelize) {
    const t = await query.sequelize.transaction()
    
    try {
      await query.createTable('Cards', {
        pos: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        deckID: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "Decks",
            key: "uuid"
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },
        text: {
          type: Sequelize.STRING,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM("black", "white"),
          allowNull: false
        },
        explicit: {
          type: Sequelize.BOOLEAN,
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, {transaction: t})
      await t.commit()
      
      return query.addConstraint("Cards", ["pos", "deckID", "createdAt"], {
        type: "PRIMARY KEY",
        name: "cardCID"
      })
    } catch (e) {
      await t.rollback()
      throw e
    }
  },
  down(query) {
    return query.dropTable('Cards')
  }
}