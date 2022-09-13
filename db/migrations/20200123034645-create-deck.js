'use strict'
module.exports = {
  async up(query, Sequelize) {
    const t = await query.sequelize.transaction()
    
    try {
      await query.createTable('Decks', {
        uuid: {
          type: Sequelize.UUID,
          primaryKey: false,
          unique: true,
          allowNull: true,
          defaultValue: Sequelize.UUIDV4
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        userID: {
          type: Sequelize.STRING,
          allowNull: false,
          references: {
            model: "Users"
          },
          onUpdate: "CASCADE",
          onDelete: "NO ACTION"
        },
        size: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        private: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
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
      
      return query.addConstraint("Decks", ["name", "userID"], {
        type: "PRIMARY KEY",
        name: "deckCID"
      })
    } catch (e) {
      await t.rollback()
      throw e
    }
  },
  async down(query) {
    await query.removeConstraint("Decks", "deckCID")

    return query.dropTable('Decks')
  }
}