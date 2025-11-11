const billingHistorySchema = `
CREATE TABLE IF NOT EXISTS billing_history (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    user_uuid VARCHAR(255) NOT NULL,
    subscription_uuid VARCHAR(36) NOT NULL,
    payment_uuid VARCHAR(36) NULL,
    plan_id INT NOT NULL,
    billing_type ENUM('subscription', 'renewal', 'upgrade', 'downgrade', 'refund', 'credit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period_start TIMESTAMP NOT NULL,
    billing_period_end DATETIME NOT NULL,
    billing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    invoice_number VARCHAR(100) NULL,
    description TEXT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_uuid (uuid),
    INDEX idx_user_uuid (user_uuid),
    INDEX idx_subscription_uuid (subscription_uuid),
    INDEX idx_billing_date (billing_date),
    INDEX idx_status (status),
    INDEX idx_billing_type (billing_type),
    INDEX idx_invoice_number (invoice_number),
    CONSTRAINT fk_billing_user FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_billing_subscription FOREIGN KEY (subscription_uuid) REFERENCES user_subscriptions(uuid) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_billing_payment FOREIGN KEY (payment_uuid) REFERENCES payments(uuid) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_billing_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`

module.exports = billingHistorySchema