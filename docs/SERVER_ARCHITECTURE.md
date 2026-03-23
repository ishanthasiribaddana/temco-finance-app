# Temco ERP - Server Architecture Document

**Version:** 1.0  
**Last Updated:** February 2026  
**Author:** DevOps Team

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Application Components](#3-application-components)
4. [Multi-Repo Orchestration](#4-multi-repo-orchestration)
5. [Dev-Prod Parity](#5-dev-prod-parity)
6. [Docker Configuration](#6-docker-configuration)
7. [Network Architecture](#7-network-architecture)
8. [SSO Architecture](#8-sso-architecture)
9. [Database Architecture](#9-database-architecture)
10. [Deployment Pipeline](#10-deployment-pipeline)
11. [Environment Configuration](#11-environment-configuration)
12. [Quick Start Guide](#12-quick-start-guide)

---

## 1. Overview

Temco ERP is a multi-application banking system consisting of three independently deployable applications that share a common database and Single Sign-On (SSO) authentication system.

### 1.1 Applications

| Application | Purpose | Port (Local) | Port (Prod) |
|-------------|---------|--------------|-------------|
| **FinanceApp** | Core banking operations, SSO provider | 3001 / 8080 | 8091 / 8087 |
| **AdminApp** | System administration | 3000 / 8080 | 8089 / 8088 |
| **Customer Portal** | Customer self-service | 3002 | 8092 |

### 1.2 Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        TECHNOLOGY STACK                         │
├─────────────────────────────────────────────────────────────────┤
│  Frontend    │  React 18 + TypeScript + Vite + TailwindCSS     │
│  Backend     │  Java 17 + WildFly 27 + JPA/Hibernate           │
│  Database    │  MariaDB 10.6                                    │
│  Cache       │  Redis 7                                         │
│  Web Server  │  Nginx (production)                              │
│  Container   │  Docker + Docker Compose                         │
│  CI/CD       │  GitHub Actions                                  │
│  SSL         │  Cloudflare Origin Certificate (*.temcobank.com) │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
                                    INTERNET
                                        │
                                        ▼
                            ┌───────────────────┐
                            │   Nginx Reverse   │
                            │      Proxy        │
                            │   (SSL Termination)│
                            └─────────┬─────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   admin.temcobank   │  │ finance.temcobank   │  │ portal.temcobank    │
│        .com         │  │       .com          │  │       .com          │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │
│  │ Nginx Static  │  │  │  │ Nginx Static  │  │  │  │ Nginx Static  │  │
│  │   (React)     │  │  │  │   (React)     │  │  │  │   (React)     │  │
│  │   :8089       │  │  │  │   :8091       │  │  │  │   :8092       │  │
│  └───────┬───────┘  │  │  └───────┬───────┘  │  │  └───────────────┘  │
│          │          │  │          │          │  │         │           │
│          ▼          │  │          ▼          │  │         │           │
│  ┌───────────────┐  │  │  ┌───────────────┐  │  │         │           │
│  │   WildFly     │  │  │  │   WildFly     │  │  │         │           │
│  │  (Java API)   │  │  │  │ (Java API +   │  │  │         │           │
│  │   :8088       │  │  │  │  SSO Provider)│  │  │         │           │
│  │               │  │  │  │   :8087       │  │  │         │           │
│  └───────────────┘  │  │  └───────────────┘  │  │         │           │
│          │          │  │          │          │  │         │           │
└──────────┼──────────┘  └──────────┼──────────┘  └─────────┼───────────┘
           │                        │                       │
           └────────────────────────┼───────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      MariaDB        │
                         │   temco_system      │
                         │      :3306          │
                         └─────────────────────┘
```

### 2.2 Production Server Specifications

| Component | Specification |
|-----------|---------------|
| **Server** | Ubuntu 22.04 LTS |
| **IP** | 109.123.227.166 |
| **CPU** | 4 vCPU |
| **RAM** | 8 GB |
| **Storage** | 100 GB SSD |
| **Domains** | *.temcobank.com |

---

## 3. Application Components

### 3.1 AdminApp

```
AdminApp/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/                 # API clients
│   │   └── context/             # Auth context
│   ├── package.json
│   └── vite.config.ts
├── Backend/                     # Java Backend
│   ├── src/main/java/
│   └── pom.xml
├── docker-compose.base.yml      # Shared config
├── docker-compose.local.yml     # Local dev overrides
├── docker-compose.prod.yml      # Production overrides
├── docker-dev.ps1               # Helper script
├── Dockerfile.wildfly           # Backend container
└── admin-nginx.conf             # Production nginx
```

### 3.2 FinanceApp (SSO Provider)

```
FinanceApp/
├── frontend/                    # React Frontend
├── Backend/                     # Java Backend + SSO API
│   └── src/main/java/
│       └── auth/                # SSO endpoints
├── docker-compose.base.yml
├── docker-compose.local.yml
├── docker-compose.prod.yml
├── docker-dev.ps1
└── docker/
    └── finance-nginx.conf
```

### 3.3 Customer Portal

```
customer-portal/
├── src/                         # React Frontend only
├── docker-compose.base.yml
├── docker-compose.local.yml
├── docker-compose.prod.yml
├── docker-dev.ps1
├── Dockerfile
└── nginx.conf
```

---

## 4. Multi-Repo Orchestration

### 4.1 Repository Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        GITHUB REPOSITORIES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│   │ temco-admin-app │  │temco-finance-app│  │ customer-portal │ │
│   │                 │  │                 │  │                 │ │
│   │  - Independent  │  │  - SSO Provider │  │  - Frontend only│ │
│   │  - Own CI/CD    │  │  - Own CI/CD    │  │  - Own CI/CD    │ │
│   │  - Own Docker   │  │  - Own Docker   │  │  - Own Docker   │ │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Why Multi-Repo?

| Benefit | Description |
|---------|-------------|
| **Independent Deployments** | Deploy one app without affecting others |
| **Team Autonomy** | Teams can work on different apps independently |
| **Smaller CI/CD Pipelines** | Faster builds per application |
| **Access Control** | Different teams can have different access levels |
| **Version Control** | Each app has its own version history |

### 4.3 Standardized Structure (All Apps)

Each application follows the same Docker structure:

```
app-folder/
├── docker-compose.base.yml      # Shared service definitions
├── docker-compose.local.yml     # Local dev (hot reload, local DB)
├── docker-compose.prod.yml      # Production (Nginx, host DB)
├── docker-dev.ps1               # PowerShell helper script
├── .env.local.example           # Local env template
└── .env.prod.example            # Prod env template
```

### 4.4 Layered Docker Compose

```
                    docker-compose.base.yml
                    (Shared definitions)
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    docker-compose.local.yml    docker-compose.prod.yml
    (Local development)         (Production)
    
    - MariaDB container         - Host database
    - Hot reload                - Static Nginx
    - Debug ports               - No debug ports
    - Volume mounts             - Built artifacts
```

---

## 5. Dev-Prod Parity

### 5.1 The Twelve-Factor App Principle

Dev-prod parity means keeping development, staging, and production environments as similar as possible.

### 5.2 Parity Matrix

| Aspect | Local Development | Production |
|--------|-------------------|------------|
| **Frontend** | Vite dev server (hot reload) | Nginx (static files) |
| **Backend** | WildFly (same version) | WildFly (same version) |
| **Database** | MariaDB container | MariaDB host |
| **Redis** | Redis container | Redis host |
| **Network** | Docker bridge | Docker bridge |
| **SSL** | None (HTTP) | Cloudflare Origin Cert (HTTPS) |
| **Debug Ports** | Exposed (8787) | Not exposed |

### 5.3 Environment Variables

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VARIABLES                         │
├──────────────────────────┬──────────────────────────────────────┤
│         LOCAL            │           PRODUCTION                 │
├──────────────────────────┼──────────────────────────────────────┤
│ DB_HOST=mariadb          │ DB_HOST=host.docker.internal         │
│ DB_PORT=3306             │ DB_PORT=3306                         │
│ DB_NAME=temco_system     │ DB_NAME=temco_system                 │
│ VITE_USE_MOCK_AUTH=true  │ VITE_USE_MOCK_AUTH=false             │
│ VITE_API_URL=localhost   │ VITE_API_URL=/api                    │
└──────────────────────────┴──────────────────────────────────────┘
```

### 5.4 What Changes Between Environments

| Component | Local | Production |
|-----------|-------|------------|
| **Database** | Container (`mariadb:10.6`) | Host MariaDB |
| **Frontend** | Dev server with HMR | Nginx serving static |
| **Ports** | All exposed | Localhost only |
| **SSL** | None | Cloudflare Origin Cert |
| **Debug** | Remote debug enabled | Disabled |
| **Logging** | Console | File + Log rotation |

### 5.5 Benefits of Dev-Prod Parity

1. **"Works on my machine"** issues eliminated
2. **Early bug detection** - catch production issues locally
3. **Consistent behavior** - same containers, same configs
4. **Faster onboarding** - new developers start quickly

---

## 6. Docker Configuration

### 6.1 Base Configuration (docker-compose.base.yml)

```yaml
version: "3.8"

services:
  wildfly:
    image: jboss/wildfly:27.0.0.Final
    restart: unless-stopped
    environment:
      - DB_NAME=temco_system
      - DB_USER=temco_db
    networks:
      - app-network

  frontend:
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 6.2 Local Override (docker-compose.local.yml)

```yaml
version: "3.8"

services:
  mariadb:
    image: mariadb:10.6
    container_name: app-mariadb
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: temco_system
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect"]
      interval: 10s
      timeout: 5s
      retries: 5

  wildfly:
    build:
      context: .
      dockerfile: Dockerfile.wildfly
    environment:
      - DB_HOST=mariadb
    ports:
      - "8080:8080"
      - "8787:8787"    # Debug port
    volumes:
      - ./Backend/target:/opt/jboss/wildfly/standalone/deployments

  frontend:
    image: node:18-alpine
    working_dir: /app
    environment:
      - VITE_USE_MOCK_AUTH=true
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"

volumes:
  db_data:
```

### 6.3 Production Override (docker-compose.prod.yml)

```yaml
version: "3.8"

services:
  wildfly:
    environment:
      - DB_HOST=host.docker.internal
      - DB_PASSWORD=${DB_PASSWORD}
    ports:
      - "127.0.0.1:8080:8080"    # Localhost only
    volumes:
      - ./deployments:/opt/jboss/wildfly/standalone/deployments

  frontend:
    image: nginx:alpine
    ports:
      - "127.0.0.1:8089:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

### 6.4 Helper Script (docker-dev.ps1)

```powershell
param([string]$Command = "up")

$BASE = "docker-compose.base.yml"
$LOCAL = "docker-compose.local.yml"
$ENV_FILE = ".env.local"

switch ($Command) {
    "up"    { docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE up -d }
    "down"  { docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE down }
    "logs"  { docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE logs -f }
    "build" { docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE up -d --build }
}
```

---

## 7. Network Architecture

### 7.1 Production Network Topology

```
                        INTERNET
                            │
                            ▼
                    ┌───────────────┐
                    │   Firewall    │
                    │  (UFW/iptables)│
                    └───────┬───────┘
                            │
                    ┌───────┴───────┐
                    │     Nginx     │
                    │   (Port 443)  │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   127.0.0.1:8089     127.0.0.1:8091     127.0.0.1:8092
   (AdminApp)         (FinanceApp)       (Customer Portal)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────┴───────┐
                    │   MariaDB     │
                    │  (Port 3306)  │
                    │ (Not exposed) │
                    └───────────────┘
```

### 7.2 Port Mapping

| Service | Local Port | Production Port | Exposed To |
|---------|------------|-----------------|------------|
| AdminApp Frontend | 3000 | 8089 | localhost |
| AdminApp Backend | 8080 | 8088 | localhost |
| FinanceApp Frontend | 3001 | 8091 | localhost |
| FinanceApp Backend (SSO) | 8080 | 8087 | localhost |
| Customer Portal | 3002 | 8092 | localhost |
| MariaDB | 3306 | 3306 | localhost |
| Redis | 6379 | 6379 | localhost |
| phpMyAdmin | 8081 | - | localhost |

### 7.3 Nginx Reverse Proxy Configuration

```nginx
# /etc/nginx/sites-available/temcobank.conf

# AdminApp
server {
    listen 443 ssl;
    server_name admin.temcobank.com;
    
    ssl_certificate /etc/ssl/cloudflare/temcobank.com.pem;
    ssl_certificate_key /etc/ssl/cloudflare/temcobank.com.key;
    
    location / {
        proxy_pass http://127.0.0.1:8089;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8088/temco-admin/api/;
    }
    
    # SSO proxy to FinanceApp
    location /api/auth/ {
        proxy_pass http://127.0.0.1:8087/temco-api/api/auth/;
    }
}

# FinanceApp
server {
    listen 443 ssl;
    server_name finance.temcobank.com;
    
    location / {
        proxy_pass http://127.0.0.1:8091;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8087/temco-api/api/;
    }
}

# Customer Portal
server {
    listen 443 ssl;
    server_name portal.temcobank.com;
    
    location / {
        proxy_pass http://127.0.0.1:8092;
    }
    
    # SSO proxy to FinanceApp
    location /api/auth/ {
        proxy_pass http://127.0.0.1:8087/temco-api/api/auth/;
    }
}
```

---

## 8. SSO Architecture

### 8.1 SSO Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SSO AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

    User                AdminApp              FinanceApp (SSO)
      │                    │                       │
      │  1. Login Request  │                       │
      │───────────────────>│                       │
      │                    │  2. Forward to SSO    │
      │                    │──────────────────────>│
      │                    │                       │
      │                    │                       │ 3. Validate
      │                    │                       │    Credentials
      │                    │                       │
      │                    │  4. JWT Token         │
      │                    │<──────────────────────│
      │  5. Set Cookie     │                       │
      │<───────────────────│                       │
      │                    │                       │
      │  6. Subsequent     │                       │
      │     Requests       │                       │
      │───────────────────>│                       │
      │  (with JWT)        │                       │
```

### 8.2 SSO Endpoints (FinanceApp)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user, return JWT |
| `/api/auth/logout` | POST | Invalidate session |
| `/api/auth/refresh` | POST | Refresh JWT token |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/validate` | GET | Validate JWT token |

### 8.3 SSO Configuration per App

| App | Role | SSO API URL (Local) | SSO API URL (Prod) |
|-----|------|---------------------|-------------------|
| FinanceApp | **Provider** | Same as API | `/api` |
| AdminApp | Consumer | `http://localhost:8087/temco-api/api/v1` | `/api/auth/*` → 8087 |
| Customer Portal | Consumer | `http://localhost:8087/temco-api/api/v1` | `/api/auth/*` → 8087 |

### 8.4 JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user123",
    "name": "Ishantha Siribaddana",
    "role": "ADMIN",
    "permissions": ["read", "write", "delete"],
    "iat": 1707494400,
    "exp": 1707498000
  }
}
```

---

## 9. Database Architecture

### 9.1 Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE: temco_system                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Users    │  │   Accounts  │  │Transactions │             │
│  │             │  │             │  │             │             │
│  │ user_id     │  │ account_id  │  │ txn_id      │             │
│  │ username    │  │ user_id (FK)│  │ account_id  │             │
│  │ password    │  │ balance     │  │ amount      │             │
│  │ role        │  │ type        │  │ timestamp   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Loans     │  │  Partners   │  │   Audit     │             │
│  │             │  │             │  │    Log      │             │
│  │ loan_id     │  │ partner_id  │  │ log_id      │             │
│  │ user_id     │  │ name        │  │ action      │             │
│  │ amount      │  │ type        │  │ user_id     │             │
│  │ status      │  │ status      │  │ timestamp   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Database Connection

| Environment | Host | Port | Database | User |
|-------------|------|------|----------|------|
| Local | `mariadb` (container) | 3306 | temco_system | temco_db |
| Production | `host.docker.internal` | 3306 | temco_system | temco_db |

### 9.3 Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mysqldump -u temco_db -p temco_system > /backups/temco_system_$DATE.sql
gzip /backups/temco_system_$DATE.sql

# Keep last 7 days
find /backups -name "*.sql.gz" -mtime +7 -delete
```

---

## 10. Deployment Pipeline

### 10.1 CI/CD Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS CI/CD                        │
└─────────────────────────────────────────────────────────────────┘

  Developer          GitHub              Server
      │                 │                   │
      │  git push       │                   │
      │────────────────>│                   │
      │                 │                   │
      │                 │  Trigger CI       │
      │                 │──────┐            │
      │                 │      │ Build      │
      │                 │      │ Test       │
      │                 │<─────┘            │
      │                 │                   │
      │                 │  SSH Deploy       │
      │                 │──────────────────>│
      │                 │                   │
      │                 │                   │ docker-compose
      │                 │                   │ up -d --build
      │                 │                   │
      │                 │  Success          │
      │<────────────────│<──────────────────│
```

### 10.2 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Frontend
        run: |
          cd frontend
          npm ci
          npm run build
      
      - name: Build Backend
        run: |
          cd Backend
          mvn clean package -DskipTests
      
      - name: Deploy to Server
        env:
          SSH_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H ${{ secrets.SERVER_IP }} >> ~/.ssh/known_hosts
          
          scp -r frontend/dist user@${{ secrets.SERVER_IP }}:/apps/app-name/frontend/
          scp Backend/target/*.war user@${{ secrets.SERVER_IP }}:/apps/app-name/deployments/
          
          ssh user@${{ secrets.SERVER_IP }} "cd /apps/app-name && \
            docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d"
```

### 10.3 Deployment Commands

```bash
# Production deployment
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml restart

# Zero-downtime deploy
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d --no-deps --build frontend
```

---

## 11. Environment Configuration

### 11.1 Local Environment (.env.local)

```bash
# Database
DB_PASSWORD=local_password

# Auth
VITE_USE_MOCK_AUTH=true

# API URLs
VITE_API_URL=http://localhost:8080/temco-api/api/v1
VITE_SSO_API_URL=http://localhost:8087/temco-api/api/v1
```

### 11.2 Production Environment (.env.prod)

```bash
# Database (production)
DB_PASSWORD=${SECURE_DB_PASSWORD}
DB_HOST=host.docker.internal

# Auth
VITE_USE_MOCK_AUTH=false

# API URLs (proxied through Nginx)
VITE_API_URL=/api
VITE_SSO_API_URL=/api
```

### 11.3 Files to Gitignore

```gitignore
# Environment files with secrets
.env.local
.env.prod
.env

# Build outputs
frontend/dist/
Backend/target/
node_modules/

# IDE
.idea/
.vscode/
```

---

## 12. Quick Start Guide

### 12.1 Prerequisites

- Docker Desktop 4.x
- Node.js 18+
- Java 17+
- Maven 3.8+
- PowerShell 7+ (Windows) or Bash (Linux/macOS)

### 12.2 Clone Repositories

```bash
# Create project directory
mkdir -p f:\TemcoERP
cd f:\TemcoERP

# Clone all apps
git clone https://github.com/your-org/temco-admin-app.git AdminApp
git clone https://github.com/your-org/temco-finance-app.git FinanceApp
git clone https://github.com/your-org/customer-portal.git customer-portal
```

### 12.3 Start Local Environment

```powershell
# Terminal 1 - FinanceApp (start first - has SSO + database)
cd f:\TemcoERP\FinanceApp
Copy-Item .env.local.example .env.local
.\docker-dev.ps1 up

# Terminal 2 - AdminApp
cd f:\TemcoERP\AdminApp
Copy-Item .env.local.example .env.local
.\docker-dev.ps1 up

# Terminal 3 - Customer Portal
cd f:\TemcoERP\customer-portal
.\docker-dev.ps1 up
```

### 12.4 Access Applications

| Application | URL |
|-------------|-----|
| AdminApp | http://localhost:3000 |
| FinanceApp | http://localhost:3001 |
| Customer Portal | http://localhost:3002 |
| phpMyAdmin | http://localhost:8081 |

### 12.5 Stop All

```powershell
# In each terminal
.\docker-dev.ps1 down
```

---

## Appendix A: Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | `docker-compose down` or change port in compose file |
| Database connection refused | Wait for MariaDB healthcheck to pass |
| SSO not working | Ensure FinanceApp is running first |
| Hot reload not working | Check volume mounts in docker-compose |

### Useful Commands

```bash
# View running containers
docker ps

# View container logs
docker logs -f container-name

# Enter container shell
docker exec -it container-name sh

# Rebuild without cache
docker-compose build --no-cache

# Remove all stopped containers
docker container prune
```

---

## Appendix B: Security Checklist

- [ ] All production ports bound to 127.0.0.1
- [ ] SSL certificates configured
- [ ] Environment files not committed to Git
- [ ] Database passwords are strong and rotated
- [ ] Debug ports disabled in production
- [ ] Firewall configured (UFW)
- [ ] Regular backups scheduled
- [ ] Log rotation configured

---

**Document End**
