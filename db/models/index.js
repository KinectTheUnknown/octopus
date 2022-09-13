'use strict'
const fs = require('fs').promises
const path = require('path')
//eslint-disable-next-line no-multi-assign
const Sql = exports.Sequelize = require('sequelize').Sequelize
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.js')[env]
//eslint-disable-next-line no-multi-assign
const db = exports.db = {}
let sql
if (config.use_env_variable)
  sql = new Sql(process.env[config.use_env_variable], config)
else {
  sql = new Sql(
    config.database,
    config.username,
    config.password,
    config
  )
}
exports.sequelize = sql
exports.init = async () => {
  let files = await fs.readdir(__dirname)
  for (let file of files) {
    if (file === basename || !file.endsWith('.js'))
      continue
    
    console.log("Loading " + file)
    let m = sql.import(path.join(__dirname, file))
    db[m.name] = m
    await m.associate && m.associate(db)
  }
  
  return sql.authenticate()
}