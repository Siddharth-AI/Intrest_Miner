const {
  checkRecordExists,
  insertRecord,
  updateRecord,
  selectRecord,
} = require('../utils/sqlFunctions');


const {
  findConnectionsByFacebookId,
  findUserConnections,
  findConnection,
  createFacebookConnection,
  updateConnectionToken,
  deactivateAllUserConnections,
  getPrimaryConnection,
  deactivateConnection,
  isConnectionTokenValid,
  deleteConnection,
  deleteAllUserConnections
} = require('./facebookConnectionModel');


const getFacebookToken = async (userUuid) => {
  try {
    // console.log("🔍 Getting Facebook token for user:", userUuid);

    // Get user's primary connection or first active connection
    const primaryConnection = await getPrimaryConnection(userUuid);

    if (primaryConnection) {
      // Check if token is still valid
      const isValid = await isConnectionTokenValid(userUuid, primaryConnection.fb_user_id);

      if (isValid) {
        // console.log("✅ Found valid primary Facebook token");
        return primaryConnection.fb_access_token;
      } else {
        console.log("⚠️ Primary token expired");
        return null;
      }
    }

    // Fallback: Get first active connection
    const connections = await findUserConnections(userUuid);

    if (connections && connections.length > 0) {
      const firstConnection = connections[0];
      const isValid = await isConnectionTokenValid(userUuid, firstConnection.fb_user_id);

      if (isValid) {
        console.log("✅ Found valid Facebook token from first connection");
        return firstConnection.fb_access_token;
      }
    }

    console.log("❌ No valid Facebook token found");
    return null;
  } catch (error) {
    throw new Error(`Error getting Facebook token: ${error.message}`);
  }
};

// Find user by Facebook ID (returns array of users)
const findUserByFacebookId = async (facebookId) => {
  try {
    const connections = await findConnectionsByFacebookId(facebookId);
    return connections && connections.length > 0 ? connections : null;
  } catch (error) {
    throw new Error(`Error finding user by Facebook ID: ${error.message}`);
  }
};

// Find user by email (unchanged)
const findUserByEmail = async (email) => {
  try {
    return await checkRecordExists('users', 'email', email, 'is_deleted = ?', [0]);
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

// Find user by ID (unchanged)
const findUserById = async (userId) => {
  try {
    return await checkRecordExists('users', 'id', userId, 'is_deleted = ?', [0]);
  } catch (error) {
    throw new Error(`Error finding user by ID: ${error.message}`);
  }
};

// Create new user with Facebook
const createUserWithFacebook = async (userData) => {
  try {
    const {
      uuid, name, email, fb_user_id, fb_access_token,
      fb_token_expires_in, avatar_path
    } = userData;

    // Create user first
    const newUser = {
      uuid,
      name,
      email,
      avatar_path,
      password: 'facebook_login', // Placeholder password
      created_by: 'facebook_oauth',
      account_status: 'active',
      is_active: 1,
      is_deleted: 0
    };

    const userResult = await insertRecord('users', newUser);

    // Create Facebook connection using UUID
    await createFacebookConnection({
      user_uuid: uuid, // Use UUID instead of user ID
      fb_user_id,
      fb_access_token,
      fb_token_expires_in,
      is_primary: true
    });

    return { id: userResult.insertId, uuid, ...newUser };
  } catch (error) {
    throw new Error(`Error creating user with Facebook: ${error.message}`);
  }
};

// Link Facebook account to existing user (now uses UUID)
const linkFacebookToUser = async (userUuid, facebookData) => {
  try {
    const {
      fb_user_id,
      fb_access_token,
      fb_token_expires_in
    } = facebookData;

    // Check if connection already exists
    const existingConnection = await findConnection(userUuid, fb_user_id);

    if (existingConnection) {
      // Update existing connection
      await updateConnectionToken(userUuid, fb_user_id, {
        fb_access_token,
        fb_token_expires_in
      });
    } else {
      // Create new connection
      const userConnections = await findUserConnections(userUuid);
      const isPrimary = userConnections.length === 0; // First connection is primary

      await createFacebookConnection({
        user_uuid: userUuid, // Use UUID
        fb_user_id,
        fb_access_token,
        fb_token_expires_in,
        is_primary: isPrimary
      });
    }

    return true;
  } catch (error) {
    throw new Error(`Error linking Facebook to user: ${error.message}`);
  }
};

// Update Facebook token for existing user (now uses UUID)
const updateFacebookToken = async (userUuid, tokenData) => {
  try {
    // Get primary connection or first active connection
    const primaryConnection = await getPrimaryConnection(userUuid);
    if (!primaryConnection) {
      const connections = await findUserConnections(userUuid);
      if (connections.length === 0) {
        throw new Error('No Facebook connections found');
      }
      // Update first connection if no primary
      await updateConnectionToken(userUuid, connections[0].fb_user_id, tokenData);
    } else {
      await updateConnectionToken(userUuid, primaryConnection.fb_user_id, tokenData);
    }

    return true;
  } catch (error) {
    throw new Error(`Error updating Facebook token: ${error.message}`);
  }
};

// Unlink Facebook account (now uses UUID)
const unlinkFacebookAccount = async (userUuid, facebookId = null) => {
  try {
    if (facebookId) {
      // Unlink specific connection
      await deleteConnection(userUuid, facebookId);
      console.log(`🗑️ Hard deleted specific Facebook connection: ${facebookId}`);

    } else {
      // Unlink all connections
      await deleteAllUserConnections(userUuid);
      console.log(`🗑️ Hard deleted all Facebook connections for user: ${userUuid}`);

    }
    return true;
  } catch (error) {
    throw new Error(`Error unlinking Facebook account: ${error.message}`);
  }
};

// Get user's Facebook status (now uses UUID)
const getUserFacebookStatus = async (userUuid) => {
  try {
    const query = `
      SELECT id, uuid, name, email, avatar_path, account_status
      FROM users
      WHERE uuid = ? AND is_deleted = 0
    `;
    const results = await selectRecord(query, [userUuid]);
    // console.log("🔍 Getting user Facebook status:====>>", results);

    if (!results || results.length === 0) return null;

    const user = results[0];
    const connections = await findUserConnections(userUuid);
    const primaryConnection = await getPrimaryConnection(userUuid);

    const facebookConnected = connections.length > 0;
    const tokenValid = primaryConnection ?
      await isConnectionTokenValid(userUuid, primaryConnection.fb_user_id) : false;

    return {
      facebook_connected: facebookConnected,
      facebook_token_valid: tokenValid,
      total_connections: connections.length,
      primary_connection: primaryConnection,
      all_connections: connections,
      user_profile: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        avatar_path: user.avatar_path,
        account_status: user.account_status
      }
    };
  } catch (error) {
    throw new Error(`Error getting user Facebook status: ${error.message}`);
  }
};

module.exports = {
  findUserByFacebookId,
  findUserByEmail,
  findUserById,
  createUserWithFacebook,
  linkFacebookToUser,
  updateFacebookToken,
  unlinkFacebookAccount,
  getUserFacebookStatus,
  getFacebookToken
};
