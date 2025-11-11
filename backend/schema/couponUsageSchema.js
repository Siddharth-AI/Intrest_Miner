const couponUsageSchema = `
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  coupon_uuid VARCHAR(36) NOT NULL,
  user_uuid VARCHAR(255) NOT NULL,
  subscription_uuid VARCHAR(36) NULL,
  payment_uuid VARCHAR(36) NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_uuid (uuid),
  INDEX idx_coupon_uuid (coupon_uuid),
  INDEX idx_user_uuid (user_uuid),
  INDEX idx_user_coupon (user_uuid, coupon_uuid),
  
  CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_uuid) REFERENCES coupons(uuid) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_coupon_usage_user FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_coupon_usage_subscription FOREIGN KEY (subscription_uuid) REFERENCES user_subscriptions(uuid) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_coupon_usage_payment FOREIGN KEY (payment_uuid) REFERENCES payments(uuid) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`;

module.exports = couponUsageSchema;
