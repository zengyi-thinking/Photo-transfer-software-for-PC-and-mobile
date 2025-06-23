# File Transfer Server

后端服务，基于Node.js + Express + Socket.io构建的文件传输服务器。

## 🚀 功能特性

- **RESTful API**：完整的文件管理API接口
- **实时通信**：基于Socket.io的实时文件传输
- **文件存储**：支持本地存储和云存储（AWS S3/阿里云OSS）
- **用户认证**：JWT令牌认证和设备管理
- **安全传输**：文件加密和访问控制
- **P2P支持**：WebRTC信令服务器
- **推送通知**：Firebase Cloud Messaging集成

## 🛠️ 技术栈

- **运行时**: Node.js + TypeScript
- **框架**: Express.js
- **实时通信**: Socket.io
- **数据库**: MongoDB + Redis
- **文件存储**: AWS S3 / 阿里云OSS
- **认证**: JWT + bcryptjs
- **验证**: Joi + express-validator
- **日志**: Winston
- **测试**: Jest + Supertest

## 📁 项目结构

```
server/
├── src/
│   ├── controllers/          # 控制器
│   │   ├── auth.ts          # 认证控制器
│   │   ├── file.ts          # 文件控制器
│   │   ├── device.ts        # 设备控制器
│   │   └── transfer.ts      # 传输控制器
│   ├── middleware/          # 中间件
│   │   ├── auth.ts          # 认证中间件
│   │   ├── upload.ts        # 文件上传中间件
│   │   ├── validation.ts    # 数据验证中间件
│   │   └── error.ts         # 错误处理中间件
│   ├── models/              # 数据模型
│   │   ├── User.ts          # 用户模型
│   │   ├── Device.ts        # 设备模型
│   │   ├── File.ts          # 文件模型
│   │   └── Transfer.ts      # 传输记录模型
│   ├── routes/              # 路由定义
│   │   ├── auth.ts          # 认证路由
│   │   ├── files.ts         # 文件路由
│   │   ├── devices.ts       # 设备路由
│   │   └── transfers.ts     # 传输路由
│   ├── services/            # 业务服务
│   │   ├── fileService.ts   # 文件服务
│   │   ├── storageService.ts # 存储服务
│   │   ├── authService.ts   # 认证服务
│   │   ├── socketService.ts # Socket服务
│   │   └── notificationService.ts # 通知服务
│   ├── utils/               # 工具函数
│   │   ├── logger.ts        # 日志工具
│   │   ├── crypto.ts        # 加密工具
│   │   ├── qrcode.ts        # 二维码生成
│   │   └── validation.ts    # 验证工具
│   ├── config/              # 配置文件
│   │   ├── database.ts      # 数据库配置
│   │   ├── storage.ts       # 存储配置
│   │   └── socket.ts        # Socket配置
│   ├── types/               # 类型定义
│   │   ├── auth.ts          # 认证类型
│   │   ├── file.ts          # 文件类型
│   │   └── socket.ts        # Socket类型
│   └── index.ts             # 应用入口
├── uploads/                 # 本地文件存储
├── logs/                    # 日志文件
├── tests/                   # 测试文件
├── docker/                  # Docker配置
├── .env.example             # 环境变量示例
├── tsconfig.json            # TypeScript配置
├── Dockerfile               # Docker镜像配置
└── package.json             # 项目配置
```

## 🚦 开发指南

### 环境要求
- Node.js >= 16.0.0
- MongoDB >= 5.0
- Redis >= 6.0

### 环境配置
复制环境变量文件并配置：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/file-transfer
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# 文件存储配置
STORAGE_TYPE=local  # local | s3 | oss
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads

# AWS S3配置 (如果使用S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# 阿里云OSS配置 (如果使用OSS)
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-secret-key
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=your-bucket-name

# Firebase配置
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### 安装依赖
```bash
cd server
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建和启动
```bash
npm run build
npm start
```

### 测试
```bash
npm test
npm run test:watch
npm run test:coverage
```

### 代码检查
```bash
npm run lint
npm run lint:fix
```

## 🔌 API接口

### 认证接口
```
POST /api/auth/register     # 设备注册
POST /api/auth/login        # 设备登录
POST /api/auth/refresh      # 刷新令牌
POST /api/auth/logout       # 登出
GET  /api/auth/qrcode       # 获取配对二维码
```

### 文件接口
```
POST /api/files/upload      # 上传文件
GET  /api/files             # 获取文件列表
GET  /api/files/:id         # 获取文件详情
GET  /api/files/:id/download # 下载文件
DELETE /api/files/:id       # 删除文件
```

### 设备接口
```
GET  /api/devices           # 获取设备列表
POST /api/devices/pair      # 设备配对
DELETE /api/devices/:id     # 移除设备
```

### 传输接口
```
GET  /api/transfers         # 获取传输记录
POST /api/transfers         # 创建传输任务
GET  /api/transfers/:id     # 获取传输详情
```

## 🔌 Socket事件

### 客户端发送事件
```javascript
// 连接认证
socket.emit('authenticate', { token: 'jwt-token' });

// 文件传输
socket.emit('file:upload', { fileData, metadata });
socket.emit('file:request', { fileId, deviceId });

// 设备配对
socket.emit('device:pair', { qrCode });
```

### 服务器发送事件
```javascript
// 认证结果
socket.emit('authenticated', { success: true, deviceId });

// 文件传输状态
socket.emit('file:progress', { fileId, progress, speed });
socket.emit('file:complete', { fileId, downloadUrl });
socket.emit('file:error', { fileId, error });

// 设备状态
socket.emit('device:connected', { deviceId, deviceInfo });
socket.emit('device:disconnected', { deviceId });
```

## 🐳 Docker部署

### 构建镜像
```bash
npm run docker:build
```

### 运行容器
```bash
npm run docker:run
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/file-transfer
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5.0
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:6.2
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

## 📊 监控和日志

### 日志级别
- `error`: 错误信息
- `warn`: 警告信息
- `info`: 一般信息
- `debug`: 调试信息

### 日志文件
- `logs/error.log`: 错误日志
- `logs/combined.log`: 综合日志
- `logs/access.log`: 访问日志

### 性能监控
建议使用以下工具进行监控：
- PM2: 进程管理
- New Relic: 性能监控
- Sentry: 错误追踪

## 🔒 安全考虑

1. **认证授权**: JWT令牌 + 设备白名单
2. **文件加密**: AES-256加密存储
3. **传输安全**: HTTPS + WSS
4. **访问控制**: 基于角色的权限控制
5. **速率限制**: API请求频率限制
6. **输入验证**: 严格的数据验证

## 🤝 贡献

1. 遵循RESTful API设计规范
2. 编写完整的单元测试
3. 添加详细的API文档
4. 确保代码安全性

## 📄 许可证

MIT License
