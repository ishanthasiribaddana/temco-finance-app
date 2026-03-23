# TEMCO Finance App - Production Deployment Guide

## Architecture Overview

```
                    INTERNET
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   Admin Staff    Bank Members    Finance Staff
        │              │              │
adminpanel.temcobank.com  my.temcobank.com  finance.temcobank.com
        │              │              │
        └──────────────┼──────────────┘
                       │
            ┌──────────┴──────────┐
            │   HOST NGINX (SSL)  │
            │   109.123.227.166   │
            └──────────┬──────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
localhost:8089    localhost:8091    localhost:8088
    │                  │                  │
┌───┴───┐         ┌────┴────┐        ┌───┴───┐
│ ADMIN │         │ FINANCE │        │LENDING│
│PANEL  │         │   APP   │        │  APP  │
└───┬───┘         └────┬────┘        └───┬───┘
    │                  │                  │
    │            ┌─────┴─────┐            │
    │            │           │            │
    │      finance-     finance-          │
    │      frontend     api               │
    │      (nginx)     (node.js)          │
    │      Port:80     Port:8086          │
    │            │           │            │
    └────────────┼───────────┼────────────┘
                 │           │
            ┌────┴───────────┴────┐
            │    HOST MariaDB     │
            │    Port: 3306       │
            │    temco_system     │
            └─────────────────────┘
```

## Server Requirements

- **Server**: 109.123.227.166
- **OS**: Ubuntu 22.04 LTS
- **Docker**: 24.0+
- **Docker Compose**: 2.0+
- **NGINX**: 1.18+
- **MariaDB**: 10.6+ (on host)

## Deployment Steps

### 1. SSH to Production Server

```bash
ssh root@109.123.227.166
```

### 2. Run Deployment Script

```bash
cd /opt/temco/finance-app
sudo ./docker/deploy.sh
```

### 3. Manual Deployment (Alternative)

```bash
# Clone repository
cd /opt/temco
git clone https://github.com/ishanthasiribaddana/temco-finance-app.git finance-app
cd finance-app

# Build and start containers
cd docker
docker-compose -f docker-compose.finance.yml up -d --build

# Configure NGINX
sudo cp finance-host-nginx.conf /etc/nginx/sites-available/finance.temcobank.com
sudo ln -s /etc/nginx/sites-available/finance.temcobank.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## DNS Configuration

Add DNS A record:
```
finance.temcobank.com  →  109.123.227.166
```

## SSL Certificate

All subdomains use a shared **Cloudflare Origin Certificate** (`*.temcobank.com`, valid until 2041).
The cert is already installed at `/etc/ssl/cloudflare/temcobank.com.pem` and `.key`.
No Certbot step needed for new subdomains.

## Container Management

```bash
# View logs
docker logs -f finance-api
docker logs -f finance-frontend

# Restart containers
docker-compose -f docker-compose.finance.yml restart

# Stop containers
docker-compose -f docker-compose.finance.yml down

# Rebuild and restart
docker-compose -f docker-compose.finance.yml up -d --build --force-recreate
```

## Health Checks

```bash
# API Health
curl http://127.0.0.1:8086/api/health

# Frontend Health
curl http://127.0.0.1:8091/health

# Full application
curl https://finance.temcobank.com/api/health
```

## Ports Used

| Service          | Container Port | Host Port  | Description              |
|------------------|----------------|------------|--------------------------|
| finance-frontend | 80             | 8091       | React SPA (nginx)        |
| finance-api      | 8086           | 8086       | Node.js API Server       |

## Environment Variables

Set in `.env` file or docker-compose:

```bash
DB_HOST=host.docker.internal
DB_PORT=3306
DB_NAME=temco_system
DB_USER=root
DB_PASSWORD=temco123
```

## Troubleshooting

### Container not starting
```bash
docker logs finance-api
docker logs finance-frontend
```

### Database connection issues
```bash
# Check MariaDB is running on host
sudo systemctl status mariadb

# Test connection from container
docker exec -it finance-api sh
wget -qO- http://host.docker.internal:3306
```

### NGINX issues
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/finance.temcobank.com.error.log
```
