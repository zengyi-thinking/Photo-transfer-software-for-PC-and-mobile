import { useState, useCallback, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  uploadedAt: Date;
  downloadUrl?: string;
  thumbnailUrl?: string;
  localPath?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  speed: number;
}

export const useFileManager = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // 模拟文件数据（实际应用中应该从服务器获取）
  useEffect(() => {
    // 初始化一些示例文件
    const sampleFiles: FileInfo[] = [
      {
        id: '1',
        name: 'screenshot_001.png',
        size: 1024 * 1024 * 2, // 2MB
        type: 'image',
        mimeType: 'image/png',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前
        downloadUrl: 'https://example.com/files/screenshot_001.png',
        thumbnailUrl: 'https://example.com/thumbs/screenshot_001.png',
      },
      {
        id: '2',
        name: 'document.pdf',
        size: 1024 * 1024 * 5, // 5MB
        type: 'document',
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
        downloadUrl: 'https://example.com/files/document.pdf',
      },
    ];
    
    setFiles(sampleFiles);
  }, []);

  // 上传文件
  const uploadFile = useCallback(async (filePath: string, fileName: string): Promise<FileInfo> => {
    setIsUploading(true);
    
    try {
      // 获取文件信息
      const fileStats = await RNFS.stat(filePath);
      const fileSize = fileStats.size;
      const mimeType = getMimeType(fileName);
      const fileType = getFileType(mimeType);

      // 创建新文件对象
      const newFile: FileInfo = {
        id: Date.now().toString(),
        name: fileName,
        size: fileSize,
        type: fileType,
        mimeType,
        uploadedAt: new Date(),
        localPath: filePath,
      };

      // 模拟上传进度
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress({
          fileId: newFile.id,
          progress,
          speed: 1024 * 1024, // 1MB/s
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 模拟服务器响应
      newFile.downloadUrl = `https://example.com/files/${fileName}`;
      if (fileType === 'image') {
        newFile.thumbnailUrl = `https://example.com/thumbs/${fileName}`;
      }

      // 添加到文件列表
      setFiles(prev => [newFile, ...prev]);
      
      return newFile;
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, []);

  // 删除文件
  const deleteFile = useCallback(async (fileId: string): Promise<void> => {
    try {
      // 从本地列表中移除
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      // 这里应该调用API删除服务器上的文件
      // await api.deleteFile(fileId);
      
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  }, []);

  // 分享文件
  const shareFile = useCallback(async (fileId: string): Promise<void> => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) {
        throw new Error('文件不存在');
      }

      let shareUrl = file.downloadUrl;
      let localPath = file.localPath;

      // 如果没有本地路径，先下载文件
      if (!localPath && shareUrl) {
        const downloadPath = `${RNFS.DocumentDirectoryPath}/${file.name}`;
        await RNFS.downloadFile({
          fromUrl: shareUrl,
          toFile: downloadPath,
        }).promise;
        localPath = downloadPath;
      }

      if (!localPath) {
        throw new Error('无法获取文件路径');
      }

      // 使用系统分享
      const shareOptions = {
        title: '分享文件',
        message: `分享文件: ${file.name}`,
        url: Platform.OS === 'android' ? `file://${localPath}` : localPath,
        type: file.mimeType,
      };

      await Share.open(shareOptions);
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('分享文件失败:', error);
        throw error;
      }
    }
  }, [files]);

  // 从相册选择文件
  const pickFromGallery = useCallback(async (): Promise<FileInfo[]> => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 10,
        quality: 0.8,
      });

      if (result.didCancel || !result.assets) {
        return [];
      }

      const uploadedFiles: FileInfo[] = [];
      
      for (const asset of result.assets) {
        if (asset.uri && asset.fileName) {
          const uploadedFile = await uploadFile(asset.uri, asset.fileName);
          uploadedFiles.push(uploadedFile);
        }
      }

      return uploadedFiles;
    } catch (error) {
      console.error('从相册选择文件失败:', error);
      throw error;
    }
  }, [uploadFile]);

  // 拍照
  const takePhoto = useCallback(async (): Promise<FileInfo | null> => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel || !result.assets || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      if (asset.uri && asset.fileName) {
        return await uploadFile(asset.uri, asset.fileName);
      }

      return null;
    } catch (error) {
      console.error('拍照失败:', error);
      throw error;
    }
  }, [uploadFile]);

  // 选择文档
  const pickDocument = useCallback(async (): Promise<FileInfo[]> => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });

      const uploadedFiles: FileInfo[] = [];
      
      for (const result of results) {
        if (result.uri && result.name) {
          const uploadedFile = await uploadFile(result.uri, result.name);
          uploadedFiles.push(uploadedFile);
        }
      }

      return uploadedFiles;
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        return [];
      }
      console.error('选择文档失败:', error);
      throw error;
    }
  }, [uploadFile]);

  // 获取文件MIME类型
  const getMimeType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      txt: 'text/plain',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  };

  // 获取文件类型
  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return 'document';
    }
    return 'other';
  };

  // 获取文件统计信息
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
    uploadFile,
    deleteFile,
    shareFile,
    pickFromGallery,
    takePhoto,
    pickDocument,
    getFileStats,
  };
};
