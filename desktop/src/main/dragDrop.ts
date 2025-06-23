// 拖拽功能管理器
import { BrowserWindow, dialog, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { FileUploadService } from '../services/fileUpload';

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

export class DragDropManager {
  private window: BrowserWindow;
  private fileUploadService: FileUploadService;
  private tempDir: string;

  constructor(window: BrowserWindow) {
    this.window = window;
    this.fileUploadService = new FileUploadService();
    this.tempDir = path.join(process.cwd(), 'temp');
    
    this.ensureTempDir();
    this.setupDragDropHandlers();
  }

  // 确保临时目录存在
  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // 设置拖拽处理器
  private setupDragDropHandlers(): void {
    // 监听渲染进程的拖拽事件
    this.window.webContents.on('dom-ready', () => {
      this.window.webContents.executeJavaScript(`
        // 拖拽进入
        document.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          document.body.classList.add('drag-over');
        });

        // 拖拽离开
        document.addEventListener('dragleave', (e) => {
          if (!e.relatedTarget || !document.contains(e.relatedTarget)) {
            document.body.classList.remove('drag-over');
          }
        });

        // 文件放置
        document.addEventListener('drop', async (e) => {
          e.preventDefault();
          document.body.classList.remove('drag-over');
          
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            const filePaths = files.map(file => file.path);
            window.electronAPI?.handleFileDrop(filePaths);
          }
        });
      `);
    });
  }

  // 处理文件上传
  public async handleFileUpload(filePaths: string[]): Promise<FileInfo[]> {
    const uploadedFiles: FileInfo[] = [];

    try {
      // 显示上传进度
      this.window.webContents.send('upload-started', { count: filePaths.length });

      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        
        try {
          // 获取文件信息
          const stats = fs.statSync(filePath);
          const fileName = path.basename(filePath);
          const fileSize = stats.size;
          const fileType = this.getFileType(fileName);

          // 检查文件大小限制
          if (fileSize > 100 * 1024 * 1024) { // 100MB限制
            throw new Error(`文件 ${fileName} 超过大小限制 (100MB)`);
          }

          // 上传文件
          const uploadResult = await this.fileUploadService.uploadFile(filePath, {
            onProgress: (progress) => {
              this.window.webContents.send('upload-progress', {
                fileIndex: i,
                fileName,
                progress,
              });
            },
          });

          const fileInfo: FileInfo = {
            id: uploadResult.fileId,
            name: fileName,
            size: fileSize,
            type: fileType,
            path: filePath,
            downloadUrl: uploadResult.downloadUrl,
            thumbnailUrl: uploadResult.thumbnailUrl,
          };

          uploadedFiles.push(fileInfo);

          // 通知上传完成
          this.window.webContents.send('file-uploaded', fileInfo);

        } catch (error) {
          console.error(`文件上传失败: ${filePath}`, error);
          this.window.webContents.send('upload-error', {
            fileName: path.basename(filePath),
            error: error.message,
          });
        }
      }

      // 所有文件上传完成
      this.window.webContents.send('upload-completed', uploadedFiles);

    } catch (error) {
      console.error('批量上传失败:', error);
      this.window.webContents.send('upload-error', {
        error: error.message,
      });
    }

    return uploadedFiles;
  }

  // 开始文件拖拽（拖出）
  public async startFileDrag(fileInfo: FileInfo): Promise<string> {
    try {
      // 如果文件在本地，直接返回路径
      if (fileInfo.path && fs.existsSync(fileInfo.path)) {
        return fileInfo.path;
      }

      // 如果文件在云端，先下载到临时目录
      if (fileInfo.downloadUrl) {
        const tempFilePath = await this.downloadToTemp(fileInfo);
        return tempFilePath;
      }

      throw new Error('文件不可用');
    } catch (error) {
      console.error('准备拖拽文件失败:', error);
      throw error;
    }
  }

  // 下载文件到临时目录
  private async downloadToTemp(fileInfo: FileInfo): Promise<string> {
    const tempFilePath = path.join(this.tempDir, fileInfo.name);
    
    try {
      // 使用文件上传服务下载文件
      await this.fileUploadService.downloadFile(fileInfo.downloadUrl!, tempFilePath, {
        onProgress: (progress) => {
          this.window.webContents.send('download-progress', {
            fileId: fileInfo.id,
            fileName: fileInfo.name,
            progress,
          });
        },
      });

      return tempFilePath;
    } catch (error) {
      console.error('下载文件到临时目录失败:', error);
      throw error;
    }
  }

  // 获取文件类型
  private getFileType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const videoExts = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
    const audioExts = ['.mp3', '.wav', '.flac', '.aac', '.ogg'];
    const documentExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
    const archiveExts = ['.zip', '.rar', '.7z', '.tar', '.gz'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (documentExts.includes(ext)) return 'document';
    if (archiveExts.includes(ext)) return 'archive';
    
    return 'other';
  }

  // 创建拖拽数据
  public createDragData(fileInfo: FileInfo): any {
    return {
      type: 'file',
      mimeType: this.getMimeType(fileInfo.name),
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      fileId: fileInfo.id,
    };
  }

  // 获取MIME类型
  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  // 清理临时文件
  public cleanupTempFiles(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        files.forEach(file => {
          const filePath = path.join(this.tempDir, file);
          const stats = fs.statSync(filePath);
          
          // 删除超过1小时的临时文件
          if (Date.now() - stats.mtime.getTime() > 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
          }
        });
      }
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }

  // 销毁管理器
  public destroy(): void {
    this.cleanupTempFiles();
  }
}
