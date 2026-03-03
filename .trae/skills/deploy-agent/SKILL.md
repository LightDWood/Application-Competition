---
name: "deploy-agent"
description: "Professional deployment agent for server deployment via GitHub. Invoke when user needs to deploy code to server, push to production/staging, or setup server from GitHub repo. Supports SSH, SCP, and CI/CD workflows."
---

# Deploy Agent - Professional Server Deployment Intelligence

A comprehensive deployment agent that ensures safe, reliable, and automated code deployment from local development environment to production/staging servers.

## Core Capabilities

### Capability Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│              DEPLOY AGENT - FULL CAPABILITY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   LOCAL ──────────────────────────────────────▶ SERVER          │
│     │                                                    │       │
│     │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │       │
│     │  │ Git Push │  │ SCP/RSYNC│  │ SSH Exec │       │       │
│     │  │ (代码推送)│  │(文件传输)│  │(远程执行)│       │       │
│     │  └──────────┘  └──────────┘  └──────────┘       │       │
│     │                                                    │       │
│   DEPLOYMENT WORKFLOW                                            │
│     │                                                    │       │
│     │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │       │
│     │  │ Pre-check│  │  Build   │  │  Deploy  │       │       │
│     │  │ (预检查) │  │  (构建)  │  │  (部署)  │       │       │
│     │  └──────────┘  └──────────┘  └──────────┘       │       │
│     │                                                    │       │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Pre-Deployment Validation
- **Environment Check**: Verify local build environment, dependencies, and configurations
- **Git Status Validation**: Ensure all changes are committed and pushed
- **Server Connectivity**: Test SSH connection and server accessibility
- **Dependency Verification**: Check if server has required runtime environment

### 2. Deployment Methods

#### Method A: Git-Based Deployment
```
Local → Git Push → Server Git Pull → Build → Restart Services
```

#### Method B: Direct File Transfer (SCP/RSYNC)
```
Local Build → SCP/RSYNC → Server → Restart Services
```

#### Method C: CI/CD Pipeline
```
Local Push → CI/CD Trigger → Automated Build → Automated Deploy
```

### 3. Safe Deployment Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT WORKFLOW PIPELINE                    │
├─────────────────────────────────────────────────────────────────┤
│  1. PRE-DEPLOYMENT                                               │
│     ├── Verify all changes are committed                         │
│     ├── Run local tests and lint checks                          │
│     ├── Build production artifacts                               │
│     └── Create deployment backup point                           │
│                                                                  │
│  2. DEPLOYMENT EXECUTION                                         │
│     ├── Transfer code to server                                  │
│     ├── Install/update dependencies                              │
│     ├── Run database migrations (if any)                         │
│     ├── Build application on server                              │
│     └── Restart services                                         │
│                                                                  │
│  3. POST-DEPLOYMENT                                              │
│     ├── Health check verification                                │
│     ├── Service status confirmation                              │
│     └── Deployment log recording                                 │
│                                                                  │
│  4. ROLLBACK (if needed)                                         │
│     ├── Automatic rollback on failure                            │
│     ├── Restore previous version                                 │
│     └── Notify deployment status                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Invocation Triggers

Invoke this agent when:
- User wants to "deploy code to server"
- User says "push to production" or "deploy to staging"
- User needs to "upload code to server"
- User asks about "how to deploy" or "deployment steps"
- User wants to execute remote commands on server
- User needs to transfer files to server
- Deployment rollback is needed

## Configuration Requirements

Before first deployment, gather the following information:

```yaml
github:
  repo_url: "https://github.com/username/repo.git"  # or git@github.com:username/repo.git
  branch: "main"
  auth_method: "ssh"  # "ssh" or "https"
  
server:
  host: "your-server-ip-or-domain"
  port: 22
  user: "deploy-user"
  ssh_key_path: "~/.ssh/id_rsa"  # or password auth
  
paths:
  remote_path: "/var/www/your-app"
  backup_path: "/var/backups/your-app"
  
build:
  local_build_cmd: "npm run build"
  remote_build_cmd: "npm run build"
  
services:
  - name: "nginx"
    restart_cmd: "sudo systemctl restart nginx"
  - name: "pm2"
    restart_cmd: "pm2 restart all"
```

## Project-Specific Configuration (AI Contest Website)

### Server Information

```yaml
server:
  host: "123.57.165.99"
  port: 22
  user: "root"
  auth_method: "password"
  
github:
  repo_url: "git@github.com:username/ai-contest-web.git"  # 待确认
  branch: "main"
  
paths:
  remote_path: "/var/www/ai-contest"
  backup_path: "/var/backups/ai-contest"
  
ports:
  frontend: 80  # 通过 Nginx
  backend: 3001  # 避免与抽奖系统 3000 冲突
  
database:
  type: "mysql"
  host: "localhost"
  port: 3306
  root_password: "B3st_R00t_4_MySQL!"
  new_db_name: "ai_contest"  # 新建数据库
  
redis:
  host: "localhost"
  port: 6379
  key_prefix: "ai_contest:"  # 避免与抽奖系统冲突
```

### Coexistence Strategy (与现有抽奖系统共存)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER RESOURCE ALLOCATION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PORT ALLOCATION:                                                │
│  ├── 80    → Nginx (所有项目共用)                                │
│  ├── 3000  → 抽奖系统后端 (已占用)                               │
│  ├── 3001  → AI大赛网站后端 (新项目)                             │
│  ├── 3306  → MySQL (所有项目共用)                                │
│  └── 6379  → Redis (所有项目共用)                                │
│                                                                  │
│  DATABASE ALLOCATION:                                            │
│  ├── lottery_system  → 抽奖系统 (已存在)                         │
│  └── ai_contest      → AI大赛网站 (新建)                         │
│                                                                  │
│  REDIS KEY PREFIX:                                               │
│  ├── lottery:*       → 抽奖系统                                  │
│  └── ai_contest:*    → AI大赛网站                                │
│                                                                  │
│  FILE STRUCTURE:                                                 │
│  /var/www/                                                       │
│  ├── lottery/        → 抽奖系统                                  │
│  └── ai-contest/     → AI大赛网站                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Nginx Configuration for AI Contest

```nginx
# /etc/nginx/conf.d/ai-contest.conf

upstream ai_contest_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name _;  # 或指定域名
    
    client_max_body_size 20M;
    
    # AI大赛网站前端
    location /ai-contest {
        alias /var/www/ai-contest/frontend;
        try_files $uri $uri/ /ai-contest/index.html;
    }
    
    # AI大赛网站 API
    location /ai-contest/api {
        rewrite ^/ai-contest/api/(.*) /api/$1 break;
        proxy_pass http://ai_contest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 抽奖系统 (保持现有配置)
    location / {
        root /var/www/lottery/frontend;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://lottery_backend;
    }
    
    location /prizes {
        proxy_pass http://lottery_backend;
        expires 30d;
    }
}
```

### PM2 Configuration for AI Contest

```bash
# 启动 AI 大赛网站
pm2 start /var/www/ai-contest/backend/app.js --name "ai-contest"

# 查看所有进程
pm2 list

# 预期输出:
# ┌─────┬────────────────┬─────────┬─────────┐
# │ id  │ name           │ status  │ port    │
# ├─────┼────────────────┼─────────┼─────────┤
# │ 0   │ lottery        │ online  │ 3000    │
# │ 1   │ ai-contest     │ online  │ 3001    │
# └─────┴────────────────┴─────────┴─────────┘

# 保存进程列表
pm2 save
```

### Database Setup for AI Contest

```sql
-- 登录 MySQL
mysql -u root -p'B3st_R00t_4_MySQL!'

-- 创建 AI 大赛网站数据库
CREATE DATABASE ai_contest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户
CREATE USER 'ai_contest'@'localhost' IDENTIFIED BY 'Ai_Contest_2026!';
GRANT ALL PRIVILEGES ON ai_contest.* TO 'ai_contest'@'localhost';
FLUSH PRIVILEGES;

-- 验证
SHOW DATABASES;
SELECT user, host FROM mysql.user;
```

### Environment Variables Template

```env
# /var/www/ai-contest/backend/.env

# 服务配置
PORT=3001
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=ai_contest
DB_PASSWORD=Ai_Contest_2026!
DB_NAME=ai_contest

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PREFIX=ai_contest:

# JWT 配置 (使用不同的密钥)
JWT_SECRET=ai_contest_jwt_secret_2026
JWT_EXPIRES_IN=24h

# 管理员密钥 (使用不同的密钥)
ADMIN_KEY=ai_contest_admin_2026
```

## Server-Side Git Configuration (First-Time Setup)

### Option A: SSH Key Authentication (Recommended for GitHub)

**Step 1: Generate SSH Key on Server**

```bash
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  # Generate SSH key for GitHub
  ssh-keygen -t ed25519 -C "server-deploy" -f ~/.ssh/id_ed25519_github -N ""
  
  # Display public key (add this to GitHub)
  echo "=== ADD THIS KEY TO GITHUB ==="
  cat ~/.ssh/id_ed25519_github.pub
  echo "=============================="
  
  # Configure SSH to use this key for GitHub
  cat >> ~/.ssh/config << 'SSHCONFIG'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
SSHCONFIG
  
  chmod 600 ~/.ssh/config
EOF
```

**Step 2: Add SSH Key to GitHub**

1. Go to GitHub → Settings → SSH and GPG keys → New SSH key
2. Paste the public key displayed from Step 1
3. Title: "Production Server" or similar

**Step 3: Test GitHub Connection**

```bash
ssh $SERVER_USER@$SERVER_HOST "ssh -T git@github.com"
# Expected: "Hi username! You've successfully authenticated..."
```

### Option B: HTTPS with Personal Access Token

**Step 1: Create GitHub Personal Access Token**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Save the token securely

**Step 2: Configure Git on Server**

```bash
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  # Configure git credentials
  git config --global credential.helper store
  
  # Clone with token (will save credentials)
  # Format: https://<token>@github.com/username/repo.git
EOF
```

### First-Time Server Deployment (Clone from GitHub)

**Trigger**: Server has no code yet, need to clone from GitHub

```bash
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  # Create directory if not exists
  sudo mkdir -p $REMOTE_PATH
  sudo chown $USER:$USER $REMOTE_PATH
  
  # Clone repository from GitHub
  git clone $GITHUB_REPO_URL $REMOTE_PATH
  
  # Navigate to project
  cd $REMOTE_PATH
  
  # Checkout specific branch if needed
  git checkout $BRANCH
  
  # Install dependencies
  npm ci --production
  
  # Build application
  npm run build
  
  # Start with PM2 (if using)
  pm2 start npm --name "app" -- start
  pm2 save
  
  echo "=== DEPLOYMENT COMPLETE ==="
EOF
```

**Output Format**:
```
╔═══════════════════════════════════════════════════════════════════╗
║                    FIRST-TIME SETUP REPORT                        ║
╠═══════════════════════════════════════════════════════════════════╣
║  Status: [SUCCESS/FAILED]                                         ║
║  GitHub Repo: https://github.com/username/repo.git                ║
║  Branch: main                                                     ║
║  Server Path: /var/www/your-app                                   ║
╠───────────────────────────────────────────────────────────────────╣
║  Setup Steps:                                                     ║
║    ✓ Repository cloned from GitHub                                ║
║    ✓ Dependencies installed                                       ║
║    ✓ Application built                                            ║
║    ✓ Services started                                             ║
╠───────────────────────────────────────────────────────────────────╣
║  Next Steps:                                                      ║
║    • Configure nginx reverse proxy                                ║
║    • Setup SSL certificate                                        ║
║    • Configure environment variables                              ║
╚═══════════════════════════════════════════════════════════════════╝
```

### First-Time Deployment for AI Contest Website

**Trigger**: 首次部署 AI 大赛网站到服务器

**Complete Setup Script**:

```bash
# ============================================
# STEP 1: 服务器连接测试
# ============================================
ssh root@123.57.165.99 "echo 'Connection successful'"

# ============================================
# STEP 2: 创建项目目录结构
# ============================================
ssh root@123.57.165.99 << 'EOF'
  mkdir -p /var/www/ai-contest/frontend
  mkdir -p /var/www/ai-contest/backend
  mkdir -p /var/backups/ai-contest
EOF

# ============================================
# STEP 3: 创建数据库和用户
# ============================================
ssh root@123.57.165.99 << 'EOF'
  mysql -u root -p'B3st_R00t_4_MySQL!' << 'SQL'
    CREATE DATABASE IF NOT EXISTS ai_contest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS 'ai_contest'@'localhost' IDENTIFIED BY 'Ai_Contest_2026!';
    GRANT ALL PRIVILEGES ON ai_contest.* TO 'ai_contest'@'localhost';
    FLUSH PRIVILEGES;
    SHOW DATABASES;
SQL
EOF

# ============================================
# STEP 4: 配置服务器端 GitHub SSH Key (首次需要)
# ============================================
ssh root@123.57.165.99 << 'EOF'
  # 检查是否已有 GitHub SSH Key
  if [ ! -f ~/.ssh/id_ed25519_github ]; then
    ssh-keygen -t ed25519 -C "ai-contest-server" -f ~/.ssh/id_ed25519_github -N ""
    
    # 配置 SSH 使用此密钥连接 GitHub
    cat >> ~/.ssh/config << 'SSHCONFIG'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
SSHCONFIG
    chmod 600 ~/.ssh/config
    
    echo "=== 请将以下公钥添加到 GitHub ==="
    cat ~/.ssh/id_ed25519_github.pub
    echo "================================"
  else
    echo "GitHub SSH Key 已存在"
  fi
EOF

# ============================================
# STEP 5: 从 GitHub 克隆代码
# ============================================
ssh root@123.57.165.99 << 'EOF'
  cd /var/www/ai-contest
  
  # 克隆仓库 (使用 SSH 方式)
  git clone git@github.com:YOUR_USERNAME/ai-contest-web.git backend
  
  # 或使用 HTTPS 方式
  # git clone https://github.com/YOUR_USERNAME/ai-contest-web.git backend
EOF

# ============================================
# STEP 6: 配置环境变量
# ============================================
ssh root@123.57.165.99 << 'EOF'
  cd /var/www/ai-contest/backend
  
  # 创建 .env 文件
  cat > .env << 'ENVFILE'
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=ai_contest
DB_PASSWORD=Ai_Contest_2026!
DB_NAME=ai_contest

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PREFIX=ai_contest:

JWT_SECRET=ai_contest_jwt_secret_2026
JWT_EXPIRES_IN=24h

ADMIN_KEY=ai_contest_admin_2026
ENVFILE
  
  chmod 600 .env
EOF

# ============================================
# STEP 7: 安装依赖并构建
# ============================================
ssh root@123.57.165.99 << 'EOF'
  cd /var/www/ai-contest/backend
  npm ci --production
  
  # 如果需要构建
  npm run build
EOF

# ============================================
# STEP 8: 上传前端构建产物
# ============================================
# 本地执行: 构建并上传前端
npm run build
scp -r ./dist/* root@123.57.165.99:/var/www/ai-contest/frontend/

# ============================================
# STEP 9: 配置 Nginx
# ============================================
ssh root@123.57.165.99 << 'EOF'
  # 创建 AI 大赛网站 Nginx 配置
  cat > /etc/nginx/conf.d/ai-contest.conf << 'NGINX'
upstream ai_contest_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 20M;
    
    # AI大赛网站前端
    location /ai-contest {
        alias /var/www/ai-contest/frontend;
        try_files $uri $uri/ /ai-contest/index.html;
    }
    
    # AI大赛网站 API
    location /ai-contest/api {
        rewrite ^/ai-contest/api/(.*) /api/$1 break;
        proxy_pass http://ai_contest_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
  
  # 测试并重载 Nginx
  nginx -t && nginx -s reload
EOF

# ============================================
# STEP 10: 启动 PM2 服务
# ============================================
ssh root@123.57.165.99 << 'EOF'
  cd /var/www/ai-contest/backend
  pm2 start app.js --name "ai-contest"
  pm2 save
  pm2 list
EOF

# ============================================
# STEP 11: 验证部署
# ============================================
curl -I http://123.57.165.99/ai-contest/
curl -I http://123.57.165.99/ai-contest/api/health
```

**Deployment Report**:
```
╔═══════════════════════════════════════════════════════════════════╗
║              AI CONTEST WEBSITE - DEPLOYMENT REPORT               ║
╠═══════════════════════════════════════════════════════════════════╣
║  Status: [SUCCESS/FAILED]                                         ║
║  Server: 123.57.165.99                                            ║
║  Path: /var/www/ai-contest                                        ║
║  Port: 3001 (Backend) / 80 (Frontend via Nginx)                   ║
╠───────────────────────────────────────────────────────────────────╣
║  Resources Created:                                               ║
║    ✓ Database: ai_contest                                         ║
║    ✓ DB User: ai_contest                                          ║
║    ✓ Redis Prefix: ai_contest:                                    ║
║    ✓ PM2 Process: ai-contest                                      ║
║    ✓ Nginx Config: /etc/nginx/conf.d/ai-contest.conf              ║
╠───────────────────────────────────────────────────────────────────╣
║  URLs:                                                            ║
║    • Frontend: http://123.57.165.99/ai-contest/                   ║
║    • API: http://123.57.165.99/ai-contest/api/                    ║
╠───────────────────────────────────────────────────────────────────╣
║  Coexisting with:                                                 ║
║    • Lottery System (Port 3000)                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Standard Operating Procedures

### Operation 0: Daily Update for AI Contest Website

**Trigger**: 日常更新 AI 大赛网站代码

```bash
# ============================================
# 本地: 确保代码已推送到 GitHub
# ============================================
git status
git add .
git commit -m "feat: 更新功能"
git push origin main

# ============================================
# 服务器: 拉取最新代码并重启
# ============================================
ssh root@123.57.165.99 << 'EOF'
  cd /var/www/ai-contest/backend
  
  # 拉取最新代码
  git pull origin main
  
  # 安装依赖 (如有更新)
  npm ci --production
  
  # 重启 PM2 服务
  pm2 restart ai-contest
  
  # 查看状态
  pm2 logs ai-contest --lines 20
EOF

# ============================================
# 本地: 更新前端 (如有变更)
# ============================================
npm run build
scp -r ./dist/* root@123.57.165.99:/var/www/ai-contest/frontend/

# ============================================
# 验证部署
# ============================================
curl -I http://123.57.165.99/ai-contest/
```

### Operation 1: Full Deployment (Recommended)

**Trigger**: User wants to deploy all local changes to server

**Steps**:

```bash
# Step 1: Pre-deployment checks
git status --porcelain
npm run lint
npm run test
npm run build

# Step 2: Push to remote repository
git push origin main

# Step 3: SSH to server and pull
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  cd $REMOTE_PATH
  git pull origin main
  npm install --production
  npm run build
  pm2 restart all
EOF

# Step 4: Verify deployment
curl -I https://your-domain.com
```

**Output Format**:
```
╔═══════════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT STATUS REPORT                       ║
╠═══════════════════════════════════════════════════════════════════╣
║  Status: [SUCCESS/FAILED]                                         ║
║  Environment: Production                                          ║
║  Server: your-server.com                                          ║
║  Branch: main                                                     ║
║  Commit: abc1234                                                  ║
╠───────────────────────────────────────────────────────────────────╣
║  Deployment Steps:                                                ║
║    ✓ Pre-deployment checks passed                                 ║
║    ✓ Code pushed to remote repository                             ║
║    ✓ Server pulled latest code                                    ║
║    ✓ Dependencies installed                                       ║
║    ✓ Application built successfully                               ║
║    ✓ Services restarted                                           ║
║    ✓ Health check passed                                          ║
╠───────────────────────────────────────────────────────────────────╣
║  Duration: XX seconds                                             ║
║  URL: https://your-domain.com                                     ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Operation 2: Quick Deploy (Skip Build)

**Trigger**: User wants fast deployment, skipping local build

```bash
# Quick deploy - just push and pull
git push origin main
ssh $SERVER_USER@$SERVER_HOST "cd $REMOTE_PATH && git pull && pm2 restart all"
```

### Operation 3: File Transfer Deploy (SCP/RSYNC)

**Trigger**: No Git on server, or need to transfer built files directly

```bash
# Build locally first
npm run build

# Transfer using RSYNC (recommended)
rsync -avz --delete \
  -e "ssh -p 22" \
  ./dist/ $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/dist/

# Or using SCP
scp -r ./dist/* $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/dist/

# Restart services
ssh $SERVER_USER@$SERVER_HOST "cd $REMOTE_PATH && pm2 restart all"
```

### Operation 4: Database Migration Deploy

**Trigger**: Deployment includes database schema changes

```bash
# Pre-migration backup
ssh $SERVER_USER@$SERVER_HOST "mysqldump -u user -p db > $BACKUP_PATH/db_$(date +%Y%m%d).sql"

# Deploy with migration
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  cd $REMOTE_PATH
  git pull origin main
  npm install
  npm run migrate
  pm2 restart all
EOF
```

### Operation 5: Rollback Deployment

**Trigger**: Deployment failed or issues found after deployment

```bash
# Quick rollback to previous commit
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  cd $REMOTE_PATH
  git log --oneline -5
  git reset --hard HEAD~1
  npm install
  pm2 restart all
EOF

# Or restore from backup
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  cd $REMOTE_PATH
  rm -rf dist
  cp -r $BACKUP_PATH/latest/dist ./dist
  pm2 restart all
EOF
```

### Operation 6: Staging Deployment

**Trigger**: User wants to deploy to staging environment first

```bash
# Deploy to staging
git push origin main
ssh $SERVER_USER@$STAGING_HOST << 'EOF'
  cd $STAGING_PATH
  git pull origin main
  npm install
  npm run build
  pm2 restart staging
EOF

# Verify staging
curl -I https://staging.your-domain.com
```

## SSH Connection Methods

### Method 1: SSH Key Authentication (Recommended)

```bash
# Generate SSH key if not exists
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub $SERVER_USER@$SERVER_HOST

# Test connection
ssh $SERVER_USER@$SERVER_HOST "echo 'Connection successful'"
```

### Method 2: SSH Config File

Create `~/.ssh/config`:

```
Host myserver
    HostName your-server.com
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

Then use: `ssh myserver "commands"`

## Health Check Commands

```bash
# Check if application is running
ssh $SERVER_USER@$SERVER_HOST "pm2 status"

# Check nginx status
ssh $SERVER_USER@$SERVER_HOST "sudo systemctl status nginx"

# Check application logs
ssh $SERVER_USER@$SERVER_HOST "pm2 logs --lines 50"

# Check port availability
ssh $SERVER_USER@$SERVER_HOST "netstat -tlnp | grep :3000"

# Check disk space
ssh $SERVER_USER@$SERVER_HOST "df -h"

# Check memory usage
ssh $SERVER_USER@$SERVER_HOST "free -m"
```

## Common Deployment Patterns

### Node.js Application

```bash
# Local
npm run build
git push origin main

# Server
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  cd $REMOTE_PATH
  git pull origin main
  npm ci --production
  pm2 restart all
  pm2 save
EOF
```

### Static Website (Nginx)

```bash
# Local build
npm run build

# Transfer to server
rsync -avz ./dist/ $SERVER_USER@$SERVER_HOST:/var/www/html/

# Reload nginx
ssh $SERVER_USER@$SERVER_HOST "sudo nginx -t && sudo systemctl reload nginx"
```

### Docker-Based Deployment

```bash
# Build and push image
docker build -t your-app:latest .
docker push your-registry/your-app:latest

# Deploy on server
ssh $SERVER_USER@$SERVER_HOST << 'EOF'
  docker pull your-registry/your-app:latest
  docker-compose down
  docker-compose up -d
  docker image prune -f
EOF
```

## Error Handling

| Error | Description | Resolution |
|-------|-------------|------------|
| E101 | SSH connection failed | Check server IP, port, and credentials |
| E102 | Git push rejected | Pull remote changes first, resolve conflicts |
| E103 | npm install failed | Check package.json, clear npm cache |
| E104 | Build failed | Check build logs, verify dependencies |
| E105 | Service restart failed | Check service logs, verify configuration |
| E106 | Health check failed | Check application logs, verify port binding |
| E107 | Permission denied | Check file permissions, use sudo if needed |
| E108 | Disk space insufficient | Clean up old files, expand storage |
| E109 | GitHub SSH auth failed | Add server SSH key to GitHub Deploy Keys |
| E110 | GitHub clone failed | Verify repo URL and access permissions |
| E111 | GitHub token expired | Regenerate Personal Access Token |
| E112 | Branch not found | Check branch name, verify it exists |
| E113 | Merge conflict on server | SSH to server, resolve conflicts manually |

## Pre-Deployment Checklist

Before executing deployment, verify:

- [ ] All changes are committed and pushed to Git
- [ ] Local tests pass (`npm test`)
- [ ] Local build succeeds (`npm run build`)
- [ ] No sensitive data in code (.env excluded)
- [ ] Server has sufficient disk space
- [ ] Database backup created (if migrations pending)
- [ ] Team notified of deployment window

## Post-Deployment Verification

After deployment, verify:

- [ ] Application responds to HTTP requests
- [ ] No errors in application logs
- [ ] Database connections working
- [ ] Static assets loading correctly
- [ ] API endpoints functioning
- [ ] SSL certificate valid

## Quick Reference Commands

| Task | Command |
|------|---------|
| SSH to server | `ssh user@host` |
| Run remote command | `ssh user@host "command"` |
| Transfer file | `scp local_file user@host:/remote/path` |
| Sync directory | `rsync -avz ./local/ user@host:/remote/` |
| Check PM2 status | `ssh user@host "pm2 status"` |
| View logs | `ssh user@host "pm2 logs --lines 100"` |
| Restart service | `ssh user@host "pm2 restart all"` |
| Git pull on server | `ssh user@host "cd /path && git pull"` |
| Clone from GitHub | `ssh user@host "git clone git@github.com:user/repo.git /path"` |
| Test GitHub SSH | `ssh user@host "ssh -T git@github.com"` |
| Check git remote | `ssh user@host "cd /path && git remote -v"` |
| View git log | `ssh user@host "cd /path && git log --oneline -5"` |

---

*This agent ensures professional-grade deployment with comprehensive safety checks, rollback capabilities, and detailed reporting.*
