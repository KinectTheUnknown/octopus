const cli = require("./models/")
class DbHandler {
  constructor() {
    this.Sql = cli.Sequelize
    this.db = cli.sequelize
    this.models = cli.db
    this.init = cli.init
  }
}
module.exports = new DbHandler()