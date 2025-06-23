import { NativeModules, Platform } from 'react-native';

export interface FloatingWindowPosition {
  x: number;
  y: number;
}

export interface FloatingWindowConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  isMinimized: boolean;
}

interface FloatingWindowModuleInterface {
  // 显示悬浮窗
  showFloatingWindow(): Promise<boolean>;
  
  // 隐藏悬浮窗
  hideFloatingWindow(): Promise<boolean>;
  
  // 更新悬浮窗配置
  updateFloatingWindow(config: FloatingWindowConfig): Promise<boolean>;
  
  // 检查悬浮窗权限
  checkOverlayPermission(): Promise<boolean>;
  
  // 请求悬浮窗权限
  requestOverlayPermission(): Promise<boolean>;
  
  // 设置悬浮窗位置
  setPosition(position: FloatingWindowPosition): Promise<boolean>;
  
  // 获取悬浮窗位置
  getPosition(): Promise<FloatingWindowPosition>;
  
  // 设置悬浮窗可见性
  setVisibility(visible: boolean): Promise<boolean>;
  
  // 检查悬浮窗是否显示
  isShowing(): Promise<boolean>;
}

// 获取原生模块
const FloatingWindowNative = NativeModules.FloatingWindowModule as FloatingWindowModuleInterface;

// 封装的悬浮窗模块
export const FloatingWindowModule = {
  // 显示悬浮窗
  async showFloatingWindow(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('悬浮窗功能仅支持Android平台');
      return false;
    }
    
    try {
      return await FloatingWindowNative.showFloatingWindow();
    } catch (error) {
      console.error('显示悬浮窗失败:', error);
      return false;
    }
  },

  // 隐藏悬浮窗
  async hideFloatingWindow(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    
    try {
      return await FloatingWindowNative.hideFloatingWindow();
    } catch (error) {
      console.error('隐藏悬浮窗失败:', error);
      return false;
    }
  },

  // 更新悬浮窗配置
  async updateFloatingWindow(config: FloatingWindowConfig): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    
    try {
      return await FloatingWindowNative.updateFloatingWindow(config);
    } catch (error) {
      console.error('更新悬浮窗配置失败:', error);
      return false;
    }
  },

  // 检查悬浮窗权限
  async checkOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS默认返回true
    }
    
    try {
      return await FloatingWindowNative.checkOverlayPermission();
    } catch (error) {
      console.error('检查悬浮窗权限失败:', error);
      return false;
    }
  },

  // 请求悬浮窗权限
  async requestOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }
    
    try {
      return await FloatingWindowNative.requestOverlayPermission();
    } catch (error) {
      console.error('请求悬浮窗权限失败:', error);
      return false;
    }
  },

  // 设置悬浮窗位置
  async setPosition(position: FloatingWindowPosition): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    
    try {
      return await FloatingWindowNative.setPosition(position);
    } catch (error) {
      console.error('设置悬浮窗位置失败:', error);
      return false;
    }
  },

  // 获取悬浮窗位置
  async getPosition(): Promise<FloatingWindowPosition> {
    if (Platform.OS !== 'android') {
      return { x: 0, y: 0 };
    }
    
    try {
      return await FloatingWindowNative.getPosition();
    } catch (error) {
      console.error('获取悬浮窗位置失败:', error);
      return { x: 0, y: 0 };
    }
  },

  // 设置悬浮窗可见性
  async setVisibility(visible: boolean): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    
    try {
      return await FloatingWindowNative.setVisibility(visible);
    } catch (error) {
      console.error('设置悬浮窗可见性失败:', error);
      return false;
    }
  },

  // 检查悬浮窗是否显示
  async isShowing(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    
    try {
      return await FloatingWindowNative.isShowing();
    } catch (error) {
      console.error('检查悬浮窗状态失败:', error);
      return false;
    }
  },
};
