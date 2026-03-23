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
│  │  ┌─────────────────────┐                                        │    │
│  │  │  finance-frontend   │   Auth via SSOService (:8085)          │    │
│  │  │  (nginx:alpine)     │   Student API via api-server (:8086)   │    │
│  │  │  Port: 80 → 8091    │                                        │    │
│  │  └─────────────────────┘                                        │    │
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
├── api-server/                       # Node.js Express API Server
│   ├── server.js                     # Main server (port 8086)
│   └── package.json
│
├── frontend/                         # React TypeScript App
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API calls
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── context/                  # State management
│   │   ├── types/                    # TypeScript interfaces
│   │   └── utils/                    # Helper functions
│   ├── vite.config.ts
│   ├── package.json
│   └── tailwind.config.js
│
├── Backend/                          # Java WildFly Application (legacy)
│   ├── src/main/java/
│   └── pom.xml
│
├── docker/                           # Docker Configuration
│   ├── Dockerfile.frontend           # Nginx frontend image
│   ├── Dockerfile.wildfly            # WildFly image (legacy)
│   ├── nginx.conf                    # Nginx routing config
│   └── docker-compose.yml            # Legacy single compose
│
├── docker-compose.base.yml           # Base Docker config
├── docker-compose.local.yml          # Local dev overrides
├── docker-compose.prod.yml           # Production overrides
├── docker-dev.ps1                    # Docker helper script
├── .env.local.example                # Environment template
│
├── schema/                           # Database SQL migrations
│   ├── V2.1__finance_schema.sql
│   └── V2.9__partner_type_tables.sql
│
├── nginx/                            # Host Nginx configs
│   └── temco.conf
│
└── docs/                             # Documentation
    └── SERVER_ARCHITECTURE.md
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

### Frontend Development

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3002
```

### API Server

```bash
cd api-server
npm install
npm start
# Runs on http://localhost:8086
```

### Docker Deployment

```bash
# Local dev
.\docker-dev.ps1 up

# Or manually:
docker-compose -f docker-compose.base.yml -f docker-compose.local.yml up -d

# Production
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d
```

## Port Mapping

| Service | Dev Port | Prod Port |
|---------|----------|-----------|
| Frontend (Vite) | 3002 | — |
| Frontend (Nginx) | — | 8091 |
| API Server (Node.js) | 8086 | 8086 |
| Auth (SSOService) | 8085 | 8085 |

## API Endpoints

Base URL: `/api`

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/accounts` | Chart of Accounts |
| `GET /api/journal-entries` | Journal Entries |
| `GET /api/vouchers` | Vouchers |
| `GET /api/partners` | Partners |
| `GET /api/students` | Student records |
| `GET /api/student-lookup` | Student search |

## License

Proprietary - TEMCO Bank
