const subscriptionPlanSchema = `
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    search_limit INT NOT NULL,
    duration_days INT NOT NULL DEFAULT 30,
    features JSON DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_popular TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    INDEX idx_uuid (uuid),
    INDEX idx_name (name),
    INDEX idx_active (is_active),
    INDEX idx_price (price),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`

module.exports = subscriptionPlanSchema
