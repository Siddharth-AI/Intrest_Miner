// Add this at the very top to load environment variables
require("dotenv").config();

const mysql = require("mysql2");

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
  ssl: {
    ca: process.env.DB_SSL_CERT,
    rejectUnauthorized: false,
  },
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

module.exports = connection;
