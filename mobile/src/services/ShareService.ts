import { Platform, Alert } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { Linking } from 'react-native';

export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
  type?: string;
  filename?: string;
  excludedActivityTypes?: string[];
}

export interface FileShareData {
  id: string;
  name: string;
  mimeType: string;
  downloadUrl?: string;
  localPath?: string;
  size: number;
}

export class ShareService {
  // 分享文件到其他应用
  static async shareFile(fileData: FileShareData, options: ShareOptions = {}): Promise<boolean> {
    try {
      let shareUrl = fileData.localPath;
      
      // 如果没有本地路径，先下载文件
      if (!shareUrl && fileData.downloadUrl) {
        shareUrl = await this.downloadFileForShare(fileData);
      }
      
      if (!shareUrl) {
        throw new Error('无法获取文件路径');
      }
      
      const shareOptions: any = {
        title: options.title || '分享文件',
        message: options.message || `分享文件: ${fileData.name}`,
        url: Platform.OS === 'android' ? `file://${shareUrl}` : shareUrl,
        type: fileData.mimeType,
        filename: fileData.name,
        ...options,
      };
      
      const result = await Share.open(shareOptions);
      return result.success !== false;
    } catch (error) {
      if (error.message === 'User did not share') {
        return false; // 用户取消分享
      }
      console.error('分享文件失败:', error);
      throw error;
    }
  }
  
  // 分享多个文件
  static async shareMultipleFiles(files: FileShareData[], options: ShareOptions = {}): Promise<boolean> {
    try {
      const urls: string[] = [];
      
      for (const file of files) {
        let shareUrl = file.localPath;
        
        if (!shareUrl && file.downloadUrl) {
          shareUrl = await this.downloadFileForShare(file);
        }
        
        if (shareUrl) {
          urls.push(Platform.OS === 'android' ? `file://${shareUrl}` : shareUrl);
        }
      }
      
      if (urls.length === 0) {
        throw new Error('没有可分享的文件');
      }
      
      const shareOptions: any = {
        title: options.title || '分享文件',
        message: options.message || `分享 ${files.length} 个文件`,
        urls,
        ...options,
      };
      
      const result = await Share.open(shareOptions);
      return result.success !== false;
    } catch (error) {
      if (error.message === 'User did not share') {
        return false;
      }
      console.error('分享多个文件失败:', error);
      throw error;
    }
  }
  
  // 分享到特定应用
  static async shareToApp(fileData: FileShareData, appPackage: string): Promise<boolean> {
    try {
      let shareUrl = fileData.localPath;
      
      if (!shareUrl && fileData.downloadUrl) {
        shareUrl = await this.downloadFileForShare(fileData);
      }
      
      if (!shareUrl) {
        throw new Error('无法获取文件路径');
      }
      
      const shareOptions = {
        title: '分享文件',
        message: `分享文件: ${fileData.name}`,
        url: Platform.OS === 'android' ? `file://${shareUrl}` : shareUrl,
        type: fileData.mimeType,
        social: appPackage as any,
      };
      
      const result = await Share.shareSingle(shareOptions);
      return result.success !== false;
    } catch (error) {
      console.error('分享到指定应用失败:', error);
      throw error;
    }
  }
  
  // 分享文本内容
  static async shareText(text: string, options: ShareOptions = {}): Promise<boolean> {
    try {
      const shareOptions = {
        title: options.title || '分享文本',
        message: text,
        ...options,
      };
      
      const result = await Share.open(shareOptions);
      return result.success !== false;
    } catch (error) {
      if (error.message === 'User did not share') {
        return false;
      }
      console.error('分享文本失败:', error);
      throw error;
    }
  }
  
  // 分享链接
  static async shareUrl(url: string, options: ShareOptions = {}): Promise<boolean> {
    try {
      const shareOptions = {
        title: options.title || '分享链接',
        message: options.message || '查看这个链接',
        url,
        ...options,
      };
      
      const result = await Share.open(shareOptions);
      return result.success !== false;
    } catch (error) {
      if (error.message === 'User did not share') {
        return false;
      }
      console.error('分享链接失败:', error);
      throw error;
    }
  }
  
  // 获取可用的分享应用列表
  static async getAvailableApps(): Promise<any[]> {
    try {
      // 这个功能需要原生模块支持
      // 这里返回常见的应用列表
      const commonApps = [
        {
          name: '微信',
          package: 'com.tencent.mm',
          icon: 'wechat',
        },
        {
          name: 'QQ',
          package: 'com.tencent.mobileqq',
          icon: 'qq',
        },
        {
          name: '钉钉',
          package: 'com.alibaba.android.rimet',
          icon: 'dingtalk',
        },
        {
          name: '邮件',
          package: 'com.android.email',
          icon: 'email',
        },
        {
          name: '蓝牙',
          package: 'bluetooth',
          icon: 'bluetooth',
        },
      ];
      
      return commonApps;
    } catch (error) {
      console.error('获取可用应用失败:', error);
      return [];
    }
  }
  
  // 下载文件用于分享
  private static async downloadFileForShare(fileData: FileShareData): Promise<string> {
    if (!fileData.downloadUrl) {
      throw new Error('没有下载链接');
    }
    
    const downloadPath = `${RNFS.DocumentDirectoryPath}/share/${fileData.name}`;
    const downloadDir = `${RNFS.DocumentDirectoryPath}/share`;
    
    try {
      // 确保目录存在
      if (!(await RNFS.exists(downloadDir))) {
        await RNFS.mkdir(downloadDir);
      }
      
      // 下载文件
      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileData.downloadUrl,
        toFile: downloadPath,
        progressDivider: 10,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`下载进度: ${progress.toFixed(2)}%`);
        },
      }).promise;
      
      if (downloadResult.statusCode === 200) {
        return downloadPath;
      } else {
        throw new Error(`下载失败，状态码: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      console.error('下载文件失败:', error);
      throw error;
    }
  }
  
  // 清理分享缓存
  static async cleanupShareCache(): Promise<void> {
    try {
      const shareDir = `${RNFS.DocumentDirectoryPath}/share`;
      
      if (await RNFS.exists(shareDir)) {
        const files = await RNFS.readDir(shareDir);
        const now = Date.now();
        
        for (const file of files) {
          // 删除超过24小时的文件
          if (now - file.mtime.getTime() > 24 * 60 * 60 * 1000) {
            await RNFS.unlink(file.path);
          }
        }
      }
    } catch (error) {
      console.error('清理分享缓存失败:', error);
    }
  }
  
  // 检查应用是否已安装
  static async isAppInstalled(packageName: string): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android检查应用是否安装
        const url = `package:${packageName}`;
        return await Linking.canOpenURL(url);
      } else {
        // iOS检查URL Scheme
        return await Linking.canOpenURL(packageName);
      }
    } catch (error) {
      console.error('检查应用安装状态失败:', error);
      return false;
    }
  }
}
