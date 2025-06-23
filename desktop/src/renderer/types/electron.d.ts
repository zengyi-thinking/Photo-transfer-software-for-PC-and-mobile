// Electron API 类型定义

export interface ElectronAPI {
  // 窗口管理
  toggleMinimize: () => void;
  hideWindow: () => void;
  showWindow: () => void;
  openSettings: () => void;
  
  // 文件操作
  uploadFiles: (filePaths: string[]) => Promise<any>;
  deleteFile: (fileId: string) => Promise<void>;
  favoriteFile: (fileId: string, isFavorite: boolean) => Promise<void>;
  getFileList: () => Promise<any>;
  startFileDrag: (fileInfo: any) => Promise<void>;
  
  // 事件监听
  onWindowStateChanged: (callback: (state: any) => void) => void;
  onScreenshotCaptured: (callback: (screenshotPath: string) => void) => void;
  onUploadStarted: (callback: (data: { count: number }) => void) => void;
  onUploadProgress: (callback: (progress: any) => void) => void;
  onFileUploaded: (callback: (fileInfo: any) => void) => void;
  onUploadCompleted: (callback: (files: any[]) => void) => void;
  onUploadError: (callback: (error: any) => void) => void;
  onTrayToggleMinimize: (callback: () => void) => void;
  onTrayCapture: (callback: () => void) => void;
  
  // 拖拽处理
  handleFileDrop: (filePaths: string[]) => void;
  cancelAutoHide: () => void;
  startAutoHide: () => void;
  
  // 清理
  removeAllListeners: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
