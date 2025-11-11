const facebookConnectionSchema = `CREATE TABLE IF NOT EXISTS facebook_connections (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,   -- keep your own PK here
  user_uuid CHAR(36) NOT NULL,                  -- reference users.uuid
  fb_user_id VARCHAR(50) NOT NULL,
  fb_access_token TEXT NOT NULL,
  fb_token_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fb_token_expires_in INT DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT '1',
  is_primary TINYINT(1) NOT NULL DEFAULT '0',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(100) NOT NULL DEFAULT 'facebook_oauth',
  updated_by VARCHAR(100) DEFAULT NULL,
  
  FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE,
  INDEX idx_user_uuid (user_uuid),
  INDEX idx_fb_user_id (fb_user_id),
  INDEX idx_user_facebook (user_uuid, fb_user_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;

module.exports = facebookConnectionSchema;
