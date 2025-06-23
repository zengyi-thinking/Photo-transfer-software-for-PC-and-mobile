// 文件上传服务
import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosProgressEvent } from 'axios';
import FormData from 'form-data';

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  targetDevice?: string;
  compress?: boolean;
}

export interface DownloadOptions {
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  thumbnailUrl?: string;
}

export class FileUploadService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    this.apiKey = process.env.API_KEY || '';
  }

  // 上传文件
  public async uploadFile(filePath: string, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error('文件不存在');
      }

      // 获取文件信息
      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      const fileSize = stats.size;

      // 创建表单数据
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('fileName', fileName);
      formData.append('fileSize', fileSize.toString());
      
      if (options.targetDevice) {
        formData.append('targetDevice', options.targetDevice);
      }
      
      if (options.compress !== undefined) {
        formData.append('compress', options.compress.toString());
      }

      // 上传文件
      const response = await axios.post(`${this.baseUrl}/api/files/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`,
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (options.onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options.onProgress(progress);
          }
        },
        timeout: 5 * 60 * 1000, // 5分钟超时
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '上传失败');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }

  // 下载文件
  public async downloadFile(url: string, savePath: string, options: DownloadOptions = {}): Promise<void> {
    try {
      const response = await axios.get(url, {
        responseType: 'stream',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          if (options.onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options.onProgress(progress);
          }
        },
        timeout: 5 * 60 * 1000, // 5分钟超时
      });

      // 确保保存目录存在
      const saveDir = path.dirname(savePath);
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

      // 写入文件
      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  }

  // 批量上传文件
  public async uploadFiles(filePaths: string[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: Array<{ filePath: string; error: string }> = [];

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      
      try {
        const result = await this.uploadFile(filePath, {
          ...options,
          onProgress: (progress) => {
            if (options.onProgress) {
              // 计算总体进度
              const totalProgress = ((i * 100) + progress) / filePaths.length;
              options.onProgress(Math.round(totalProgress));
            }
          },
        });
        
        results.push(result);
      } catch (error) {
        errors.push({
          filePath,
          error: error.message,
        });
      }
    }

    if (errors.length > 0) {
      console.warn('部分文件上传失败:', errors);
    }

    return results;
  }

  // 获取文件列表
  public async getFileList(params: {
    page?: number;
    limit?: number;
    type?: string;
    deviceId?: string;
  } = {}): Promise<{
    files: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.deviceId) queryParams.append('deviceId', params.deviceId);

      const response = await axios.get(`${this.baseUrl}/api/files?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '获取文件列表失败');
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      throw error;
    }
  }

  // 删除文件
  public async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await axios.delete(`${this.baseUrl}/api/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || '删除文件失败');
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      throw error;
    }
  }

  // 收藏文件
  public async favoriteFile(fileId: string, isFavorite: boolean): Promise<void> {
    try {
      const response = await axios.put(`${this.baseUrl}/api/files/${fileId}/favorite`, {
        isFavorite,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || '收藏操作失败');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      throw error;
    }
  }

  // 设置API密钥
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  // 设置基础URL
  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  // 检查服务器连接
  public async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('服务器连接检查失败:', error);
      return false;
    }
  }
}
