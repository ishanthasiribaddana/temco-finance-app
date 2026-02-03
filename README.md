# TEMCO Finance System

Finance and Accounting Application for TEMCO Bank.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                    │
│                   https://finance.temcobank.com                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  PRODUCTION SERVER (109.123.227.166)                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              HOST NGINX (SSL Termination :443)                   │    │
│  │  finance.temcobank.com     → localhost:8091                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      DOCKER CONTAINERS                           │    │
│  │  ┌─────────────────────┐   ┌─────────────────────────────────┐  │    │
│  │  │  finance-frontend   │   │     finance-wildfly              │  │    │
│  │  │  (nginx:alpine)     │──▶│     (WildFly 31 + JDK17)         │  │    │
│  │  │  Port: 80 → 8091    │API│     Port: 8080 → 8086            │  │    │
│  │  └─────────────────────┘   └─────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│  ┌─────────────────────────────────▼───────────────────────────────┐    │
│  │                     HOST MARIADB 10.6                            │    │
│  │                 Database: temco_system                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
FinanceApp/
├── Backend/                          # Java WildFly Application
│   ├── src/main/java/lk/temcobank/finance/
│   │   ├── entity/                   # JPA Entities
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── repository/               # Data Access Layer
│   │   ├── service/                  # Business Logic
│   │   ├── resource/                 # REST Controllers
│   │   ├── security/                 # JWT/Auth
│   │   └── config/                   # App Configuration
│   ├── src/main/resources/META-INF/persistence.xml
│   └── pom.xml
│
├── frontend/                         # React TypeScript App
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # 38 screens across 10 modules
│   │   ├── services/                 # API calls
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── context/                  # State management
│   │   ├── types/                    # TypeScript interfaces
│   │   └── utils/                    # Helper functions
│   ├── package.json
│   └── tailwind.config.js
│
├── docker/                           # Docker Configuration
│   ├── docker-compose.finance.yml    # Main compose file
│   ├── Dockerfile.wildfly            # WildFly image build
│   ├── finance-nginx.conf            # Nginx routing config
│   ├── standalone.xml                # WildFly datasource config
│   └── deployments/finance/          # WAR deployment folder
│
├── schema/                           # Database Versioning
│   └── V2.1__finance_schema.sql
│
└── docs/                             # Documentation
```

## Database Tables (14)

| Table | Description |
|-------|-------------|
| `fin_account_category` | Asset, Liability, Equity, Revenue, Expense |
| `fin_chart_of_account` | Recursive COA with parent_id |
| `fin_revenue_center` | Revenue center tracking |
| `fin_fiscal_year` | Fiscal year definitions |
| `fin_fiscal_period` | Monthly periods |
| `fin_partner` | Customers/Vendors |
| `fin_journal_entry` | Journal header (ACTUAL/BUDGET) |
| `fin_journal_entry_manager` | Journal line items |
| `fin_voucher` | Voucher header |
| `fin_voucher_item` | Base voucher item definitions |
| `fin_voucher_item_manager` | Voucher ↔ Item association |
| `fin_voucher_approval` | Approval workflow |
| `fin_bank_reconciliation` | Bank recon header |
| `fin_bank_reconciliation_item` | Bank recon items |

## Quick Start

### Backend Development

```bash
cd Backend
mvn clean package
# Deploy temco-finance.war to WildFly
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Docker Deployment

```bash
cd docker
docker-compose -f docker-compose.finance.yml up -d
```

## Port Mapping

| Service | Internal Port | External Port |
|---------|--------------|---------------|
| finance-frontend | 80 | 8091 |
| finance-wildfly | 8080 | 8086 |
| finance-wildfly (admin) | 9990 | 9993 |

## API Endpoints

Base URL: `/api`

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/accounts` | Chart of Accounts |
| `GET /api/journal-entries` | Journal Entries |
| `GET /api/vouchers` | Vouchers |
| `GET /api/partners` | Partners |

## License

Proprietary - TEMCO Bank
