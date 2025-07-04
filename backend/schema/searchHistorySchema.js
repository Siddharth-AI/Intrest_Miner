const searchHistorySchema = `
CREATE TABLE IF NOT EXISTS search_history (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL,
    user_uuid VARCHAR(36) NOT NULL,
    raw_search_text TEXT NOT NULL,
    normalized_search_text VARCHAR(255),
    type VARCHAR(20) DEFAULT 'text',
    category VARCHAR(100) DEFAULT 'general',
    filters JSON DEFAULT NULL,
    visit_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    INDEX idx_user_uuid (user_uuid),
    INDEX idx_created_at (created_at),
    INDEX idx_last_visited (last_visited),
    INDEX idx_search_type (type),
    INDEX idx_category (category),
    INDEX idx_visit_count (visit_count),
    FULLTEXT INDEX idx_search_text (normalized_search_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`;

module.exports = searchHistorySchema;