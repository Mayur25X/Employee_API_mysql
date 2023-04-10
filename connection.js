const mysql = require("mysql");
require("dotenv").config();

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
conn.connect((err) => {
  if (err) throw err;
  console.log("Connection created..!");
});

module.exports = conn;
