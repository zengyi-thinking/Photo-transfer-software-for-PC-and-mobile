# File Transfer Mobile App

移动端应用，基于React Native构建的跨平台文件传输工具，支持Android和iOS。

## 🚀 功能特性

- **文件管理**：智能分类显示接收的文件
- **实时接收**：即时接收来自PC端的文件传输
- **推送通知**：文件传输状态实时通知
- **图片预览**：内置图片查看器，支持缩放和分享
- **文件分享**：一键分享到其他应用或保存到相册
- **传输历史**：查看所有传输记录和文件状态

## 🛠️ 技术栈

- **框架**: React Native 0.72+
- **导航**: React Navigation 6
- **UI组件**: React Native Elements + React Native Paper
- **状态管理**: Zustand
- **网络**: Axios + Socket.io Client
- **推送**: Firebase Cloud Messaging
- **存储**: AsyncStorage + React Native FS

## 📁 项目结构

```
mobile/
├── src/
│   ├── components/            # 通用组件
│   │   ├── common/           # 基础组件
│   │   ├── file/             # 文件相关组件
│   │   └── ui/               # UI组件
│   ├── screens/              # 页面组件
│   │   ├── Home/             # 首页
│   │   ├── Files/            # 文件管理
│   │   ├── Settings/         # 设置页面
│   │   └── Transfer/         # 传输页面
│   ├── navigation/           # 导航配置
│   ├── services/             # API服务
│   │   ├── api.ts            # API接口
│   │   ├── socket.ts         # Socket连接
│   │   └── notification.ts   # 推送通知
│   ├── store/                # 状态管理
│   │   ├── fileStore.ts      # 文件状态
│   │   ├── userStore.ts      # 用户状态
│   │   └── settingsStore.ts  # 设置状态
│   ├── utils/                # 工具函数
│   │   ├── fileUtils.ts      # 文件处理
│   │   ├── permissions.ts    # 权限管理
│   │   └── storage.ts        # 本地存储
│   ├── hooks/                # 自定义Hooks
│   ├── types/                # 类型定义
│   └── constants/            # 常量定义
├── android/                  # Android原生代码
├── ios/                      # iOS原生代码
├── assets/                   # 静态资源
│   ├── images/               # 图片资源
│   └── fonts/                # 字体文件
├── __tests__/                # 测试文件
├── metro.config.js           # Metro配置
├── babel.config.js           # Babel配置
├── tsconfig.json             # TypeScript配置
└── package.json              # 项目配置
```

## 🚦 开发指南

### 环境要求
- Node.js >= 16.0.0
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发)

### 安装依赖
```bash
cd mobile
npm install

# iOS需要安装CocoaPods依赖
npm run pod:install
```

### 开发模式

#### Android
```bash
# 启动Metro服务器
npm start

# 运行Android应用
npm run android
```

#### iOS
```bash
# 启动Metro服务器
npm start

# 运行iOS应用
npm run ios
```

### 构建发布版本

#### Android
```bash
npm run build:android
```
APK文件位于 `android/app/build/outputs/apk/release/`

#### iOS
```bash
npm run build:ios
```

### 测试
```bash
npm test
```

### 代码检查
```bash
npm run lint
npm run lint:fix
```

## 🎨 界面设计

### 主要页面

#### 首页 (Home)
- 连接状态显示
- 快速操作按钮
- 最近传输文件预览

#### 文件管理 (Files)
- 分类标签页：全部、图片、文档、其他
- 文件列表展示
- 搜索和筛选功能

#### 传输页面 (Transfer)
- 实时传输进度
- 传输队列管理
- 传输历史记录

#### 设置页面 (Settings)
- 连接配置
- 通知设置
- 存储管理
- 关于信息

### UI组件

#### 文件卡片 (FileCard)
- 文件图标和名称
- 文件大小和时间
- 操作按钮（预览、分享、删除）

#### 传输进度 (TransferProgress)
- 进度条显示
- 传输速度
- 剩余时间

## 📱 平台特性

### Android
- 支持Android 6.0+ (API 23+)
- 自适应图标
- 通知渠道
- 文件权限管理

### iOS
- 支持iOS 11.0+
- App Transport Security配置
- 推送通知权限
- 文件访问权限

## 🔧 配置说明

### 推送通知配置
在 `firebase.json` 中配置Firebase：

```json
{
  "react-native": {
    "android_task_executor_maximum_pool_size": 10,
    "android_task_executor_keep_alive_seconds": 3
  }
}
```

### 权限配置

#### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

#### iOS (ios/FileTransfer/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机来拍照和扫描二维码</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问相册来保存和选择图片</string>
```

## 🐛 调试

### React Native调试
- 摇晃设备或按 `Cmd+D` (iOS) / `Ctrl+M` (Android) 打开调试菜单
- 使用Flipper进行高级调试

### 日志查看
```bash
# Android
npx react-native log-android

# iOS
npx react-native log-ios
```

## 📦 发布

### Android发布
1. 生成签名密钥
2. 配置 `android/gradle.properties`
3. 运行 `npm run build:android`
4. 上传到Google Play Store

### iOS发布
1. 配置Apple Developer账号
2. 设置App Store Connect
3. 使用Xcode Archive
4. 上传到App Store

## 🤝 贡献

1. 遵循React Native最佳实践
2. 确保Android和iOS平台兼容性
3. 提交前测试所有功能

## 📄 许可证

MIT License
