const mysql = require("mysql");
const db = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "authdb",
});

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Connected to database");
});

module.exports = db;
