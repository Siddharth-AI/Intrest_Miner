const businessDetailsHistorySchema = `CREATE TABLE IF NOT EXISTS business_details_history (
    uuid VARCHAR(36) NOT NULL PRIMARY KEY,
    user_uuid VARCHAR(36) NOT NULL,
    productName VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    productDescription TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    promotionGoal VARCHAR(255) NOT NULL,
    targetAudience VARCHAR(255) NOT NULL,
    contactEmail VARCHAR(255) NOT NULL,
    filters JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`;
module.exports = businessDetailsHistorySchema;