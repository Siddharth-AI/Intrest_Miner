const userSubscriptionSchema = `
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    user_uuid VARCHAR(255) NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('active', 'expired', 'cancelled', 'pending', 'suspended') DEFAULT 'pending',
    searches_used INT DEFAULT 0,
    searches_remaining INT NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    auto_renew TINYINT(1) DEFAULT 1,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    INDEX idx_uuid (uuid),
    INDEX idx_user_uuid (user_uuid),
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date),
    INDEX idx_active_subscription (user_uuid, status, end_date),
    CONSTRAINT fk_user_subscription_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_user_subscription_user FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`

module.exports = userSubscriptionSchema