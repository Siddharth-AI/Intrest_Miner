const mysql = require("mysql2");
require("dotenv").config();


console.log("Database.js - Environment check:");
console.log("- DB_HOST:", process.env.DB_HOST || "NOT SET");
console.log("- DB_PORT:", process.env.DB_PORT || "NOT SET");
console.log("- DB_USER:", process.env.DB_USER || "NOT SET");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT) || 20090,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "interest_miner",

});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

if (!process.env.DB_HOST || !process.env.DB_USER) {
  console.error("❌ Missing required database environment variables!");
  console.error(
    "Please check your .env file contains: DB_HOST, DB_USER, DB_PASSWORD"
  );
  process.exit(1);
}

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "interest_miner"
});

module.exports = { connection, pool };
