-- Partner Type reference table
CREATE TABLE IF NOT EXISTS fin_partner_type (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_code VARCHAR(20) NOT NULL UNIQUE,
    type_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Junction table for Partner <-> Type many-to-many relationship
CREATE TABLE IF NOT EXISTS fin_partner_has_type (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_id INT NOT NULL,
    partner_type_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES fin_partner(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_type_id) REFERENCES fin_partner_type(id) ON DELETE CASCADE,
    UNIQUE KEY unique_partner_type (partner_id, partner_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Remove only CUSTOMER and VENDOR (keep Customer & Vendor, Member, Employee, Loan Customer)
DELETE FROM fin_partner_type WHERE type_code IN ('CUSTOMER', 'VENDOR');
