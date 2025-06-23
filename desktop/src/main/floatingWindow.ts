// 悬浮窗管理器
import { BrowserWindow, screen, ipcMain } from 'electron';
import { ScreenshotManager } from './screenshot';

export interface WindowConfig {
  window: {
    normal: { width: number; height: number };
    mini: { width: number; height: number };
  };
  autoHideDelay: number;
  snapThreshold: number;
}

export interface WindowState {
  isVisible: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  alwaysOnTop: boolean;
}

export class FloatingWindowManager {
  private window: BrowserWindow;
  private config: WindowConfig;
  private state: WindowState;
  private autoHideTimer: NodeJS.Timeout | null = null;
  private screenshotManager: ScreenshotManager;

  constructor(window: BrowserWindow, config: WindowConfig) {
    this.window = window;
    this.config = config;
    this.screenshotManager = new ScreenshotManager();
    
    this.state = {
      isVisible: true,
      isMinimized: false,
      position: { x: 0, y: 0 },
      size: config.window.normal,
      opacity: 0.95,
      alwaysOnTop: true,
    };

    this.setupEventListeners();
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    // 窗口移动事件
    this.window.on('moved', () => {
      const [x, y] = this.window.getPosition();
      this.state.position = { x, y };
      this.checkSnapToEdge();
    });

    // 鼠标进入窗口
    this.window.webContents.on('dom-ready', () => {
      this.window.webContents.executeJavaScript(`
        document.addEventListener('mouseenter', () => {
          window.electronAPI?.cancelAutoHide();
        });
        
        document.addEventListener('mouseleave', () => {
          window.electronAPI?.startAutoHide();
        });
      `);
    });
  }

  // 初始化窗口位置
  public initializePosition(): void {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    
    // 默认位置：右下角
    const x = screenWidth - this.state.size.width - 20;
    const y = screenHeight - this.state.size.height - 20;
    
    this.window.setPosition(x, y);
    this.state.position = { x, y };
  }

  // 切换最小化状态
  public toggleMinimize(): void {
    this.state.isMinimized = !this.state.isMinimized;
    
    if (this.state.isMinimized) {
      // 切换到最小化模式
      this.state.size = this.config.window.mini;
      this.window.setSize(this.config.window.mini.width, this.config.window.mini.height);
      this.window.webContents.send('window-state-changed', { isMinimized: true });
    } else {
      // 切换到正常模式
      this.state.size = this.config.window.normal;
      this.window.setSize(this.config.window.normal.width, this.config.window.normal.height);
      this.window.webContents.send('window-state-changed', { isMinimized: false });
    }
  }

  // 切换可见性
  public toggleVisibility(): void {
    if (this.state.isVisible) {
      this.window.hide();
      this.state.isVisible = false;
    } else {
      this.window.show();
      this.state.isVisible = true;
    }
  }

  // 开始自动隐藏
  public startAutoHide(): void {
    this.cancelAutoHide();
    
    this.autoHideTimer = setTimeout(() => {
      this.setOpacity(0.3);
    }, this.config.autoHideDelay);
  }

  // 取消自动隐藏
  public cancelAutoHide(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    this.setOpacity(0.95);
  }

  // 设置透明度
  private setOpacity(opacity: number): void {
    this.state.opacity = opacity;
    this.window.setOpacity(opacity);
  }

  // 检查贴边吸附
  private checkSnapToEdge(): void {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const { x, y } = this.state.position;
    const { width, height } = this.state.size;
    const threshold = this.config.snapThreshold;

    let newX = x;
    let newY = y;

    // 左边吸附
    if (x < threshold) {
      newX = 0;
    }
    // 右边吸附
    else if (x + width > screenWidth - threshold) {
      newX = screenWidth - width;
    }

    // 上边吸附
    if (y < threshold) {
      newY = 0;
    }
    // 下边吸附
    else if (y + height > screenHeight - threshold) {
      newY = screenHeight - height;
    }

    // 如果位置发生变化，应用新位置
    if (newX !== x || newY !== y) {
      this.window.setPosition(newX, newY);
      this.state.position = { x: newX, y: newY };
    }
  }

  // 智能定位 - 避开其他窗口
  public smartPosition(): void {
    const allWindows = BrowserWindow.getAllWindows();
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    
    // 获取所有其他窗口的位置
    const otherWindows = allWindows
      .filter(win => win !== this.window)
      .map(win => {
        const [x, y] = win.getPosition();
        const [width, height] = win.getSize();
        return { x, y, width, height };
      });

    // 寻找最佳位置
    const candidates = [
      { x: screenWidth - this.state.size.width - 20, y: screenHeight - this.state.size.height - 20 }, // 右下
      { x: 20, y: screenHeight - this.state.size.height - 20 }, // 左下
      { x: screenWidth - this.state.size.width - 20, y: 20 }, // 右上
      { x: 20, y: 20 }, // 左上
    ];

    // 选择不与其他窗口重叠的位置
    for (const candidate of candidates) {
      const isOverlapping = otherWindows.some(other => 
        this.isRectOverlapping(
          candidate.x, candidate.y, this.state.size.width, this.state.size.height,
          other.x, other.y, other.width, other.height
        )
      );

      if (!isOverlapping) {
        this.window.setPosition(candidate.x, candidate.y);
        this.state.position = candidate;
        break;
      }
    }
  }

  // 检查矩形重叠
  private isRectOverlapping(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
  }

  // 截图并上传
  public async captureAndUpload(): Promise<void> {
    try {
      const screenshotPath = await this.screenshotManager.captureScreen();
      
      // 发送截图到渲染进程处理上传
      this.window.webContents.send('screenshot-captured', screenshotPath);
      
      // 显示上传进度
      this.showUploadProgress();
    } catch (error) {
      console.error('截图失败:', error);
      this.window.webContents.send('screenshot-error', error.message);
    }
  }

  // 显示上传进度
  private showUploadProgress(): void {
    // 临时显示窗口并取消自动隐藏
    this.cancelAutoHide();
    this.setOpacity(1.0);
    
    if (!this.state.isVisible) {
      this.window.show();
      this.state.isVisible = true;
    }
  }

  // 获取窗口状态
  public getState(): WindowState {
    return { ...this.state };
  }

  // 销毁管理器
  public destroy(): void {
    this.cancelAutoHide();
    this.screenshotManager.destroy();
  }
}
