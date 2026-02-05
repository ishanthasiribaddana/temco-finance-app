-- Fix partner_type_id values based on partner_code prefix
-- MBR- = Member (1), EMP- = Employee (2), C = Customer (3), Other = Vendor (4)

-- Update Members
UPDATE fin_partner 
SET partner_type_id = 1 
WHERE partner_code LIKE 'MBR-%' AND partner_type_id != 1;

-- Update Employees
UPDATE fin_partner 
SET partner_type_id = 2 
WHERE partner_code LIKE 'EMP-%' AND partner_type_id != 2;

-- Update Customers
UPDATE fin_partner 
SET partner_type_id = 3 
WHERE partner_code LIKE 'C%' AND partner_code NOT LIKE 'MBR-%' AND partner_type_id != 3;

-- Verify the fix
SELECT 
  CASE 
    WHEN partner_code LIKE 'MBR-%' THEN 'Member'
    WHEN partner_code LIKE 'EMP-%' THEN 'Employee'
    WHEN partner_code LIKE 'C%' THEN 'Customer'
    ELSE 'Vendor'
  END as expected_type,
  partner_type_id,
  COUNT(*) as count
FROM fin_partner
WHERE is_active = 1
GROUP BY expected_type, partner_type_id
ORDER BY expected_type;
