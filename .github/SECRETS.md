# GitHub Secrets Configuration

## Required Secrets for CI/CD Pipeline

Configure these secrets in your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name       | Description                          | Example Value           |
|-------------------|--------------------------------------|-------------------------|
| `SERVER_HOST`     | Production server IP address         | `109.123.227.166`       |
| `SERVER_USER`     | SSH username for deployment          | `root`                  |
| `SSH_PRIVATE_KEY` | Private SSH key for server access    | `-----BEGIN OPENSSH...` |
| `DB_PASSWORD`     | Database password for MariaDB        | `temco123`              |

## Setup Instructions

### 1. Generate SSH Key (if not exists)

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-finance-app" -f ~/.ssh/github_deploy_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy_key.pub root@109.123.227.166
```

### 2. Add Private Key to GitHub

```bash
# Copy the private key content
cat ~/.ssh/github_deploy_key
```

Then paste the entire content (including `-----BEGIN...` and `-----END...`) into the `SSH_PRIVATE_KEY` secret.

### 3. Create GitHub Environment

1. Go to repository **Settings → Environments**
2. Click **New environment**
3. Name it `production`
4. Optionally add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches (only `master`)

### 4. Test the Pipeline

Push a commit to master or manually trigger:
1. Go to **Actions** tab
2. Select **Deploy Finance App**
3. Click **Run workflow**

## Server Prerequisites

Ensure the production server has:

```bash
# Docker installed
docker --version

# Docker Compose installed
docker-compose --version

# Git installed
git --version

# App directory created
sudo mkdir -p /opt/temco/finance-app
cd /opt/temco
git clone https://github.com/ishanthasiribaddana/temco-finance-app.git finance-app
```

## Troubleshooting

### SSH Connection Failed
```bash
# Test SSH connection locally
ssh -i ~/.ssh/github_deploy_key root@109.123.227.166
```

### Permission Denied
```bash
# On server, ensure SSH key is authorized
cat ~/.ssh/authorized_keys
```

### Docker Build Failed
```bash
# On server, check Docker logs
docker logs finance-api
docker logs finance-frontend
```
