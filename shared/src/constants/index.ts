// 应用常量
export const APP_NAME = 'File Transfer';
export const APP_VERSION = '1.0.0';

// 文件相关常量
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// 设备类型
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
}

// 平台类型
export enum Platform {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  ANDROID = 'android',
  IOS = 'ios',
}

// 传输状态
export enum TransferStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Socket事件名称
export const SOCKET_EVENTS = {
  // 认证事件
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  
  // 设备事件
  DEVICE_ONLINE: 'device:online',
  DEVICE_OFFLINE: 'device:offline',
  DEVICE_PAIR_REQUEST: 'device:pair:request',
  DEVICE_PAIR_RESPONSE: 'device:pair:response',
  DEVICE_PAIR_RESULT: 'device:pair:result',
  
  // 文件传输事件
  FILE_TRANSFER_START: 'file:transfer:start',
  FILE_TRANSFER_STARTED: 'file:transfer:started',
  FILE_TRANSFER_PROGRESS: 'file:transfer:progress',
  FILE_TRANSFER_COMPLETED: 'file:transfer:completed',
  FILE_TRANSFER_FAILED: 'file:transfer:failed',
  FILE_RECEIVED: 'file:received',
  
  // P2P连接事件
  P2P_CONNECT_REQUEST: 'p2p:connect:request',
  P2P_CONNECT_OFFER: 'p2p:connect:offer',
  P2P_CONNECT_ANSWER: 'p2p:connect:answer',
  P2P_ICE_CANDIDATE: 'p2p:ice:candidate',
  P2P_CONNECTED: 'p2p:connected',
  P2P_DISCONNECTED: 'p2p:disconnected',
} as const;

// API端点
export const API_ENDPOINTS = {
  // 认证
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_QRCODE: '/api/auth/qrcode',
  AUTH_PAIR: '/api/auth/pair',
  
  // 文件
  FILES_UPLOAD: '/api/files/upload',
  FILES_LIST: '/api/files',
  FILES_DETAIL: '/api/files/:id',
  FILES_DOWNLOAD: '/api/files/:id/download',
  FILES_DELETE: '/api/files/:id',
  FILES_FAVORITE: '/api/files/:id/favorite',
  
  // 设备
  DEVICES_LIST: '/api/devices',
  DEVICES_DETAIL: '/api/devices/:id',
  DEVICES_UPDATE: '/api/devices/:id',
  DEVICES_DELETE: '/api/devices/:id',
  
  // 传输
  TRANSFERS_LIST: '/api/transfers',
  TRANSFERS_CREATE: '/api/transfers',
  TRANSFERS_DETAIL: '/api/transfers/:id',
} as const;

// 错误代码
export const ERROR_CODES = {
  // 认证错误
  AUTH_INVALID_TOKEN: 'AUTH_001',
  AUTH_DEVICE_NOT_REGISTERED: 'AUTH_002',
  AUTH_DEVICE_DISABLED: 'AUTH_003',
  AUTH_INVALID_PAIR_CODE: 'AUTH_004',
  
  // 文件错误
  FILE_NOT_FOUND: 'FILE_001',
  FILE_SIZE_EXCEEDED: 'FILE_002',
  FILE_TYPE_NOT_SUPPORTED: 'FILE_003',
  FILE_STORAGE_FULL: 'FILE_004',
  FILE_UPLOAD_FAILED: 'FILE_005',
  
  // 传输错误
  TRANSFER_DEVICE_OFFLINE: 'TRANSFER_001',
  TRANSFER_NOT_FOUND: 'TRANSFER_002',
  TRANSFER_NETWORK_ERROR: 'TRANSFER_003',
  TRANSFER_TIMEOUT: 'TRANSFER_004',
  
  // 设备错误
  DEVICE_NOT_FOUND: 'DEVICE_001',
  DEVICE_NOT_PAIRED: 'DEVICE_002',
  DEVICE_PAIR_FAILED: 'DEVICE_003',
  DEVICE_LIMIT_EXCEEDED: 'DEVICE_004',
} as const;
