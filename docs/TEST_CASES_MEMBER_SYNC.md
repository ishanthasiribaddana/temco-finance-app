# Test Cases: Member-to-Partner Sync

## Prerequisites

### 1. Start Both Applications

**Terminal 1 - Finance App (WildFly on port 8086):**
```bash
cd f:\TemcoERP\FinanceApp\Backend
mvn clean package
# Deploy temco-finance.war to WildFly
```

**Terminal 2 - Admin App (WildFly on port 8080):**
```bash
cd f:\TemcoERP\AdminApp\Backend
mvn clean package
# Deploy to WildFly
```

**Environment Variable (AdminApp):**
```bash
set FINANCE_API_URL=http://localhost:8086/temco-finance/api
```

### 2. Verify Database
```bash
docker exec temco-admin-mariadb mysql -uroot -p'6qZB6d@pIvj' temco_system -e "SELECT COUNT(*) FROM member;"
docker exec temco-admin-mariadb mysql -uroot -p'6qZB6d@pIvj' temco_system -e "SELECT COUNT(*) FROM fin_partner;"
```

---

## Test Case 1: Finance API Health Check

**Objective:** Verify Finance App API is running

**Request:**
```bash
curl -X GET http://localhost:8086/temco-finance/api/partners/health
```

**Expected Response:**
```json
{
  "status": "UP",
  "service": "Partner API"
}
```

**Pass Criteria:** HTTP 200, status = "UP"

---

## Test Case 2: Get Partner Counts (Before Sync)

**Objective:** Verify partner counts are zero before sync

**Request:**
```bash
curl -X GET http://localhost:8086/temco-finance/api/partners/counts
```

**Expected Response:**
```json
{
  "customers": 0,
  "vendors": 0,
  "total": 0
}
```

**Pass Criteria:** HTTP 200, all counts = 0

---

## Test Case 3: Sync Single Member to Finance

**Objective:** Sync one member from AdminApp to FinanceApp

**Step 1 - Get a member ID:**
```bash
curl -X GET "http://localhost:8080/temco-bank-system-project/api/members?page=0&size=1"
```

**Step 2 - Sync that member (replace {ID} with actual member ID):**
```bash
curl -X POST http://localhost:8080/temco-bank-system-project/api/members/{ID}/sync-to-finance
```

**Expected Response:**
```json
{
  "status": "success",
  "memberId": {ID}
}
```

**Step 3 - Verify partner was created:**
```bash
curl -X GET http://localhost:8086/temco-finance/api/partners
```

**Pass Criteria:** 
- HTTP 200 on sync
- Partner appears in Finance App with correct name
- partner_type = "CUSTOMER"

---

## Test Case 4: Sync All Members to Finance

**Objective:** Bulk sync all 183 members

**Request:**
```bash
curl -X POST http://localhost:8080/temco-bank-system-project/api/members/sync-to-finance
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Members synced to Finance App"
}
```

**Verify:**
```bash
curl -X GET http://localhost:8086/temco-finance/api/partners/counts
```

**Expected:**
```json
{
  "customers": 183,
  "vendors": 0,
  "total": 183
}
```

**Database Verify:**
```bash
docker exec temco-admin-mariadb mysql -uroot -p'6qZB6d@pIvj' temco_system -e "SELECT COUNT(*) FROM fin_partner WHERE partner_type='CUSTOMER';"
```

**Pass Criteria:** 183 partners created with type CUSTOMER

---

## Test Case 5: Duplicate Sync Prevention

**Objective:** Verify syncing same member twice doesn't create duplicates

**Request (run twice):**
```bash
curl -X POST http://localhost:8080/temco-bank-system-project/api/members/1/sync-to-finance
curl -X POST http://localhost:8080/temco-bank-system-project/api/members/1/sync-to-finance
```

**Verify count:**
```bash
docker exec temco-admin-mariadb mysql -uroot -p'6qZB6d@pIvj' temco_system -e "SELECT COUNT(*) FROM fin_partner WHERE user_profile_id=1;"
```

**Pass Criteria:** Count = 1 (no duplicates)

---

## Test Case 6: Direct Partner Creation via Finance API

**Objective:** Create a partner directly in Finance App

**Request:**
```bash
curl -X POST http://localhost:8086/temco-finance/api/partners \
  -H "Content-Type: application/json" \
  -d '{
    "partnerName": "Test Vendor Ltd",
    "partnerType": "VENDOR",
    "taxId": "TIN-99999999",
    "creditLimit": 100000,
    "paymentTermsDays": 45
  }'
```

**Expected Response:**
```json
{
  "id": ...,
  "partnerCode": "V00001",
  "partnerName": "Test Vendor Ltd",
  "partnerType": "VENDOR",
  ...
}
```

**Pass Criteria:** HTTP 201, partnerCode auto-generated

---

## Test Case 7: Update Partner

**Objective:** Update an existing partner

**Request:**
```bash
curl -X PUT http://localhost:8086/temco-finance/api/partners/1 \
  -H "Content-Type: application/json" \
  -d '{
    "partnerName": "Updated Partner Name",
    "partnerType": "CUSTOMER",
    "creditLimit": 50000
  }'
```

**Pass Criteria:** HTTP 200, partner updated

---

## Test Case 8: Delete Partner

**Objective:** Delete a partner

**Request:**
```bash
curl -X DELETE http://localhost:8086/temco-finance/api/partners/1
```

**Pass Criteria:** HTTP 204

---

## Test Case 9: Filter Partners by Type

**Objective:** Get only customers or vendors

**Request - Customers only:**
```bash
curl -X GET "http://localhost:8086/temco-finance/api/partners?type=CUSTOMER"
```

**Request - Vendors only:**
```bash
curl -X GET "http://localhost:8086/temco-finance/api/partners?type=VENDOR"
```

**Pass Criteria:** Returns filtered results

---

## Test Case 10: Error Handling - Finance API Down

**Objective:** AdminApp handles Finance API unavailability gracefully

**Steps:**
1. Stop Finance App WildFly
2. Try to sync a member:
```bash
curl -X POST http://localhost:8080/temco-bank-system-project/api/members/1/sync-to-finance
```

**Expected Response:**
```json
{
  "error": "Member not found or sync failed"
}
```

**Pass Criteria:** No crash, returns error message

---

## Quick Test Script (PowerShell)

```powershell
# Save as test-sync.ps1

Write-Host "=== Test 1: Finance API Health ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:8086/temco-finance/api/partners/health" -Method GET

Write-Host "`n=== Test 2: Partner Counts ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:8086/temco-finance/api/partners/counts" -Method GET

Write-Host "`n=== Test 3: Get Members ===" -ForegroundColor Cyan
$members = Invoke-RestMethod -Uri "http://localhost:8080/temco-bank-system-project/api/members?page=0&size=1" -Method GET
$members.content

Write-Host "`n=== Test 4: Sync All Members ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:8080/temco-bank-system-project/api/members/sync-to-finance" -Method POST

Write-Host "`n=== Test 5: Final Partner Count ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:8086/temco-finance/api/partners/counts" -Method GET

Write-Host "`nTests Complete!" -ForegroundColor Green
```

---

## Expected Final State

| Table | Expected Count |
|-------|----------------|
| member | 183 |
| fin_partner (CUSTOMER) | 183 |
| fin_partner (VENDOR) | 0 |

