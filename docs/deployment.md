# 部署文档

## 📋 概述

本文档描述了跨平台文件传输应用的部署方案，包括开发环境、测试环境和生产环境的部署配置。

## 🏗️ 架构概览

### 部署架构图
```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │    (Nginx)      │
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Node.js)     │
                    └─────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  File Service  │  │ Transfer Service │  │  Auth Service  │
│   (Node.js)    │  │   (Node.js)     │  │   (Node.js)    │
└────────────────┘  └─────────────────┘  └────────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│    MongoDB     │  │     Redis       │  │ Object Storage │
│   (Database)   │  │    (Cache)      │  │   (S3/OSS)     │
└────────────────┘  └─────────────────┘  └────────────────┘
```

## 🔧 环境要求

### 系统要求
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 8+
- **CPU**: 最少2核，推荐4核以上
- **内存**: 最少4GB，推荐8GB以上
- **存储**: 最少50GB，推荐SSD存储
- **网络**: 公网IP，带宽10Mbps以上

### 软件依赖
- **Node.js**: 16.x 或更高版本
- **MongoDB**: 5.0 或更高版本
- **Redis**: 6.0 或更高版本
- **Nginx**: 1.18 或更高版本
- **Docker**: 20.10 或更高版本 (可选)
- **Docker Compose**: 1.29 或更高版本 (可选)

## 🐳 Docker部署

### Docker Compose配置
创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  # API服务
  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/filetransfer
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  # MongoDB数据库
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=filetransfer
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:6.2-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - api
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:

networks:
  default:
    driver: bridge
```

### 环境变量配置
创建 `.env` 文件：

```bash
# 应用配置
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-32-characters-long
ENCRYPTION_KEY=your-32-character-encryption-key

# 数据库配置
MONGO_USERNAME=admin
MONGO_PASSWORD=your-mongo-password
REDIS_PASSWORD=your-redis-password

# AWS S3配置
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# 域名配置
DOMAIN=yourdomain.com
SSL_EMAIL=your-email@example.com
```

### 部署命令
```bash
# 克隆项目
git clone https://github.com/your-repo/file-transfer.git
cd file-transfer

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 构建和启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api
```

## 🌐 Nginx配置

### 基础配置
创建 `nginx/nginx.conf` 文件：

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api_backend {
        server api:3000;
    }

    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS配置
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL证书配置
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # 安全头
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # 文件上传大小限制
        client_max_body_size 100M;

        # API代理
        location /api/ {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Socket.io代理
        location /socket.io/ {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 静态文件服务
        location /files/ {
            alias /var/www/uploads/;
            expires 7d;
            add_header Cache-Control "public, immutable";
        }

        # 健康检查
        location /health {
            proxy_pass http://api_backend/health;
            access_log off;
        }
    }
}
```

## 🔒 SSL证书配置

### Let's Encrypt自动证书
```bash
# 安装Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

### 手动证书配置
```bash
# 创建SSL目录
mkdir -p nginx/ssl

# 复制证书文件
cp /path/to/fullchain.pem nginx/ssl/
cp /path/to/privkey.pem nginx/ssl/

# 设置权限
chmod 600 nginx/ssl/privkey.pem
chmod 644 nginx/ssl/fullchain.pem
```

## 📊 监控配置

### 应用监控
使用PM2进行进程管理：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'file-transfer-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

### 系统监控
使用Prometheus + Grafana：

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'file-transfer-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'mongodb-exporter'
    static_configs:
      - targets: ['localhost:9216']
```

## 🔄 CI/CD配置

### GitHub Actions
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd server && npm ci
        cd ../desktop && npm ci
        cd ../mobile && npm ci
    
    - name: Run tests
      run: |
        cd server && npm test
        cd ../desktop && npm test
    
    - name: Build applications
      run: |
        cd server && npm run build
        cd ../desktop && npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/file-transfer
          git pull origin main
          docker-compose down
          docker-compose build
          docker-compose up -d
```

## 🛡️ 安全配置

### 防火墙设置
```bash
# 安装ufw
sudo apt install ufw

# 默认策略
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许SSH
sudo ufw allow ssh

# 允许HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 启用防火墙
sudo ufw enable
```

### 系统安全加固
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 禁用root登录
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 配置fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 设置自动安全更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📈 性能优化

### 数据库优化
```javascript
// MongoDB索引优化
db.files.createIndex({ "uploadedBy": 1, "uploadedAt": -1 });
db.files.createIndex({ "hash": 1 }, { unique: true });
db.transfers.createIndex({ "fromDevice": 1, "toDevice": 1 });
db.users.createIndex({ "devices": 1 });

// Redis配置优化
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 应用优化
```javascript
// Node.js性能配置
process.env.UV_THREADPOOL_SIZE = 128;
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Express优化
app.use(compression());
app.use(helmet());
app.set('trust proxy', 1);
```

## 🔧 故障排除

### 常见问题

#### 1. 服务无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 检查日志
docker-compose logs api

# 检查环境变量
docker-compose config
```

#### 2. 数据库连接失败
```bash
# 检查MongoDB状态
docker-compose exec mongo mongo --eval "db.adminCommand('ismaster')"

# 检查网络连接
docker-compose exec api ping mongo
```

#### 3. 文件上传失败
```bash
# 检查磁盘空间
df -h

# 检查文件权限
ls -la uploads/

# 检查Nginx配置
nginx -t
```

### 日志分析
```bash
# 查看应用日志
tail -f logs/combined.log

# 查看Nginx访问日志
tail -f nginx/logs/access.log

# 查看系统日志
journalctl -u docker -f
```

## 📝 维护指南

### 定期维护任务

#### 每日任务
- 检查服务状态
- 监控磁盘使用率
- 查看错误日志

#### 每周任务
- 清理过期文件
- 备份数据库
- 更新安全补丁

#### 每月任务
- 性能分析
- 容量规划
- 安全审计

### 备份策略
```bash
#!/bin/bash
# backup.sh

# 数据库备份
docker-compose exec mongo mongodump --out /backup/$(date +%Y%m%d)

# 文件备份
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz uploads/

# 上传到云存储
aws s3 cp /backup/ s3://your-backup-bucket/ --recursive
```

这个部署文档提供了完整的生产环境部署指南，包括Docker容器化部署、Nginx配置、SSL证书、监控、CI/CD和安全配置等各个方面。
