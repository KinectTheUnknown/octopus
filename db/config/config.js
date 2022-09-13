const base = {
  dialect: "postgres",
  host: process.env.DBHOST,
  password: process.env.DBPASS,
  typeValidation: true
}
module.exports = {
  development: {
    ...base,
    username: "kininq_bot",
    database: "kininq_octopus_dev"
  },
  test: {
    ...base,
    database: "database_test"
  },
  production: {
    ...base,
    username: "unknownunicorn_bot",
    database: "unknownunicorn_octopus_prod",
    pool: {
      max: 10,
      idle: 30e3
    }
  }
}