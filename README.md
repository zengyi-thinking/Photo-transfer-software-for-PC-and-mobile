# 跨平台文件传输应用 (Cross-Platform File Transfer)

一个现代化的跨平台文件传输解决方案，支持PC和移动设备之间的快速、安全文件传输。

## 🚀 项目特性

- **PC端浮动窗口**：Windows桌面应用，支持截图快传和拖拽传输
- **移动端应用**：Android/iOS跨平台应用，智能文件管理
- **混合传输机制**：P2P直连 + 云端中转，确保传输速度和可靠性
- **安全加密**：端到端加密，保护文件传输安全
- **智能组织**：自动文件分类，比微信文件传输助手更好的用户体验

## 📁 项目结构

```
cross-platform-file-transfer/
├── desktop/                    # PC端应用 (Electron)
│   ├── src/
│   ├── package.json
│   └── README.md
├── mobile/                     # 移动端应用 (React Native)
│   ├── src/
│   ├── package.json
│   └── README.md
├── server/                     # 后端服务 (Node.js)
│   ├── src/
│   ├── package.json
│   └── README.md
├── shared/                     # 共享代码和类型定义
│   ├── types/
│   ├── utils/
│   └── constants/
├── docs/                       # 项目文档
│   ├── design.md
│   ├── api.md
│   └── deployment.md
├── scripts/                    # 构建和部署脚本
├── .gitignore
├── package.json               # 根项目配置
└── README.md
```

## 🛠️ 技术栈

### PC端 (Desktop)
- **框架**: Electron + React + TypeScript
- **UI库**: Ant Design + Styled Components
- **状态管理**: Zustand
- **构建工具**: Vite

### 移动端 (Mobile)
- **框架**: React Native + TypeScript
- **导航**: React Navigation
- **状态管理**: Zustand
- **UI组件**: React Native Elements

### 后端 (Server)
- **运行时**: Node.js + TypeScript
- **框架**: Express + Socket.io
- **数据库**: MongoDB + Redis
- **文件存储**: 阿里云OSS / AWS S3
- **认证**: JWT

## 🚦 开发路线图

### MVP阶段 (第1-2周)
- [x] 项目结构搭建
- [ ] PC端浮动窗口基础框架
- [ ] 后端API服务和文件上传
- [ ] 移动端基础界面
- [ ] 基础文件传输功能

### 第二阶段 (第3-4周)
- [ ] 截图快传功能
- [ ] 推送通知系统
- [ ] 文件分类和管理
- [ ] 用户界面优化

### 第三阶段 (第5-6周)
- [ ] P2P直连功能
- [ ] 高级文件管理
- [ ] 性能优化
- [ ] 安全加固

## 📖 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- React Native CLI (移动端开发)
- Android Studio / Xcode (移动端调试)

### 安装依赖
```bash
# 安装根项目依赖
npm install

# 安装各模块依赖
npm run install:all
```

### 开发模式启动
```bash
# 启动后端服务
npm run dev:server

# 启动PC端应用
npm run dev:desktop

# 启动移动端应用
npm run dev:mobile
```

## 📚 文档

- [设计文档](./docs/design.md) - 详细的技术架构和设计思路
- [API文档](./docs/api.md) - 后端API接口说明
- [部署文档](./docs/deployment.md) - 生产环境部署指南

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至项目维护者

---

**注意**: 这是一个正在开发中的项目，功能和API可能会发生变化。
