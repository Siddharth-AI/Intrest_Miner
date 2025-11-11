const { pool } = require("../Config/Database");


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

// Add these functions to your dbHelpers.js file

const getOnboardingStatus = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT has_seen_onboarding, has_seen_interest_miner_tutorial 
      FROM users 
      WHERE uuid = ? AND is_deleted = 0
    `;

    pool.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Get onboarding status error:", err);
        reject(err);
      } else {
        resolve(results.length ? results[0] : null);
      }
    });
  });
};

const updateOnboardingStatus = (userId, hasSeenOnboarding, hasSeenInterestMinerTutorial, updatedBy) => {
  return new Promise((resolve, reject) => {
    const updates = [];
    const params = [];

    if (hasSeenOnboarding !== undefined) {
      updates.push('has_seen_onboarding = ?');
      params.push(hasSeenOnboarding ? 1 : 0);
    }

    if (hasSeenInterestMinerTutorial !== undefined) {
      updates.push('has_seen_interest_miner_tutorial = ?');
      params.push(hasSeenInterestMinerTutorial ? 1 : 0);
    }

    if (updates.length === 0) {
      resolve({ message: 'No fields to update' });
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    updates.push('updated_by = ?');
    params.push(updatedBy);
    params.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE uuid = ? AND is_deleted = 0`;

    pool.query(query, params, (err, results) => {
      if (err) {
        console.error("Update onboarding status error:", err);
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
  getOnboardingStatus,
  updateOnboardingStatus

};
