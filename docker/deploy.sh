#!/bin/bash
# =============================================================================
# FINANCE APP - Production Deployment Script
# =============================================================================
# Server: 109.123.227.166
# Run as: sudo ./deploy.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  TEMCO Finance App - Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
APP_DIR="/opt/temco/finance-app"
NGINX_CONF="/etc/nginx/sites-available/finance.temcobank.com"
GIT_REPO="https://github.com/ishanthasiribaddana/temco-finance-app.git"
BRANCH="master"

# Step 1: Create app directory
echo -e "\n${YELLOW}[1/7] Creating application directory...${NC}"
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Step 2: Clone or pull latest code
echo -e "\n${YELLOW}[2/7] Fetching latest code from git...${NC}"
if [ -d ".git" ]; then
    echo "Repository exists, pulling latest changes..."
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "Cloning repository..."
    git clone $GIT_REPO .
    git checkout $BRANCH
fi

# Step 3: Stop existing containers
echo -e "\n${YELLOW}[3/7] Stopping existing containers...${NC}"
cd $APP_DIR/docker
docker-compose -f docker-compose.finance.yml down 2>/dev/null || true

# Step 4: Build and start containers
echo -e "\n${YELLOW}[4/7] Building and starting containers...${NC}"
docker-compose -f docker-compose.finance.yml up -d --build

# Step 5: Configure Host NGINX
echo -e "\n${YELLOW}[5/7] Configuring Host NGINX...${NC}"
if [ ! -f "$NGINX_CONF" ]; then
    sudo cp $APP_DIR/docker/finance-host-nginx.conf $NGINX_CONF
    sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    echo "NGINX configuration installed"
else
    echo "NGINX configuration already exists"
fi

# Step 6: Test and reload NGINX
echo -e "\n${YELLOW}[6/7] Testing and reloading NGINX...${NC}"
sudo nginx -t
sudo systemctl reload nginx

# Step 7: Verify deployment
echo -e "\n${YELLOW}[7/7] Verifying deployment...${NC}"
sleep 5

# Check container status
echo -e "\nContainer Status:"
docker ps --filter "name=finance" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check health endpoints
echo -e "\nHealth Checks:"
curl -s http://127.0.0.1:8086/api/health && echo " - API: OK" || echo " - API: FAILED"
curl -s http://127.0.0.1:8091/health && echo " - Frontend: OK" || echo " - Frontend: FAILED"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Finance App URL: https://finance.temcobank.com"
echo -e "API Health: http://127.0.0.1:8086/api/health"
echo -e "Frontend Health: http://127.0.0.1:8091/health"
echo ""
