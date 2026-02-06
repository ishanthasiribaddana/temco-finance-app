-- Flyway Baseline Migration V1
-- This captures the current production schema for new deployments
-- Existing databases will be baselined, new ones will run this script

-- Session token table for JWT/token-based authentication
CREATE TABLE IF NOT EXISTS com_session_token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_login_id INT NOT NULL,
    application_id INT,
    token_hash VARCHAR(512) NOT NULL,
    token_type ENUM('ACCESS', 'REFRESH') DEFAULT 'ACCESS',
    issued_at DATETIME,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_login_id) REFERENCES user_login(id)
);

-- Login attempt tracking for security auditing
CREATE TABLE IF NOT EXISTS com_login_attempt (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    application_id INT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    attempt_time DATETIME,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255)
);

-- Password reset token table
CREATE TABLE IF NOT EXISTS password_reset_token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_login_id INT NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    FOREIGN KEY (user_login_id) REFERENCES user_login(id)
);

-- Add application_id to login_session if it doesn't exist
-- Note: This is idempotent - won't fail if column already exists
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() 
               AND TABLE_NAME = 'login_session' 
               AND COLUMN_NAME = 'application_id');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE login_session ADD COLUMN application_id INT', 
    'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
