// 跨应用拖拽处理器
import { ipcMain, clipboard, nativeImage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { shell } from 'electron';

export interface DragDropData {
  type: 'file' | 'text' | 'image';
  data: string | Buffer;
  mimeType: string;
  fileName?: string;
  fileSize?: number;
}

export class DragDropHandler {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'drag');
    this.ensureTempDir();
    this.setupIpcHandlers();
  }

  // 确保临时目录存在
  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // 设置IPC处理器
  private setupIpcHandlers(): void {
    // 处理文件拖拽开始
    ipcMain.handle('drag-start', async (event, fileInfo) => {
      return await this.prepareDragData(fileInfo);
    });

    // 处理拖拽到外部应用
    ipcMain.handle('drag-to-external', async (event, dragData) => {
      return await this.handleExternalDrag(dragData);
    });

    // 清理临时文件
    ipcMain.handle('cleanup-drag-temp', async () => {
      this.cleanupTempFiles();
    });
  }

  // 准备拖拽数据
  private async prepareDragData(fileInfo: any): Promise<DragDropData> {
    try {
      const { id, name, downloadUrl, localPath, type, mimeType } = fileInfo;

      // 如果有本地路径，直接使用
      if (localPath && fs.existsSync(localPath)) {
        return {
          type: 'file',
          data: localPath,
          mimeType,
          fileName: name,
          fileSize: fs.statSync(localPath).size,
        };
      }

      // 如果有下载URL，先下载到临时目录
      if (downloadUrl) {
        const tempFilePath = await this.downloadToTemp(downloadUrl, name);
        return {
          type: 'file',
          data: tempFilePath,
          mimeType,
          fileName: name,
          fileSize: fs.statSync(tempFilePath).size,
        };
      }

      throw new Error('无法获取文件数据');
    } catch (error) {
      console.error('准备拖拽数据失败:', error);
      throw error;
    }
  }

  // 下载文件到临时目录
  private async downloadToTemp(url: string, fileName: string): Promise<string> {
    const tempFilePath = path.join(this.tempDir, fileName);
    
    try {
      // 这里应该使用实际的下载逻辑
      // 暂时使用模拟实现
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(tempFilePath, Buffer.from(buffer));
      
      return tempFilePath;
    } catch (error) {
      console.error('下载文件到临时目录失败:', error);
      throw error;
    }
  }

  // 处理拖拽到外部应用
  private async handleExternalDrag(dragData: DragDropData): Promise<boolean> {
    try {
      switch (dragData.type) {
        case 'file':
          return await this.handleFileDrag(dragData);
        case 'text':
          return await this.handleTextDrag(dragData);
        case 'image':
          return await this.handleImageDrag(dragData);
        default:
          return false;
      }
    } catch (error) {
      console.error('处理外部拖拽失败:', error);
      return false;
    }
  }

  // 处理文件拖拽
  private async handleFileDrag(dragData: DragDropData): Promise<boolean> {
    try {
      const filePath = dragData.data as string;
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return false;
      }

      // 设置系统剪贴板，支持拖拽到其他应用
      const fileList = [filePath];
      
      // 创建文件URI列表
      const uriList = fileList.map(file => `file://${file}`).join('\n');
      
      // 设置剪贴板数据
      clipboard.writeText(uriList);
      
      // 也可以设置为文件路径格式
      clipboard.write({
        text: filePath,
        html: `<a href="file://${filePath}">${dragData.fileName}</a>`,
      });

      return true;
    } catch (error) {
      console.error('处理文件拖拽失败:', error);
      return false;
    }
  }

  // 处理文本拖拽
  private async handleTextDrag(dragData: DragDropData): Promise<boolean> {
    try {
      const text = dragData.data as string;
      clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('处理文本拖拽失败:', error);
      return false;
    }
  }

  // 处理图片拖拽
  private async handleImageDrag(dragData: DragDropData): Promise<boolean> {
    try {
      if (typeof dragData.data === 'string') {
        // 如果是文件路径
        const image = nativeImage.createFromPath(dragData.data);
        clipboard.writeImage(image);
      } else {
        // 如果是Buffer数据
        const image = nativeImage.createFromBuffer(dragData.data as Buffer);
        clipboard.writeImage(image);
      }
      return true;
    } catch (error) {
      console.error('处理图片拖拽失败:', error);
      return false;
    }
  }

  // 创建拖拽预览
  public createDragPreview(fileInfo: any): string {
    const { name, type, size } = fileInfo;
    
    // 创建HTML预览
    const preview = `
      <div style="
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 12px;
        color: #333;
        border: 1px solid rgba(0, 0, 0, 0.1);
      ">
        <div style="
          width: 16px;
          height: 16px;
          margin-right: 8px;
          background: #2196F3;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
        ">
          ${this.getFileTypeIcon(type)}
        </div>
        <div>
          <div style="font-weight: 500; margin-bottom: 2px;">${name}</div>
          <div style="font-size: 10px; color: #666;">${this.formatFileSize(size)}</div>
        </div>
      </div>
    `;
    
    return preview;
  }

  // 获取文件类型图标
  private getFileTypeIcon(type: string): string {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📁';
    }
  }

  // 格式化文件大小
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // 清理临时文件
  private cleanupTempFiles(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        const now = Date.now();
        
        files.forEach(file => {
          const filePath = path.join(this.tempDir, file);
          const stats = fs.statSync(filePath);
          
          // 删除超过1小时的临时文件
          if (now - stats.mtime.getTime() > 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
          }
        });
      }
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }

  // 销毁处理器
  public destroy(): void {
    this.cleanupTempFiles();
    
    // 移除IPC处理器
    ipcMain.removeHandler('drag-start');
    ipcMain.removeHandler('drag-to-external');
    ipcMain.removeHandler('cleanup-drag-temp');
  }
}
