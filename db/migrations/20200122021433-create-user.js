'use strict'
module.exports = {
  up(query, Sql) {
    return query.createTable('Users', {
      id: {
        type: Sql.STRING,
        primaryKey: true,
        allowNull: false
      },
      token: Sql.STRING,
      tokExp: Sql.DATE,
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
  async down(query) {
    return query.dropTable('Users')
  }
}