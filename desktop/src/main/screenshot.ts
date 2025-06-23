// 截图功能管理器
import { screen, desktopCapturer, nativeImage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface ScreenshotOptions {
  format?: 'png' | 'jpg';
  quality?: number;
  fullScreen?: boolean;
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class ScreenshotManager {
  private screenshotDir: string;

  constructor() {
    this.screenshotDir = path.join(process.cwd(), 'screenshots');
    this.ensureScreenshotDir();
  }

  // 确保截图目录存在
  private ensureScreenshotDir(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  // 截取全屏
  public async captureScreen(options: ScreenshotOptions = {}): Promise<string> {
    try {
      const {
        format = 'png',
        quality = 90,
        fullScreen = true,
        region
      } = options;

      // 获取屏幕源
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: 1920,
          height: 1080
        }
      });

      if (sources.length === 0) {
        throw new Error('无法获取屏幕源');
      }

      // 使用主屏幕
      const primarySource = sources[0];
      let screenshot = primarySource.thumbnail;

      // 如果指定了区域，裁剪图片
      if (region && !fullScreen) {
        screenshot = this.cropImage(screenshot, region);
      }

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `screenshot_${timestamp}.${format}`;
      const filePath = path.join(this.screenshotDir, fileName);

      // 保存截图
      const buffer = format === 'png' 
        ? screenshot.toPNG()
        : screenshot.toJPEG(quality);

      fs.writeFileSync(filePath, buffer);

      return filePath;
    } catch (error) {
      console.error('截图失败:', error);
      throw error;
    }
  }

  // 截取指定区域
  public async captureRegion(region: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Promise<string> {
    return this.captureScreen({
      fullScreen: false,
      region
    });
  }

  // 截取当前活动窗口
  public async captureActiveWindow(): Promise<string> {
    try {
      // 获取窗口源
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: {
          width: 1920,
          height: 1080
        }
      });

      if (sources.length === 0) {
        throw new Error('无法获取窗口源');
      }

      // 查找活动窗口（这里简化处理，使用第一个窗口）
      const activeWindow = sources[0];
      const screenshot = activeWindow.thumbnail;

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `window_${timestamp}.png`;
      const filePath = path.join(this.screenshotDir, fileName);

      // 保存截图
      const buffer = screenshot.toPNG();
      fs.writeFileSync(filePath, buffer);

      return filePath;
    } catch (error) {
      console.error('窗口截图失败:', error);
      throw error;
    }
  }

  // 裁剪图片
  private cropImage(image: Electron.NativeImage, region: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Electron.NativeImage {
    try {
      return image.crop(region);
    } catch (error) {
      console.error('图片裁剪失败:', error);
      return image;
    }
  }

  // 获取屏幕信息
  public getScreenInfo() {
    const displays = screen.getAllDisplays();
    return displays.map(display => ({
      id: display.id,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
      isPrimary: display === screen.getPrimaryDisplay()
    }));
  }

  // 清理旧截图
  public cleanupOldScreenshots(maxAge: number = 24 * 60 * 60 * 1000): void {
    try {
      if (!fs.existsSync(this.screenshotDir)) {
        return;
      }

      const files = fs.readdirSync(this.screenshotDir);
      const now = Date.now();

      files.forEach(file => {
        const filePath = path.join(this.screenshotDir, file);
        const stats = fs.statSync(filePath);
        
        // 删除超过指定时间的截图
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('清理截图失败:', error);
    }
  }

  // 获取截图历史
  public getScreenshotHistory(): Array<{
    fileName: string;
    filePath: string;
    size: number;
    createdAt: Date;
  }> {
    try {
      if (!fs.existsSync(this.screenshotDir)) {
        return [];
      }

      const files = fs.readdirSync(this.screenshotDir);
      
      return files
        .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
        .map(file => {
          const filePath = path.join(this.screenshotDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            fileName: file,
            filePath,
            size: stats.size,
            createdAt: stats.birthtime
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('获取截图历史失败:', error);
      return [];
    }
  }

  // 销毁管理器
  public destroy(): void {
    // 清理超过1小时的截图
    this.cleanupOldScreenshots(60 * 60 * 1000);
  }
}
