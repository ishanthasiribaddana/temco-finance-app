-- V3: Create User Management system interface and grant Super Admin access

-- Create system_interface table if not exists
CREATE TABLE IF NOT EXISTS system_interface (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interface_code VARCHAR(100) NOT NULL UNIQUE,
    interface_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES system_interface(id)
);

-- Create user_role_has_system_interface table if not exists
CREATE TABLE IF NOT EXISTS user_role_has_system_interface (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_role_id INT NOT NULL,
    system_interface_id INT NOT NULL,
    can_view BOOLEAN DEFAULT TRUE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_role_id) REFERENCES user_role(id),
    FOREIGN KEY (system_interface_id) REFERENCES system_interface(id),
    UNIQUE KEY uk_role_interface (user_role_id, system_interface_id)
);

-- Insert User Management interface
INSERT INTO system_interface (interface_code, interface_name, description, is_active)
VALUES ('USER_MANAGEMENT', 'User Management', 'Manage partners and reset passwords', TRUE)
ON DUPLICATE KEY UPDATE interface_name = VALUES(interface_name);

-- Grant Super Admin (role_id = 10) full access to User Management
INSERT INTO user_role_has_system_interface (user_role_id, system_interface_id, can_view, can_create, can_edit, can_delete, is_active)
SELECT 10, id, TRUE, TRUE, TRUE, TRUE, TRUE
FROM system_interface 
WHERE interface_code = 'USER_MANAGEMENT'
ON DUPLICATE KEY UPDATE can_view = TRUE, can_create = TRUE, can_edit = TRUE, can_delete = TRUE;
