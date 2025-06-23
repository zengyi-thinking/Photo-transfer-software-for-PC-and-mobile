import { useState, useCallback } from 'react';

export interface WindowState {
  isVisible: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  alwaysOnTop: boolean;
}

const initialState: WindowState = {
  isVisible: true,
  isMinimized: false,
  position: { x: 0, y: 0 },
  size: { width: 280, height: 200 },
  opacity: 0.95,
  alwaysOnTop: true,
};

export const useWindowState = () => {
  const [windowState, setWindowState] = useState<WindowState>(initialState);

  // 切换最小化状态
  const toggleMinimize = useCallback(() => {
    setWindowState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized,
      size: prev.isMinimized 
        ? { width: 280, height: 200 }
        : { width: 60, height: 60 }
    }));
    
    // 通知主进程
    window.electronAPI?.toggleMinimize();
  }, []);

  // 切换可见性
  const toggleVisibility = useCallback(() => {
    setWindowState(prev => ({
      ...prev,
      isVisible: !prev.isVisible
    }));
  }, []);

  // 更新窗口状态
  const updateWindowState = useCallback((newState: Partial<WindowState>) => {
    setWindowState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);

  // 设置透明度
  const setOpacity = useCallback((opacity: number) => {
    setWindowState(prev => ({
      ...prev,
      opacity
    }));
  }, []);

  // 设置位置
  const setPosition = useCallback((position: { x: number; y: number }) => {
    setWindowState(prev => ({
      ...prev,
      position
    }));
  }, []);

  // 设置大小
  const setSize = useCallback((size: { width: number; height: number }) => {
    setWindowState(prev => ({
      ...prev,
      size
    }));
  }, []);

  return {
    windowState,
    toggleMinimize,
    toggleVisibility,
    updateWindowState,
    setOpacity,
    setPosition,
    setSize,
  };
};
