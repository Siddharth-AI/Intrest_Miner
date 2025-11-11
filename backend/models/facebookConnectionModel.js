const {
  checkRecordExists,
  insertRecord,
  updateRecord,
  selectRecord,
  deleteRecord
} = require('../utils/sqlFunctions');

// Find connections by Facebook ID
const findConnectionsByFacebookId = async (facebookId) => {
  try {
    const query = `
      SELECT fc.*, u.uuid, u.id as user_id, u.name, u.email 
      FROM facebook_connections fc
      JOIN users u ON fc.user_uuid = u.uuid
      WHERE fc.fb_user_id = ? AND fc.is_active = 1 AND u.is_deleted = 0
    `;
    return await selectRecord(query, [facebookId]);
  } catch (error) {
    throw new Error(`Error finding connections by Facebook ID: ${error.message}`);
  }
};

// Find user connections by UUID
const findUserConnections = async (userUuid) => {
  try {
    const query = `
      SELECT fc.*, u.id as user_id, u.name, u.email
      FROM facebook_connections fc
      JOIN users u ON fc.user_uuid = u.uuid
      WHERE fc.user_uuid = ? AND fc.is_active = 1
      ORDER BY fc.is_primary DESC, fc.created_at DESC
    `;
    const results = await selectRecord(query, [userUuid]);
    return results;
  } catch (error) {
    throw new Error(`Error finding user connections: ${error.message}`);
  }
};

// Find specific connection
const findConnection = async (userUuid, facebookId) => {
  try {
    const query = `
      SELECT * FROM facebook_connections 
      WHERE user_uuid = ? AND fb_user_id = ? AND is_active = 1
    `;
    const results = await selectRecord(query, [userUuid, facebookId]);
    return results && results.length > 0 ? results[0] : null;
  } catch (error) {
    throw new Error(`Error finding connection: ${error.message}`);
  }
};

// Create new Facebook connection
const createFacebookConnection = async (connectionData) => {
  try {
    const {
      user_uuid,
      fb_user_id,
      fb_access_token,
      fb_token_expires_in,
      is_primary = false
    } = connectionData;

    const newConnection = {
      user_uuid,
      fb_user_id,
      fb_access_token,
      fb_token_updated_at: new Date(),
      fb_token_expires_in,
      is_active: 1,
      is_primary: is_primary ? 1 : 0,
      created_by: 'facebook_oauth'
    };

    const result = await insertRecord('facebook_connections', newConnection);
    return { id: result.insertId, ...newConnection };
  } catch (error) {
    throw new Error(`Error creating Facebook connection: ${error.message}`);
  }
};

// Update Facebook connection token
const updateConnectionToken = async (userUuid, facebookId, tokenData) => {
  try {
    const {
      fb_access_token,
      fb_token_expires_in
    } = tokenData;

    const query = `
      UPDATE facebook_connections 
      SET fb_access_token = ?, fb_token_updated_at = ?, fb_token_expires_in = ?, updated_by = ?
      WHERE user_uuid = ? AND fb_user_id = ? AND is_active = 1
    `;

    await selectRecord(query, [
      fb_access_token,
      new Date(),
      fb_token_expires_in,
      'facebook_oauth',
      userUuid,
      facebookId
    ]);

    return true;
  } catch (error) {
    throw new Error(`Error updating connection token: ${error.message}`);
  }
};

// delete connection
const deleteConnection = async (userUuid, facebookId) => {
  try {
    const query = `
      DELETE FROM facebook_connections 
      WHERE user_uuid = ? AND fb_user_id = ?
    `;

    await selectRecord(query, [userUuid, facebookId]);
    console.log(`✅ Facebook connection hard deleted: ${facebookId}`);
    return true;
  } catch (error) {
    throw new Error(`Error deleting connection: ${error.message}`);
  }
};

// Delete all user connections
const deleteAllUserConnections = async (userUuid) => {
  try {
    const query = `
      DELETE FROM facebook_connections 
      WHERE user_uuid = ?
    `;

    await selectRecord(query, [userUuid]);
    console.log(`✅ All Facebook connections hard deleted for user: ${userUuid}`);
    return true;
  } catch (error) {
    throw new Error(`Error deleting all connections: ${error.message}`);
  }
};

// Check if token is valid
const isConnectionTokenValid = async (userUuid, facebookId) => {
  try {
    const query = `
      SELECT fb_token_updated_at, fb_token_expires_in
      FROM facebook_connections
      WHERE user_uuid = ? AND fb_user_id = ? AND is_active = 1
    `;
    const results = await selectRecord(query, [userUuid, facebookId]);
    console.log("🔍 Checking token validity:====>>", results);
    if (!results || results.length === 0) return false;

    const { fb_token_updated_at, fb_token_expires_in } = results[0];
    const tokenAge = (Date.now() - new Date(fb_token_updated_at).getTime()) / 1000;
    console.log("🔍 Token check=>>>>>>>>>>>>>>>>>:====>>", tokenAge < fb_token_expires_in);
    return tokenAge < fb_token_expires_in;
  } catch (error) {
    throw new Error(`Error checking token validity: ${error.message}`);
  }
};

// Get user's primary Facebook connection
const getPrimaryConnection = async (userUuid) => {
  try {
    const query = `
      SELECT * FROM facebook_connections 
      WHERE user_uuid = ? AND is_active = 1 AND is_primary = 1
      LIMIT 1
    `;
    const results = await selectRecord(query, [userUuid]);
    console.log("🔍 Getting primary connection:====>>", results);
    return results && results.length > 0 ? results[0] : null;
  } catch (error) {
    throw new Error(`Error getting primary connection: ${error.message}`);
  }
};

// Set primary connection
const setPrimaryConnection = async (userUuid, facebookId) => {
  try {
    // First, remove primary from all connections
    await selectRecord(
      'UPDATE facebook_connections SET is_primary = 0 WHERE user_uuid = ?',
      [userUuid]
    );

    // Then set the specified connection as primary
    const query = `
      UPDATE facebook_connections 
      SET is_primary = 1, updated_by = ?
      WHERE user_uuid = ? AND fb_user_id = ? AND is_active = 1
    `;

    await selectRecord(query, ['user_action', userUuid, facebookId]);
    return true;
  } catch (error) {
    throw new Error(`Error setting primary connection: ${error.message}`);
  }
};

module.exports = {
  findConnectionsByFacebookId,
  findUserConnections,
  findConnection,
  createFacebookConnection,
  updateConnectionToken,
  deleteConnection,
  deleteAllUserConnections,
  isConnectionTokenValid,
  getPrimaryConnection,
  setPrimaryConnection
};
