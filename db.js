const Pool = require('pg').Pool
require('dotenv').config()

const pool = new Pool({
  user: 'postgres',
  password: '757548',
  host: 'localhost',
  port: '5432',
  database: "LEDEMS"
})

module.exports = pool
