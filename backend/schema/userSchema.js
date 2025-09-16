const userSchema = `CREATE TABLE IF NOT EXISTS users (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uuid varchar(255) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  email varchar(100) NOT NULL UNIQUE,
  contact varchar(20) DEFAULT NULL,
  address varchar(255) DEFAULT NULL,
  country varchar(100) DEFAULT NULL,
  dob date DEFAULT NULL,
  account_status ENUM('active','inactive','suspended') DEFAULT 'active',
  password varchar(255) NOT NULL,
  avatar_path varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  is_admin tinyint(1) NOT NULL DEFAULT '0',
  otp_code varchar(6) DEFAULT NULL,
  otp_expires_at timestamp NULL DEFAULT NULL,
  reset_token varchar(255) DEFAULT NULL,
  otp_verified tinyint(1) DEFAULT '0',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by varchar(100) NOT NULL,
  updated_at timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  updated_by varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  is_active tinyint(1) NOT NULL DEFAULT '1',
  is_deleted tinyint(1) NOT NULL DEFAULT '0',
  fb_user_id varchar(50) DEFAULT NULL UNIQUE,
  fb_access_token text DEFAULT NULL,
  fb_token_updated_at timestamp NULL DEFAULT NULL,
  fb_token_expires_in int DEFAULT NULL,
  INDEX idx_fb_user_id (fb_user_id);
  INDEX idx_uuid (uuid),
  INDEX idx_email (email),
  INDEX idx_otp_code (otp_code),
  INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;

module.exports = userSchema;

