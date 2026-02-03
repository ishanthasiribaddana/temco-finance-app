-- ============================================================
-- TEMCO BANK - FINANCE & ACCOUNTING SYSTEM
-- Database Schema v2.0
-- ============================================================

-- ============================================================
-- COMMON TABLES (com_* prefix)
-- ============================================================

-- Application Registry
CREATE TABLE IF NOT EXISTS com_application (
    id INT PRIMARY KEY AUTO_INCREMENT,
    app_code VARCHAR(50) NOT NULL UNIQUE,
    app_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    base_url VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session Token Management
CREATE TABLE IF NOT EXISTS com_session_token (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_login_id INT NOT NULL,
    application_id INT,
    token_hash VARCHAR(512) NOT NULL,
    token_type ENUM('ACCESS', 'REFRESH') DEFAULT 'ACCESS',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (user_login_id) REFERENCES user_login(id),
    FOREIGN KEY (application_id) REFERENCES com_application(id),
    INDEX idx_token_hash (token_hash(255)),
    INDEX idx_user_active (user_login_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login Attempt Tracking
CREATE TABLE IF NOT EXISTS com_login_attempt (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    application_id INT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success TINYINT(1) DEFAULT 0,
    failure_reason VARCHAR(255),
    FOREIGN KEY (application_id) REFERENCES com_application(id),
    INDEX idx_username_time (username, attempt_time),
    INDEX idx_ip_time (ip_address, attempt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- FINANCE TABLES (fin_* prefix)
-- ============================================================

-- Account Category (Asset, Liability, Equity, Revenue, Expense)
CREATE TABLE IF NOT EXISTS fin_account_category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_code VARCHAR(10) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    normal_balance ENUM('DEBIT', 'CREDIT') NOT NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recursive Chart of Accounts
CREATE TABLE IF NOT EXISTS fin_chart_of_account (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_code VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(150) NOT NULL,
    parent_id INT NULL,
    account_category_id INT NOT NULL,
    account_level INT DEFAULT 1,
    is_header TINYINT(1) DEFAULT 0,
    is_posting TINYINT(1) DEFAULT 1,
    normal_balance ENUM('DEBIT', 'CREDIT') NOT NULL,
    description VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    is_system TINYINT(1) DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES fin_chart_of_account(id),
    FOREIGN KEY (account_category_id) REFERENCES fin_account_category(id),
    FOREIGN KEY (created_by) REFERENCES user_login(id),
    INDEX idx_parent (parent_id),
    INDEX idx_category (account_category_id),
    INDEX idx_code (account_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fiscal Year
CREATE TABLE IF NOT EXISTS fin_fiscal_year (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year_code VARCHAR(20) NOT NULL UNIQUE,
    year_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed TINYINT(1) DEFAULT 0,
    closed_by INT,
    closed_at TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (closed_by) REFERENCES user_login(id),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fiscal Period (Monthly/Quarterly)
CREATE TABLE IF NOT EXISTS fin_fiscal_period (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fiscal_year_id INT NOT NULL,
    period_number INT NOT NULL,
    period_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed TINYINT(1) DEFAULT 0,
    closed_by INT,
    closed_at TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (fiscal_year_id) REFERENCES fin_fiscal_year(id),
    FOREIGN KEY (closed_by) REFERENCES user_login(id),
    UNIQUE KEY uk_year_period (fiscal_year_id, period_number),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cost Center
CREATE TABLE IF NOT EXISTS fin_cost_center (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cost_center_code VARCHAR(20) NOT NULL UNIQUE,
    cost_center_name VARCHAR(150) NOT NULL,
    parent_id INT NULL,
    organization_id INT,
    description VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES fin_cost_center(id),
    FOREIGN KEY (organization_id) REFERENCES general_organization_profile(id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Financial Partner (Customers/Vendors for Finance)
CREATE TABLE IF NOT EXISTS fin_partner (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_code VARCHAR(20) NOT NULL UNIQUE,
    partner_name VARCHAR(200) NOT NULL,
    partner_type ENUM('CUSTOMER', 'VENDOR', 'BOTH') NOT NULL,
    user_profile_id INT,
    organization_id INT,
    tax_id VARCHAR(50),
    credit_limit DECIMAL(18,2) DEFAULT 0,
    payment_terms_days INT DEFAULT 30,
    default_account_id INT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_profile_id) REFERENCES general_user_profile(id),
    FOREIGN KEY (organization_id) REFERENCES general_organization_profile(id),
    FOREIGN KEY (default_account_id) REFERENCES fin_chart_of_account(id),
    INDEX idx_type (partner_type),
    INDEX idx_user (user_profile_id),
    INDEX idx_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget Header
CREATE TABLE IF NOT EXISTS fin_budget (
    id INT PRIMARY KEY AUTO_INCREMENT,
    budget_code VARCHAR(20) NOT NULL UNIQUE,
    budget_name VARCHAR(150) NOT NULL,
    fiscal_year_id INT NOT NULL,
    cost_center_id INT,
    total_amount DECIMAL(18,2) DEFAULT 0,
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CLOSED') DEFAULT 'DRAFT',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    description VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fiscal_year_id) REFERENCES fin_fiscal_year(id),
    FOREIGN KEY (cost_center_id) REFERENCES fin_cost_center(id),
    FOREIGN KEY (approved_by) REFERENCES user_login(id),
    FOREIGN KEY (created_by) REFERENCES user_login(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget Line Items
CREATE TABLE IF NOT EXISTS fin_budget_line (
    id INT PRIMARY KEY AUTO_INCREMENT,
    budget_id INT NOT NULL,
    account_id INT NOT NULL,
    fiscal_period_id INT,
    budgeted_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    actual_amount DECIMAL(18,2) DEFAULT 0,
    variance_amount DECIMAL(18,2) GENERATED ALWAYS AS (budgeted_amount - actual_amount) STORED,
    notes VARCHAR(500),
    FOREIGN KEY (budget_id) REFERENCES fin_budget(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES fin_chart_of_account(id),
    FOREIGN KEY (fiscal_period_id) REFERENCES fin_fiscal_period(id),
    UNIQUE KEY uk_budget_account_period (budget_id, account_id, fiscal_period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Journal Entry Header
CREATE TABLE IF NOT EXISTS fin_journal_entry (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entry_number VARCHAR(30) NOT NULL UNIQUE,
    entry_date DATE NOT NULL,
    fiscal_period_id INT NOT NULL,
    reference_number VARCHAR(50),
    description VARCHAR(500) NOT NULL,
    total_debit DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(18,2) NOT NULL DEFAULT 0,
    status ENUM('DRAFT', 'PENDING', 'POSTED', 'REVERSED') DEFAULT 'DRAFT',
    is_auto_generated TINYINT(1) DEFAULT 0,
    source_type VARCHAR(50),
    source_id INT,
    posted_by INT,
    posted_at TIMESTAMP NULL,
    reversed_by INT,
    reversed_at TIMESTAMP NULL,
    reversal_entry_id INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fiscal_period_id) REFERENCES fin_fiscal_period(id),
    FOREIGN KEY (posted_by) REFERENCES user_login(id),
    FOREIGN KEY (reversed_by) REFERENCES user_login(id),
    FOREIGN KEY (reversal_entry_id) REFERENCES fin_journal_entry(id),
    FOREIGN KEY (created_by) REFERENCES user_login(id),
    INDEX idx_date (entry_date),
    INDEX idx_status (status),
    INDEX idx_period (fiscal_period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Journal Entry Line Items
CREATE TABLE IF NOT EXISTS fin_journal_entry_line (
    id INT PRIMARY KEY AUTO_INCREMENT,
    journal_entry_id INT NOT NULL,
    line_number INT NOT NULL,
    account_id INT NOT NULL,
    cost_center_id INT,
    partner_id INT,
    credit_or_debit_id INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    description VARCHAR(300),
    FOREIGN KEY (journal_entry_id) REFERENCES fin_journal_entry(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES fin_chart_of_account(id),
    FOREIGN KEY (cost_center_id) REFERENCES fin_cost_center(id),
    FOREIGN KEY (partner_id) REFERENCES fin_partner(id),
    FOREIGN KEY (credit_or_debit_id) REFERENCES credit_or_debit(id),
    INDEX idx_account (account_id),
    INDEX idx_entry (journal_entry_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Unified Voucher (extends existing voucher concept)
CREATE TABLE IF NOT EXISTS fin_voucher (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voucher_number VARCHAR(30) NOT NULL UNIQUE,
    voucher_type_id INT NOT NULL,
    voucher_status_id INT NOT NULL,
    voucher_date DATE NOT NULL,
    fiscal_period_id INT NOT NULL,
    partner_id INT,
    reference_number VARCHAR(50),
    description VARCHAR(500),
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    currency_code VARCHAR(3) DEFAULT 'LKR',
    exchange_rate DECIMAL(12,6) DEFAULT 1.000000,
    journal_entry_id INT,
    payment_method ENUM('CASH', 'CHEQUE', 'TRANSFER', 'OTHER'),
    cheque_number VARCHAR(30),
    bank_account_id INT,
    due_date DATE,
    login_session_id INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_type_id) REFERENCES voucher_type(id),
    FOREIGN KEY (voucher_status_id) REFERENCES voucher_status(id),
    FOREIGN KEY (fiscal_period_id) REFERENCES fin_fiscal_period(id),
    FOREIGN KEY (partner_id) REFERENCES fin_partner(id),
    FOREIGN KEY (journal_entry_id) REFERENCES fin_journal_entry(id),
    FOREIGN KEY (bank_account_id) REFERENCES bank_account(id),
    FOREIGN KEY (login_session_id) REFERENCES login_session(id),
    FOREIGN KEY (created_by) REFERENCES user_login(id),
    INDEX idx_date (voucher_date),
    INDEX idx_type (voucher_type_id),
    INDEX idx_status (voucher_status_id),
    INDEX idx_partner (partner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Voucher Line Items
CREATE TABLE IF NOT EXISTS fin_voucher_line (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voucher_id INT NOT NULL,
    line_number INT NOT NULL,
    account_id INT NOT NULL,
    cost_center_id INT,
    credit_or_debit_id INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    tax_amount DECIMAL(18,2) DEFAULT 0,
    description VARCHAR(300),
    FOREIGN KEY (voucher_id) REFERENCES fin_voucher(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES fin_chart_of_account(id),
    FOREIGN KEY (cost_center_id) REFERENCES fin_cost_center(id),
    FOREIGN KEY (credit_or_debit_id) REFERENCES credit_or_debit(id),
    INDEX idx_voucher (voucher_id),
    INDEX idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Voucher Approval Workflow
CREATE TABLE IF NOT EXISTS fin_voucher_approval (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voucher_id INT NOT NULL,
    approval_level INT NOT NULL,
    approver_id INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED') DEFAULT 'PENDING',
    comments VARCHAR(500),
    action_at TIMESTAMP NULL,
    login_session_id INT,
    FOREIGN KEY (voucher_id) REFERENCES fin_voucher(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES user_login(id),
    FOREIGN KEY (login_session_id) REFERENCES login_session(id),
    INDEX idx_voucher (voucher_id),
    INDEX idx_approver (approver_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Reconciliation Header
CREATE TABLE IF NOT EXISTS fin_bank_reconciliation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reconciliation_number VARCHAR(30) NOT NULL UNIQUE,
    bank_account_id INT NOT NULL,
    fiscal_period_id INT NOT NULL,
    statement_date DATE NOT NULL,
    statement_balance DECIMAL(18,2) NOT NULL,
    book_balance DECIMAL(18,2) NOT NULL,
    adjusted_balance DECIMAL(18,2),
    status ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED') DEFAULT 'DRAFT',
    completed_by INT,
    completed_at TIMESTAMP NULL,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    notes VARCHAR(500),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_account_id) REFERENCES bank_account(id),
    FOREIGN KEY (fiscal_period_id) REFERENCES fin_fiscal_period(id),
    FOREIGN KEY (completed_by) REFERENCES user_login(id),
    FOREIGN KEY (approved_by) REFERENCES user_login(id),
    FOREIGN KEY (created_by) REFERENCES user_login(id),
    INDEX idx_bank_period (bank_account_id, fiscal_period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Reconciliation Items
CREATE TABLE IF NOT EXISTS fin_bank_reconciliation_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reconciliation_id INT NOT NULL,
    item_type ENUM('OUTSTANDING_CHEQUE', 'DEPOSIT_IN_TRANSIT', 'BANK_CHARGE', 'BANK_INTEREST', 'ERROR', 'OTHER') NOT NULL,
    reference_number VARCHAR(50),
    transaction_date DATE NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    description VARCHAR(300),
    is_cleared TINYINT(1) DEFAULT 0,
    cleared_date DATE,
    voucher_id INT,
    FOREIGN KEY (reconciliation_id) REFERENCES fin_bank_reconciliation(id) ON DELETE CASCADE,
    FOREIGN KEY (voucher_id) REFERENCES fin_voucher(id),
    INDEX idx_reconciliation (reconciliation_id),
    INDEX idx_cleared (is_cleared)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert Application Registry
INSERT INTO com_application (app_code, app_name, description, base_url) VALUES
('ADMIN', 'Admin Panel', 'System Administration Application', 'https://adminpanel.temcobank.com'),
('LENDING', 'Lending System', 'Loan Management Application', 'https://lending.temcobank.com'),
('CUSTOMER', 'Customer Portal', 'Member Self-Service Portal', 'https://my.temcobank.com'),
('FINANCE', 'Finance System', 'Finance & Accounting Application', 'https://finance.temcobank.com')
ON DUPLICATE KEY UPDATE app_name = VALUES(app_name);

-- Insert Account Categories
INSERT INTO fin_account_category (category_code, category_name, normal_balance, display_order) VALUES
('ASSET', 'Assets', 'DEBIT', 1),
('LIAB', 'Liabilities', 'CREDIT', 2),
('EQUITY', 'Equity', 'CREDIT', 3),
('REV', 'Revenue', 'CREDIT', 4),
('EXP', 'Expenses', 'DEBIT', 5)
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- Insert Root Chart of Accounts (Level 1)
INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system) VALUES
('1000', 'ASSETS', NULL, 1, 1, 1, 0, 'DEBIT', 1),
('2000', 'LIABILITIES', NULL, 2, 1, 1, 0, 'CREDIT', 1),
('3000', 'EQUITY', NULL, 3, 1, 1, 0, 'CREDIT', 1),
('4000', 'REVENUE', NULL, 4, 1, 1, 0, 'CREDIT', 1),
('5000', 'EXPENSES', NULL, 5, 1, 1, 0, 'DEBIT', 1)
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

-- Insert Sample Level 2 Accounts
INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system)
SELECT '1100', 'Current Assets', id, 1, 2, 1, 0, 'DEBIT', 1 FROM fin_chart_of_account WHERE account_code = '1000'
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system)
SELECT '1200', 'Fixed Assets', id, 1, 2, 1, 0, 'DEBIT', 1 FROM fin_chart_of_account WHERE account_code = '1000'
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system)
SELECT '2100', 'Current Liabilities', id, 2, 2, 1, 0, 'CREDIT', 1 FROM fin_chart_of_account WHERE account_code = '2000'
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system)
SELECT '2200', 'Long-term Liabilities', id, 2, 2, 1, 0, 'CREDIT', 1 FROM fin_chart_of_account WHERE account_code = '2000'
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

-- Insert Sample Level 3 Posting Accounts
INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system)
SELECT '1101', 'Cash on Hand', id, 1, 3, 0, 1, 'DEBIT', 1 FROM fin_chart_of_account WHERE account_code = '1100'
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system)
SELECT '1102', 'Bank Accounts', id, 1, 3, 0, 1, 'DEBIT', 1 FROM fin_chart_of_account WHERE account_code = '1100'
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system)
SELECT '1103', 'Accounts Receivable', id, 1, 3, 0, 1, 'DEBIT', 1 FROM fin_chart_of_account WHERE account_code = '1100'
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

INSERT INTO fin_chart_of_account (account_code, account_name, parent_id, account_category_id, account_level, is_header, is_posting, normal_balance, is_system)
SELECT '2101', 'Accounts Payable', id, 2, 3, 0, 1, 'CREDIT', 1 FROM fin_chart_of_account WHERE account_code = '2100'
ON DUPLICATE KEY UPDATE account_name = VALUES(account_name);

-- Insert Sample Fiscal Year
INSERT INTO fin_fiscal_year (year_code, year_name, start_date, end_date) VALUES
('FY2025', 'Fiscal Year 2025', '2025-01-01', '2025-12-31'),
('FY2026', 'Fiscal Year 2026', '2026-01-01', '2026-12-31')
ON DUPLICATE KEY UPDATE year_name = VALUES(year_name);

-- Insert Fiscal Periods for FY2026
INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 1, 'January 2026', '2026-01-01', '2026-01-31' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 2, 'February 2026', '2026-02-01', '2026-02-28' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 3, 'March 2026', '2026-03-01', '2026-03-31' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 4, 'April 2026', '2026-04-01', '2026-04-30' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 5, 'May 2026', '2026-05-01', '2026-05-31' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 6, 'June 2026', '2026-06-01', '2026-06-30' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 7, 'July 2026', '2026-07-01', '2026-07-31' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 8, 'August 2026', '2026-08-01', '2026-08-31' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 9, 'September 2026', '2026-09-01', '2026-09-30' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 10, 'October 2026', '2026-10-01', '2026-10-31' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 11, 'November 2026', '2026-11-01', '2026-11-30' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

INSERT INTO fin_fiscal_period (fiscal_year_id, period_number, period_name, start_date, end_date)
SELECT id, 12, 'December 2026', '2026-12-01', '2026-12-31' FROM fin_fiscal_year WHERE year_code = 'FY2026'
ON DUPLICATE KEY UPDATE period_name = VALUES(period_name);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
SELECT 'Schema creation completed successfully!' AS status;
SELECT 'New Tables Created:' AS info;
SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'temco_system' AND TABLE_NAME LIKE 'fin_%' OR TABLE_NAME LIKE 'com_%' ORDER BY TABLE_NAME;
