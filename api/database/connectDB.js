const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "db.sqlite");

async function connectDB() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

module.exports = connectDB;
