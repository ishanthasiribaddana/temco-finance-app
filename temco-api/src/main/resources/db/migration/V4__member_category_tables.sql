-- Migration V4: Add member_type, member_category table, and member_has_category association table
-- Date: 2026-02-07

-- 1. Add member_type enum column to member table
ALTER TABLE member ADD COLUMN member_type ENUM('Individual Member', 'Organizational Member') NOT NULL DEFAULT 'Individual Member';

-- 2. Rename general_user_profile_id to general_user_or_org_profile_id
ALTER TABLE member CHANGE COLUMN general_user_profile_id general_user_or_org_profile_id INT(11) NOT NULL;

-- 3. Create member_category table
CREATE TABLE IF NOT EXISTS member_category (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    code VARCHAR(20),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT(11) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_category_name (name),
    UNIQUE KEY uk_category_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create member_has_category association table
CREATE TABLE IF NOT EXISTS member_has_category (
    id INT(11) NOT NULL AUTO_INCREMENT,
    member_id INT(11) NOT NULL,
    member_category_id INT(11) NOT NULL,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_member_category (member_id, member_category_id),
    KEY idx_member_id (member_id),
    KEY idx_category_id (member_category_id),
    CONSTRAINT fk_mhc_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mhc_category FOREIGN KEY (member_category_id) REFERENCES member_category(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Insert default member categories
INSERT INTO member_category (name, code, description, display_order) VALUES
('Member', 'MEM', 'Regular member', 1),
('Associate Member', 'ASSOC', 'Associate member with limited privileges', 2),
('Vendor', 'VEN', 'Product or service vendor', 3),
('Customer', 'CUS', 'Customer account', 4),
('Depositor', 'DEP', 'Depositor account holder', 5),
('Lender', 'LEN', 'Lender providing funds', 6),
('Borrower', 'BOR', 'Borrower receiving loans', 7),
('Bronze Member', 'BRZ', 'Bronze tier membership', 8),
('Silver Member', 'SLV', 'Silver tier membership', 9),
('Gold Member', 'GLD', 'Gold tier membership', 10),
('Platinum Member', 'PLT', 'Platinum tier membership', 11),
('Premier Member', 'PRM', 'Premier tier membership', 12);
