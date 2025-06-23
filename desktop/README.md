# File Transfer Desktop App

PC端桌面应用，基于Electron + React + TypeScript构建的现代化文件传输工具。

## 🚀 功能特性

- **浮动窗口界面**：始终置顶的小巧浮动窗口，不干扰其他应用
- **截图快传**：一键截图并快速传输到移动设备
- **拖拽传输**：支持拖拽文件到窗口进行传输
- **文件管理**：查看传输历史和文件状态
- **系统集成**：系统托盘图标，开机自启动

## 🛠️ 技术栈

- **框架**: Electron 25+
- **前端**: React 18 + TypeScript
- **UI库**: Ant Design + Styled Components
- **状态管理**: Zustand
- **构建工具**: Webpack + Electron Builder
- **通信**: Socket.io Client

## 📁 项目结构

```
desktop/
├── src/
│   ├── main/                   # 主进程代码
│   │   ├── index.ts           # 主进程入口
│   │   ├── window.ts          # 窗口管理
│   │   ├── tray.ts            # 系统托盘
│   │   ├── screenshot.ts      # 截图功能
│   │   └── ipc.ts             # 进程间通信
│   ├── renderer/              # 渲染进程代码
│   │   ├── components/        # React组件
│   │   ├── pages/             # 页面组件
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── store/             # 状态管理
│   │   ├── services/          # API服务
│   │   ├── utils/             # 工具函数
│   │   ├── styles/            # 样式文件
│   │   ├── App.tsx            # 应用根组件
│   │   └── index.tsx          # 渲染进程入口
│   └── shared/                # 共享代码
│       ├── types/             # 类型定义
│       └── constants/         # 常量定义
├── assets/                    # 静态资源
│   ├── icons/                 # 图标文件
│   └── images/                # 图片资源
├── build/                     # 构建输出
├── dist/                      # 编译输出
├── webpack.renderer.config.js # 渲染进程Webpack配置
├── tsconfig.json              # TypeScript配置
└── package.json               # 项目配置
```

## 🚦 开发指南

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
cd desktop
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建应用
```bash
# 构建代码
npm run build

# 打包应用
npm run dist

# 仅Windows
npm run dist:win
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

### 浮动窗口
- **尺寸**: 320x480px，可调整
- **位置**: 默认右下角，可拖拽
- **样式**: 现代化毛玻璃效果，圆角设计
- **透明度**: 支持半透明模式

### 主要功能区域
1. **顶部工具栏**: 截图、设置、最小化按钮
2. **文件拖拽区**: 大面积拖拽上传区域
3. **传输列表**: 显示最近传输的文件
4. **底部状态栏**: 连接状态、传输进度

## 🔧 配置说明

### 应用配置
应用配置存储在用户数据目录的`config.json`文件中：

```json
{
  "window": {
    "width": 320,
    "height": 480,
    "x": 100,
    "y": 100,
    "alwaysOnTop": true,
    "opacity": 0.95
  },
  "server": {
    "url": "http://localhost:3000",
    "autoConnect": true
  },
  "features": {
    "autoStart": true,
    "minimizeToTray": true,
    "screenshotHotkey": "Ctrl+Shift+S"
  }
}
```

### 快捷键
- `Ctrl+Shift+S`: 截图并传输
- `Ctrl+Shift+F`: 显示/隐藏主窗口
- `Ctrl+Shift+Q`: 退出应用

## 📦 打包发布

### Windows
```bash
npm run dist:win
```
生成的安装包位于 `build/` 目录。

### 自动更新
应用支持自动更新功能，通过`electron-updater`实现。

## 🐛 调试

### 开发者工具
在开发模式下，按 `F12` 打开开发者工具。

### 日志
应用日志存储在：
- Windows: `%APPDATA%/file-transfer-desktop/logs/`
- macOS: `~/Library/Logs/file-transfer-desktop/`
- Linux: `~/.config/file-transfer-desktop/logs/`

## 🤝 贡献

1. 遵循项目的代码规范
2. 提交前运行测试和代码检查
3. 详细描述变更内容

## 📄 许可证

MIT License
