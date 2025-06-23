// 系统托盘管理器
import { Tray, Menu, app, BrowserWindow } from 'electron';
import * as path from 'path';

export class TrayManager {
  private tray: Tray | null = null;

  public createTray(): void {
    // 创建托盘图标
    const iconPath = this.getTrayIconPath();
    this.tray = new Tray(iconPath);

    // 设置托盘提示
    this.tray.setToolTip('文件传输助手');

    // 创建上下文菜单
    this.createContextMenu();

    // 托盘点击事件
    this.tray.on('click', () => {
      this.toggleMainWindow();
    });

    // 托盘双击事件
    this.tray.on('double-click', () => {
      this.showMainWindow();
    });
  }

  // 获取托盘图标路径
  private getTrayIconPath(): string {
    // 根据平台选择合适的图标
    const platform = process.platform;
    let iconName = 'tray-icon.png';

    if (platform === 'darwin') {
      iconName = 'tray-icon-mac.png';
    } else if (platform === 'win32') {
      iconName = 'tray-icon-win.ico';
    }

    return path.join(__dirname, '../../assets/icons', iconName);
  }

  // 创建上下文菜单
  private createContextMenu(): void {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          this.showMainWindow();
        }
      },
      {
        label: '隐藏主窗口',
        click: () => {
          this.hideMainWindow();
        }
      },
      {
        type: 'separator'
      },
      {
        label: '截图并传输',
        accelerator: 'CommandOrControl+Shift+S',
        click: () => {
          this.captureAndUpload();
        }
      },
      {
        label: '切换最小化模式',
        accelerator: 'CommandOrControl+Shift+M',
        click: () => {
          this.toggleMinimizeMode();
        }
      },
      {
        type: 'separator'
      },
      {
        label: '设置',
        click: () => {
          this.openSettings();
        }
      },
      {
        label: '关于',
        click: () => {
          this.showAbout();
        }
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  // 切换主窗口显示状态
  private toggleMainWindow(): void {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }

  // 显示主窗口
  private showMainWindow(): void {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    mainWindow.show();
    mainWindow.focus();
  }

  // 隐藏主窗口
  private hideMainWindow(): void {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    mainWindow.hide();
  }

  // 获取主窗口
  private getMainWindow(): BrowserWindow | null {
    const windows = BrowserWindow.getAllWindows();
    return windows.length > 0 ? windows[0] : null;
  }

  // 截图并上传
  private captureAndUpload(): void {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    mainWindow.webContents.send('tray-capture-screenshot');
  }

  // 切换最小化模式
  private toggleMinimizeMode(): void {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    mainWindow.webContents.send('tray-toggle-minimize');
  }

  // 打开设置
  private openSettings(): void {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    mainWindow.webContents.send('tray-open-settings');
  }

  // 显示关于信息
  private showAbout(): void {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    mainWindow.webContents.send('tray-show-about');
  }

  // 更新托盘图标
  public updateIcon(iconType: 'normal' | 'uploading' | 'error' | 'offline'): void {
    if (!this.tray) return;

    let iconName = 'tray-icon.png';
    
    switch (iconType) {
      case 'uploading':
        iconName = 'tray-icon-uploading.png';
        break;
      case 'error':
        iconName = 'tray-icon-error.png';
        break;
      case 'offline':
        iconName = 'tray-icon-offline.png';
        break;
      default:
        iconName = 'tray-icon.png';
    }

    const iconPath = path.join(__dirname, '../../assets/icons', iconName);
    this.tray.setImage(iconPath);
  }

  // 更新托盘提示
  public updateTooltip(text: string): void {
    if (!this.tray) return;
    this.tray.setToolTip(text);
  }

  // 显示托盘通知
  public showNotification(title: string, body: string): void {
    if (!this.tray) return;

    this.tray.displayBalloon({
      title,
      content: body,
      icon: this.getTrayIconPath()
    });
  }

  // 销毁托盘
  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
