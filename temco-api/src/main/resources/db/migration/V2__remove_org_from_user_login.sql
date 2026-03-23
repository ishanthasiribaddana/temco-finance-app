-- V2: Remove general_organization_profile_id from user_login table
-- Organization context should be per-session (in login_session table), not per-user
-- Note: This is a safe migration - column may or may not exist

-- MySQL compatible syntax
SET @dbname = DATABASE();
SET @tablename = 'user_login';
SET @columnname = 'general_organization_profile_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  CONCAT('ALTER TABLE ', @tablename, ' DROP COLUMN ', @columnname),
  'SELECT 1'
));
PREPARE alterIfExists FROM @preparedStatement;
EXECUTE alterIfExists;
DEALLOCATE PREPARE alterIfExists;
