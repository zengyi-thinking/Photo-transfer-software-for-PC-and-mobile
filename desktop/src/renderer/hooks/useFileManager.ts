import { useState, useCallback, useEffect } from 'react';

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

export interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
}

export const useFileManager = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // 监听文件上传事件
  useEffect(() => {
    // 监听上传开始
    window.electronAPI?.onUploadStarted((data: { count: number }) => {
      setIsUploading(true);
      setUploadProgress(null);
    });

    // 监听上传进度
    window.electronAPI?.onUploadProgress((progress: UploadProgress) => {
      setUploadProgress(progress);
    });

    // 监听文件上传完成
    window.electronAPI?.onFileUploaded((fileInfo: FileInfo) => {
      setFiles(prev => [fileInfo, ...prev]);
    });

    // 监听上传完成
    window.electronAPI?.onUploadCompleted((uploadedFiles: FileInfo[]) => {
      setIsUploading(false);
      setUploadProgress(null);
    });

    // 监听上传错误
    window.electronAPI?.onUploadError((error: { fileName?: string; error: string }) => {
      console.error('上传错误:', error);
      setIsUploading(false);
      setUploadProgress(null);
    });

    return () => {
      // 清理事件监听器
      window.electronAPI?.removeAllListeners();
    };
  }, []);

  // 上传文件
  const uploadFiles = useCallback(async (filePaths: string[]) => {
    try {
      await window.electronAPI?.uploadFiles(filePaths);
    } catch (error) {
      console.error('上传文件失败:', error);
    }
  }, []);

  // 删除文件
  const deleteFile = useCallback(async (fileId: string) => {
    try {
      // 从本地状态中移除
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      // 通知主进程删除文件
      await window.electronAPI?.deleteFile(fileId);
    } catch (error) {
      console.error('删除文件失败:', error);
      // 如果删除失败，恢复文件列表
      // 这里可以重新获取文件列表
    }
  }, []);

  // 开始文件拖拽
  const startFileDrag = useCallback(async (fileInfo: FileInfo) => {
    try {
      await window.electronAPI?.startFileDrag(fileInfo);
    } catch (error) {
      console.error('开始文件拖拽失败:', error);
    }
  }, []);

  // 收藏文件
  const favoriteFile = useCallback(async (fileId: string, isFavorite: boolean) => {
    try {
      // 更新本地状态
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, isFavorite }
          : file
      ));
      
      // 通知主进程
      await window.electronAPI?.favoriteFile(fileId, isFavorite);
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  }, []);

  // 获取文件列表
  const refreshFiles = useCallback(async () => {
    try {
      const fileList = await window.electronAPI?.getFileList();
      if (fileList) {
        setFiles(fileList.files);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  }, []);

  // 清空文件列表
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  // 获取文件统计
  const getFileStats = useCallback(() => {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const typeStats = files.reduce((stats, file) => {
      stats[file.type] = (stats[file.type] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    return {
      totalCount: files.length,
      totalSize,
      typeStats,
    };
  }, [files]);

  return {
    files,
    isUploading,
    uploadProgress,
    uploadFiles,
    deleteFile,
    startFileDrag,
    favoriteFile,
    refreshFiles,
    clearFiles,
    getFileStats,
  };
};
