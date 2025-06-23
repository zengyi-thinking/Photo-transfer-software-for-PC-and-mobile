// PC端主进程入口文件 - 悬浮窗模式
import { app, BrowserWindow, screen, ipcMain, globalShortcut, Tray, Menu } from 'electron';
import * as path from 'path';
import { FloatingWindowManager } from './floatingWindow';
import { DragDropManager } from './dragDrop';
import { TrayManager } from './tray';

// 窗口管理器
let floatingWindowManager: FloatingWindowManager | null = null;
let dragDropManager: DragDropManager | null = null;
let trayManager: TrayManager | null = null;

// 应用配置
const APP_CONFIG = {
  window: {
    normal: { width: 280, height: 200 },
    mini: { width: 60, height: 60 },
  },
  autoHideDelay: 3000,
  snapThreshold: 20,
};

const createFloatingWindow = (): void => {
  // 获取主显示器信息
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // 创建紧凑悬浮窗
  const mainWindow = new BrowserWindow({
    width: APP_CONFIG.window.normal.width,
    height: APP_CONFIG.window.normal.height,
    x: screenWidth - APP_CONFIG.window.normal.width - 20,
    y: screenHeight - APP_CONFIG.window.normal.height - 20,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    // 设置窗口级别为最高
    level: 'screen-saver',
    // 禁用窗口动画
    thickFrame: false,
  });

  // 初始化窗口管理器
  floatingWindowManager = new FloatingWindowManager(mainWindow, APP_CONFIG);
  dragDropManager = new DragDropManager(mainWindow);

  // 加载渲染进程
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3001');
    // 开发模式下不自动打开开发者工具，避免干扰悬浮窗
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    floatingWindowManager?.initializePosition();
  });

  // 窗口事件处理
  mainWindow.on('closed', () => {
    floatingWindowManager = null;
    dragDropManager = null;
  });

  // 鼠标进入/离开事件
  mainWindow.on('blur', () => {
    floatingWindowManager?.startAutoHide();
  });

  mainWindow.on('focus', () => {
    floatingWindowManager?.cancelAutoHide();
  });
};

// 注册全局快捷键
const registerGlobalShortcuts = (): void => {
  // 截图并传输快捷键
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    floatingWindowManager?.captureAndUpload();
  });

  // 显示/隐藏悬浮窗
  globalShortcut.register('CommandOrControl+Shift+F', () => {
    floatingWindowManager?.toggleVisibility();
  });

  // 切换最小化模式
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    floatingWindowManager?.toggleMinimize();
  });
};

// 应用就绪时初始化
app.whenReady().then(() => {
  createFloatingWindow();
  registerGlobalShortcuts();

  // 创建系统托盘
  trayManager = new TrayManager();
  trayManager.createTray();
});

// 所有窗口关闭时的处理
app.on('window-all-closed', () => {
  // 悬浮窗应用通常不退出，保持在后台运行
  if (process.platform !== 'darwin') {
    // Windows/Linux 保持运行，通过托盘管理
  }
});

app.on('activate', () => {
  if (floatingWindowManager === null) {
    createFloatingWindow();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  trayManager?.destroy();
});

// IPC事件处理
ipcMain.handle('get-app-config', () => {
  return APP_CONFIG;
});

ipcMain.handle('toggle-minimize', () => {
  floatingWindowManager?.toggleMinimize();
});

ipcMain.handle('upload-files', async (event, filePaths: string[]) => {
  return await dragDropManager?.handleFileUpload(filePaths);
});

ipcMain.handle('start-file-drag', (event, fileInfo) => {
  return dragDropManager?.startFileDrag(fileInfo);
});
