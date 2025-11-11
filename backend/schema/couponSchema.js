const couponSchema = `
CREATE TABLE IF NOT EXISTS coupons (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0.00,
  maximum_discount_amount DECIMAL(10,2) NULL,
  usage_limit INT DEFAULT NULL,
  usage_count INT DEFAULT 0,
  user_usage_limit INT DEFAULT 1,
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP NULL,
  applicable_plans JSON DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) DEFAULT 0,
  
  INDEX idx_uuid (uuid),
  INDEX idx_code (code),
  INDEX idx_active (is_active),
  INDEX idx_valid_dates (valid_from, valid_until),
  INDEX idx_usage (usage_count, usage_limit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`;

module.exports = couponSchema;
