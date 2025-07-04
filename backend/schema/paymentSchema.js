const paymentSchema = `
CREATE TABLE IF NOT EXISTS payments (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    user_uuid VARCHAR(255) NOT NULL,
    subscription_uuid VARCHAR(36) NULL,
    plan_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'wallet') NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'stripe',
    transaction_id VARCHAR(255) NULL,
    gateway_payment_id VARCHAR(255) NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    failure_reason TEXT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_uuid (uuid),
    INDEX idx_user_uuid (user_uuid),
    INDEX idx_subscription_uuid (subscription_uuid),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date),
    INDEX idx_transaction_id (transaction_id),
    CONSTRAINT fk_payment_user FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_payment_subscription FOREIGN KEY (subscription_uuid) REFERENCES user_subscriptions(uuid) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_payment_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`

module.exports = paymentSchema