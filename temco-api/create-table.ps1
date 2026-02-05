$sql = @"
CREATE TABLE IF NOT EXISTS password_reset_token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_login_id INT NOT NULL,
    token VARCHAR(6) NOT NULL,
    token_type ENUM('PASSWORD_RESET', 'ACCOUNT_UNLOCK') NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_login_id) REFERENCES user_login(id) ON DELETE CASCADE,
    INDEX idx_user_token (user_login_id, token, token_type),
    INDEX idx_expires (expires_at)
);
"@

$body = @{
    query = $sql
} | ConvertTo-Json

# Use the Node.js server to execute the SQL (since it has DB access)
Write-Host "Please run this SQL in your database:"
Write-Host $sql
