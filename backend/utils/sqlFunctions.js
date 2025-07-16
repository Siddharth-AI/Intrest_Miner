require("dotenv").config();

const mysql = require("mysql2");

// Validate required environment variables
  console.log(process.env.DB_HOST," ",process.env.DB_USER," ",process.env.DB_PASSWORD)
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


const createTable = (schema) => {
  return new Promise((resolve, reject) => {
    pool.query(schema, (err, results) => {
      if (err) {
        console.error("Create table error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const checkRecordExists = (
  tableName,
  column,
  value,
  additionalCondition = "",
  additionalParams = []
) => {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM ${tableName} WHERE ${column} = ?`;
    let params = [value];

    if (additionalCondition) {
      query += ` AND ${additionalCondition}`;
      params = params.concat(additionalParams);
    }

    pool.query(query, params, (err, results) => {
      if (err) {
        console.error("Check record exists error:", err);
        reject(err);
      } else {
        resolve(results.length ? results[0] : null);
      }
    });
  });
};

const insertRecord = (tableName, record) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO ${tableName} SET ?`;
    pool.query(query, [record], (err, results) => {
      if (err) {
        console.error("Insert record error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const updateRecord = (tableName, updateData, whereColumn, whereValue) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE ${tableName} SET ? WHERE ${whereColumn} = ?`;
    pool.query(query, [updateData, whereValue], (err, results) => {
      if (err) {
        console.error("Update record error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const selectRecord = (query, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (err, results) => {
      if (err) {
        console.error("Select record error:", err);
        console.error("Query:", query);
        console.error("Params:", params);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const deleteRecord = (tableName, column, value) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM ${tableName} WHERE ${column} = ?`;
    pool.query(query, [value], (err, results) => {
      if (err) {
        console.error("Delete record error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const softDeleteRecord = (tableName, column, value) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE ${tableName} SET is_deleted = 1 WHERE ${column} = ?`;
    pool.query(query, [value], (err, results) => {
      if (err) {
        console.error("Soft delete record error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  createTable,
  checkRecordExists,
  insertRecord,
  updateRecord,
  selectRecord,
  deleteRecord,
  softDeleteRecord,

};
