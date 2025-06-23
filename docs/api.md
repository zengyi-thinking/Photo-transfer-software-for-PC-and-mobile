# API接口文档

## 📋 概述

本文档描述了跨平台文件传输应用的后端API接口规范，包括RESTful API和Socket.io实时通信接口。

## 🔐 认证机制

### JWT令牌认证
所有需要认证的接口都需要在请求头中包含JWT令牌：

```http
Authorization: Bearer <jwt_token>
```

### 设备注册流程
1. 客户端生成设备指纹
2. 调用注册接口获取设备ID
3. 使用设备ID和密钥进行后续认证

## 🌐 RESTful API

### 基础信息
- **Base URL**: `https://api.filetransfer.com/v1`
- **Content-Type**: `application/json`
- **字符编码**: UTF-8

### 通用响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2023-08-15T10:30:00Z"
}
```

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "令牌无效或已过期",
    "details": {}
  },
  "timestamp": "2023-08-15T10:30:00Z"
}
```

## 🔑 认证接口

### 设备注册
注册新设备并获取设备ID。

**请求**
```http
POST /api/auth/register
Content-Type: application/json

{
  "deviceName": "iPhone 13",
  "deviceType": "mobile",
  "platform": "ios",
  "version": "16.0",
  "fingerprint": "abc123def456"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "deviceId": "device_123456",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 604800
  }
}
```

### 设备登录
使用设备ID和指纹进行登录。

**请求**
```http
POST /api/auth/login
Content-Type: application/json

{
  "deviceId": "device_123456",
  "fingerprint": "abc123def456"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 604800,
    "user": {
      "userId": "user_123",
      "devices": ["device_123456", "device_789012"]
    }
  }
}
```

### 刷新令牌
使用刷新令牌获取新的访问令牌。

**请求**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here",
    "expiresIn": 604800
  }
}
```

### 获取配对二维码
生成设备配对二维码。

**请求**
```http
GET /api/auth/qrcode
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "pairCode": "PAIR123456",
    "expiresAt": "2023-08-15T10:35:00Z"
  }
}
```

### 设备配对
使用配对码完成设备配对。

**请求**
```http
POST /api/auth/pair
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "pairCode": "PAIR123456",
  "targetDeviceId": "device_789012"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "paired": true,
    "targetDevice": {
      "deviceId": "device_789012",
      "deviceName": "Windows PC",
      "deviceType": "desktop",
      "platform": "windows"
    }
  }
}
```

## 📁 文件接口

### 上传文件
上传文件到服务器。

**请求**
```http
POST /api/files/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <binary_data>
targetDevice: device_789012
compress: true
```

**响应**
```json
{
  "success": true,
  "data": {
    "fileId": "file_123456",
    "fileName": "screenshot.png",
    "fileSize": 1048576,
    "mimeType": "image/png",
    "downloadUrl": "https://cdn.filetransfer.com/files/file_123456",
    "thumbnailUrl": "https://cdn.filetransfer.com/thumbs/file_123456",
    "expiresAt": "2023-08-22T10:30:00Z"
  }
}
```

### 获取文件列表
获取用户的文件列表。

**请求**
```http
GET /api/files?page=1&limit=20&type=image&sort=createdAt&order=desc
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "fileId": "file_123456",
        "fileName": "screenshot.png",
        "fileSize": 1048576,
        "mimeType": "image/png",
        "downloadUrl": "https://cdn.filetransfer.com/files/file_123456",
        "thumbnailUrl": "https://cdn.filetransfer.com/thumbs/file_123456",
        "uploadedAt": "2023-08-15T10:30:00Z",
        "uploadedBy": "device_123456",
        "downloadCount": 3,
        "isFavorite": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
}
```

### 获取文件详情
获取特定文件的详细信息。

**请求**
```http
GET /api/files/file_123456
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "fileId": "file_123456",
    "fileName": "screenshot.png",
    "fileSize": 1048576,
    "mimeType": "image/png",
    "hash": "sha256:abc123...",
    "downloadUrl": "https://cdn.filetransfer.com/files/file_123456",
    "thumbnailUrl": "https://cdn.filetransfer.com/thumbs/file_123456",
    "uploadedAt": "2023-08-15T10:30:00Z",
    "uploadedBy": "device_123456",
    "expiresAt": "2023-08-22T10:30:00Z",
    "downloadCount": 3,
    "isFavorite": false,
    "transfers": [
      {
        "transferId": "transfer_123",
        "toDevice": "device_789012",
        "status": "completed",
        "completedAt": "2023-08-15T10:31:00Z"
      }
    ]
  }
}
```

### 下载文件
下载指定文件。

**请求**
```http
GET /api/files/file_123456/download
Authorization: Bearer <jwt_token>
```

**响应**
```http
HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 1048576
Content-Disposition: attachment; filename="screenshot.png"

<binary_data>
```

### 删除文件
删除指定文件。

**请求**
```http
DELETE /api/files/file_123456
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "message": "文件删除成功"
}
```

### 收藏文件
标记或取消标记文件为收藏。

**请求**
```http
PUT /api/files/file_123456/favorite
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "isFavorite": true
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "fileId": "file_123456",
    "isFavorite": true
  }
}
```

## 📱 设备接口

### 获取设备列表
获取用户的所有设备。

**请求**
```http
GET /api/devices
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "deviceId": "device_123456",
        "deviceName": "iPhone 13",
        "deviceType": "mobile",
        "platform": "ios",
        "version": "16.0",
        "isOnline": true,
        "lastSeen": "2023-08-15T10:30:00Z",
        "createdAt": "2023-08-01T09:00:00Z",
        "floatingWindowEnabled": true,
        "floatingWindowPosition": {
          "x": 100,
          "y": 200
        },
        "capabilities": {
          "systemOverlay": true,
          "dragDrop": true,
          "backgroundMode": true
        }
      },
      {
        "deviceId": "device_789012",
        "deviceName": "Windows PC",
        "deviceType": "desktop",
        "platform": "windows",
        "version": "11",
        "isOnline": false,
        "lastSeen": "2023-08-15T09:45:00Z",
        "createdAt": "2023-08-01T09:00:00Z",
        "floatingWindowEnabled": true,
        "floatingWindowPosition": {
          "x": 1200,
          "y": 800
        },
        "capabilities": {
          "systemOverlay": true,
          "dragDrop": true,
          "backgroundMode": true,
          "globalShortcuts": true
        }
      }
    ]
  }
}
```

### 更新设备信息
更新设备的基本信息。

**请求**
```http
PUT /api/devices/device_123456
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "deviceName": "我的iPhone",
  "version": "16.1"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "deviceId": "device_123456",
    "deviceName": "我的iPhone",
    "version": "16.1",
    "updatedAt": "2023-08-15T10:30:00Z"
  }
}
```

### 移除设备
从用户账户中移除设备。

**请求**
```http
DELETE /api/devices/device_789012
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "message": "设备移除成功"
}
```

### 更新悬浮窗配置
更新设备的悬浮窗配置。

**请求**
```http
PUT /api/devices/device_123456/floating-window
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "enabled": true,
  "position": {
    "x": 150,
    "y": 300
  },
  "isMinimized": false,
  "autoHide": true,
  "alwaysOnTop": true
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "deviceId": "device_123456",
    "floatingWindowEnabled": true,
    "floatingWindowPosition": {
      "x": 150,
      "y": 300
    },
    "floatingWindowConfig": {
      "isMinimized": false,
      "autoHide": true,
      "alwaysOnTop": true
    },
    "updatedAt": "2023-08-15T10:30:00Z"
  }
}
```

### 获取设备权限状态
获取设备的权限状态（如悬浮窗权限）。

**请求**
```http
GET /api/devices/device_123456/permissions
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "deviceId": "device_123456",
    "permissions": {
      "systemOverlay": true,
      "storage": true,
      "camera": true,
      "notification": true,
      "backgroundApp": true
    },
    "capabilities": {
      "dragDrop": true,
      "systemIntegration": true,
      "globalShortcuts": true,
      "autoStart": true
    },
    "checkedAt": "2023-08-15T10:30:00Z"
  }
}
```

## 🔄 传输接口

### 获取传输记录
获取文件传输历史记录。

**请求**
```http
GET /api/transfers?page=1&limit=20&status=completed&deviceId=device_123456
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "transferId": "transfer_123",
        "fileId": "file_123456",
        "fileName": "screenshot.png",
        "fileSize": 1048576,
        "fromDevice": "device_123456",
        "fromDeviceName": "iPhone 13",
        "toDevice": "device_789012",
        "toDeviceName": "Windows PC",
        "status": "completed",
        "progress": 100,
        "speed": 5242880,
        "startedAt": "2023-08-15T10:30:00Z",
        "completedAt": "2023-08-15T10:30:15Z",
        "duration": 15000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### 创建传输任务
创建新的文件传输任务。

**请求**
```http
POST /api/transfers
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "fileId": "file_123456",
  "toDevice": "device_789012",
  "transferType": "push"
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "transferId": "transfer_124",
    "fileId": "file_123456",
    "toDevice": "device_789012",
    "status": "pending",
    "createdAt": "2023-08-15T10:30:00Z"
  }
}
```

### 获取传输详情
获取特定传输任务的详细信息。

**请求**
```http
GET /api/transfers/transfer_123
Authorization: Bearer <jwt_token>
```

**响应**
```json
{
  "success": true,
  "data": {
    "transferId": "transfer_123",
    "fileId": "file_123456",
    "fileName": "screenshot.png",
    "fileSize": 1048576,
    "fromDevice": "device_123456",
    "toDevice": "device_789012",
    "status": "completed",
    "progress": 100,
    "speed": 5242880,
    "startedAt": "2023-08-15T10:30:00Z",
    "completedAt": "2023-08-15T10:30:15Z",
    "error": null,
    "logs": [
      {
        "timestamp": "2023-08-15T10:30:00Z",
        "event": "transfer_started",
        "message": "开始传输文件"
      },
      {
        "timestamp": "2023-08-15T10:30:15Z",
        "event": "transfer_completed",
        "message": "文件传输完成"
      }
    ]
  }
}
```

## 🔌 Socket.io 实时通信

### 连接认证
客户端连接后需要进行认证。

**客户端发送**
```javascript
socket.emit('authenticate', {
  token: 'jwt_token_here',
  deviceId: 'device_123456'
});
```

**服务器响应**
```javascript
socket.emit('authenticated', {
  success: true,
  deviceId: 'device_123456',
  userId: 'user_123'
});

// 或认证失败
socket.emit('authenticated', {
  success: false,
  error: 'Invalid token'
});
```

### 设备状态事件

#### 设备上线
```javascript
// 服务器广播给其他设备
socket.emit('device:online', {
  deviceId: 'device_123456',
  deviceName: 'iPhone 13',
  timestamp: '2023-08-15T10:30:00Z',
  floatingWindowEnabled: true,
  capabilities: {
    systemOverlay: true,
    dragDrop: true
  }
});
```

#### 设备下线
```javascript
// 服务器广播给其他设备
socket.emit('device:offline', {
  deviceId: 'device_123456',
  deviceName: 'iPhone 13',
  timestamp: '2023-08-15T10:30:00Z'
});
```

#### 悬浮窗状态更新
```javascript
// 客户端发送悬浮窗状态更新
socket.emit('floating-window:update', {
  deviceId: 'device_123456',
  position: { x: 150, y: 300 },
  isMinimized: false,
  isVisible: true
});

// 服务器广播状态更新
socket.emit('floating-window:status', {
  deviceId: 'device_123456',
  position: { x: 150, y: 300 },
  isMinimized: false,
  isVisible: true,
  timestamp: '2023-08-15T10:30:00Z'
});
```

#### 权限状态更新
```javascript
// 客户端发送权限状态更新
socket.emit('permissions:update', {
  deviceId: 'device_123456',
  permissions: {
    systemOverlay: true,
    storage: true,
    camera: false
  }
});

// 服务器确认权限更新
socket.emit('permissions:updated', {
  deviceId: 'device_123456',
  permissions: {
    systemOverlay: true,
    storage: true,
    camera: false
  },
  timestamp: '2023-08-15T10:30:00Z'
});
```

#### 设备配对请求
```javascript
// 客户端发送配对请求
socket.emit('device:pair:request', {
  pairCode: 'PAIR123456',
  deviceInfo: {
    deviceName: 'iPhone 13',
    deviceType: 'mobile',
    platform: 'ios'
  }
});

// 服务器通知目标设备
socket.emit('device:pair:request', {
  fromDevice: 'device_123456',
  deviceInfo: {
    deviceName: 'iPhone 13',
    deviceType: 'mobile',
    platform: 'ios'
  },
  pairCode: 'PAIR123456'
});
```

#### 配对响应
```javascript
// 客户端响应配对请求
socket.emit('device:pair:response', {
  pairCode: 'PAIR123456',
  accepted: true
});

// 服务器通知配对结果
socket.emit('device:pair:result', {
  success: true,
  targetDevice: {
    deviceId: 'device_789012',
    deviceName: 'Windows PC'
  }
});
```

### 文件传输事件

#### 开始文件传输
```javascript
// 客户端发起传输
socket.emit('file:transfer:start', {
  fileId: 'file_123456',
  fileName: 'screenshot.png',
  fileSize: 1048576,
  mimeType: 'image/png',
  toDevice: 'device_789012',
  transferType: 'push'
});

// 服务器响应
socket.emit('file:transfer:started', {
  transferId: 'transfer_123',
  fileId: 'file_123456',
  status: 'uploading'
});
```

#### 传输进度更新
```javascript
// 服务器发送进度更新
socket.emit('file:transfer:progress', {
  transferId: 'transfer_123',
  fileId: 'file_123456',
  progress: 45,
  speed: 5242880,
  eta: 8000
});
```

#### 传输完成
```javascript
// 服务器通知传输完成
socket.emit('file:transfer:completed', {
  transferId: 'transfer_123',
  fileId: 'file_123456',
  downloadUrl: 'https://cdn.filetransfer.com/files/file_123456',
  duration: 15000
});
```

#### 传输失败
```javascript
// 服务器通知传输失败
socket.emit('file:transfer:failed', {
  transferId: 'transfer_123',
  fileId: 'file_123456',
  error: {
    code: 'NETWORK_ERROR',
    message: '网络连接中断'
  }
});
```

#### 文件接收通知
```javascript
// 服务器通知目标设备有新文件
socket.emit('file:received', {
  fileId: 'file_123456',
  fileName: 'screenshot.png',
  fileSize: 1048576,
  mimeType: 'image/png',
  fromDevice: 'device_123456',
  fromDeviceName: 'iPhone 13',
  downloadUrl: 'https://cdn.filetransfer.com/files/file_123456',
  thumbnailUrl: 'https://cdn.filetransfer.com/thumbs/file_123456',
  receivedAt: '2023-08-15T10:30:15Z',
  dragDropSupported: true
});
```

#### 拖拽传输事件

##### 拖拽开始
```javascript
// 客户端发送拖拽开始事件
socket.emit('drag:start', {
  fileId: 'file_123456',
  fileName: 'screenshot.png',
  fileSize: 1048576,
  mimeType: 'image/png',
  fromDevice: 'device_123456',
  dragData: {
    type: 'file',
    tempPath: '/tmp/screenshot.png'
  }
});
```

##### 拖拽到外部应用
```javascript
// 客户端通知拖拽到外部应用
socket.emit('drag:external', {
  fileId: 'file_123456',
  targetApp: 'com.tencent.mm', // 微信
  dragType: 'file',
  success: true,
  timestamp: '2023-08-15T10:30:00Z'
});
```

##### 跨设备拖拽
```javascript
// 客户端发起跨设备拖拽
socket.emit('drag:cross-device', {
  fileId: 'file_123456',
  fromDevice: 'device_123456',
  toDevice: 'device_789012',
  dragData: {
    type: 'file',
    fileName: 'screenshot.png',
    mimeType: 'image/png'
  }
});

// 服务器转发到目标设备
socket.emit('drag:receive', {
  fileId: 'file_123456',
  fromDevice: 'device_123456',
  dragData: {
    type: 'file',
    fileName: 'screenshot.png',
    mimeType: 'image/png',
    downloadUrl: 'https://api.example.com/files/file_123456'
  }
});
```

### P2P连接事件

#### 请求P2P连接
```javascript
// 客户端请求P2P连接
socket.emit('p2p:connect:request', {
  toDevice: 'device_789012',
  offer: {
    type: 'offer',
    sdp: 'webrtc_offer_sdp_here'
  }
});

// 服务器转发给目标设备
socket.emit('p2p:connect:offer', {
  fromDevice: 'device_123456',
  offer: {
    type: 'offer',
    sdp: 'webrtc_offer_sdp_here'
  }
});
```

#### P2P连接响应
```javascript
// 目标设备响应
socket.emit('p2p:connect:answer', {
  toDevice: 'device_123456',
  answer: {
    type: 'answer',
    sdp: 'webrtc_answer_sdp_here'
  }
});

// 服务器转发答复
socket.emit('p2p:connect:answer', {
  fromDevice: 'device_789012',
  answer: {
    type: 'answer',
    sdp: 'webrtc_answer_sdp_here'
  }
});
```

#### ICE候选交换
```javascript
// 交换ICE候选
socket.emit('p2p:ice:candidate', {
  toDevice: 'device_789012',
  candidate: {
    candidate: 'ice_candidate_here',
    sdpMLineIndex: 0,
    sdpMid: 'data'
  }
});
```

#### P2P连接状态
```javascript
// P2P连接建立成功
socket.emit('p2p:connected', {
  deviceId: 'device_789012',
  connectionType: 'direct'
});

// P2P连接断开
socket.emit('p2p:disconnected', {
  deviceId: 'device_789012',
  reason: 'network_error'
});
```

## 📊 错误代码

### 认证错误
- `AUTH_001`: 令牌无效或已过期
- `AUTH_002`: 设备未注册
- `AUTH_003`: 设备已被禁用
- `AUTH_004`: 配对码无效或已过期

### 文件错误
- `FILE_001`: 文件不存在
- `FILE_002`: 文件大小超出限制
- `FILE_003`: 文件类型不支持
- `FILE_004`: 存储空间不足
- `FILE_005`: 文件上传失败

### 传输错误
- `TRANSFER_001`: 目标设备不在线
- `TRANSFER_002`: 传输任务不存在
- `TRANSFER_003`: 网络连接中断
- `TRANSFER_004`: 传输超时

### 设备错误
- `DEVICE_001`: 设备不存在
- `DEVICE_002`: 设备未配对
- `DEVICE_003`: 设备配对失败
- `DEVICE_004`: 设备数量超出限制

## 📈 限流规则

### API限流
- **认证接口**: 每分钟最多10次请求
- **文件上传**: 每分钟最多5次请求
- **文件下载**: 每分钟最多20次请求
- **其他接口**: 每分钟最多60次请求

### Socket连接限流
- **每个设备**: 最多3个并发连接
- **消息频率**: 每秒最多10条消息
- **文件传输**: 每个设备同时最多3个传输任务

## 📝 使用示例

### JavaScript客户端示例
```javascript
// 初始化Socket连接
const socket = io('wss://api.filetransfer.com', {
  auth: {
    token: 'jwt_token_here'
  }
});

// 监听认证结果
socket.on('authenticated', (data) => {
  if (data.success) {
    console.log('认证成功:', data.deviceId);
  } else {
    console.error('认证失败:', data.error);
  }
});

// 监听文件接收
socket.on('file:received', (data) => {
  console.log('收到新文件:', data.fileName);
  // 显示通知或更新UI
});

// 发送文件传输请求
socket.emit('file:transfer:start', {
  fileId: 'file_123456',
  toDevice: 'device_789012'
});
```

### HTTP API调用示例
```javascript
// 上传文件
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('targetDevice', 'device_789012');

const response = await fetch('/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('上传结果:', result);
```
