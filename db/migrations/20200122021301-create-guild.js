'use strict'
module.exports = {
  up(query, Sql) {
    return query.createTable('Guilds', {
      id: {
        type: Sql.STRING,
        primaryKey: true,
        allowNull: false
      },
      prefix: {
        type: Sql.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sql.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sql.DATE
      }
    })
  },
  down(query) {
    return query.dropTable('Guilds')
  }
}