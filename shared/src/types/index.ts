// 共享类型定义

// 设备类型
export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile';
  platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios';
  version: string;
  lastSeen: Date;
  isOnline: boolean;
}

// 文件类型
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  hash: string;
  uploadedAt: Date;
  uploadedBy: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

// 传输记录
export interface TransferRecord {
  id: string;
  fileId: string;
  fromDevice: string;
  toDevice: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  speed: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// 用户信息
export interface User {
  id: string;
  devices: Device[];
  createdAt: Date;
  updatedAt: Date;
}

// Socket事件类型
export interface SocketEvents {
  // 认证事件
  authenticate: (data: { token: string }) => void;
  authenticated: (data: { success: boolean; deviceId?: string; error?: string }) => void;

  // 文件传输事件
  'file:upload': (data: { file: Buffer; metadata: FileInfo }) => void;
  'file:progress': (data: { fileId: string; progress: number; speed: number }) => void;
  'file:complete': (data: { fileId: string; downloadUrl: string }) => void;
  'file:error': (data: { fileId: string; error: string }) => void;

  // 设备事件
  'device:connected': (data: { deviceId: string; deviceInfo: Device }) => void;
  'device:disconnected': (data: { deviceId: string }) => void;
  'device:pair': (data: { qrCode: string }) => void;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 文件上传响应
export interface UploadResponse {
  fileId: string;
  downloadUrl: string;
  thumbnailUrl?: string;
}

// 设备配对响应
export interface PairResponse {
  qrCode: string;
  pairCode: string;
  expiresAt: Date;
}
