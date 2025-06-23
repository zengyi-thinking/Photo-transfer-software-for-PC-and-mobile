import { useState, useCallback, useEffect } from 'react';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface FloatingPosition {
  x: number;
  y: number;
}

export interface FloatingWindowState {
  isFloatingMode: boolean;
  isMinimized: boolean;
  position: FloatingPosition;
  isVisible: boolean;
}

const STORAGE_KEYS = {
  FLOATING_STATE: '@floating_window_state',
  FLOATING_POSITION: '@floating_window_position',
};

const DEFAULT_POSITION: FloatingPosition = {
  x: screenWidth - 100,
  y: screenHeight / 2 - 200,
};

export const useFloatingWindow = () => {
  const [state, setState] = useState<FloatingWindowState>({
    isFloatingMode: false,
    isMinimized: false,
    position: DEFAULT_POSITION,
    isVisible: true,
  });

  // 从存储中恢复状态
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEYS.FLOATING_STATE);
        const savedPosition = await AsyncStorage.getItem(STORAGE_KEYS.FLOATING_POSITION);
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setState(prev => ({
            ...prev,
            isMinimized: parsedState.isMinimized || false,
          }));
        }
        
        if (savedPosition) {
          const parsedPosition = JSON.parse(savedPosition);
          setState(prev => ({
            ...prev,
            position: parsedPosition,
          }));
        }
      } catch (error) {
        console.error('加载悬浮窗状态失败:', error);
      }
    };

    loadState();
  }, []);

  // 保存状态到存储
  const saveState = useCallback(async (newState: Partial<FloatingWindowState>) => {
    try {
      if (newState.isMinimized !== undefined) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.FLOATING_STATE,
          JSON.stringify({ isMinimized: newState.isMinimized })
        );
      }
      
      if (newState.position) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.FLOATING_POSITION,
          JSON.stringify(newState.position)
        );
      }
    } catch (error) {
      console.error('保存悬浮窗状态失败:', error);
    }
  }, []);

  // 切换悬浮窗模式
  const toggleFloatingMode = useCallback((enable: boolean) => {
    setState(prev => ({
      ...prev,
      isFloatingMode: enable,
    }));
  }, []);

  // 切换最小化状态
  const toggleMinimized = useCallback((minimized?: boolean) => {
    setState(prev => {
      const newMinimized = minimized !== undefined ? minimized : !prev.isMinimized;
      saveState({ isMinimized: newMinimized });
      return {
        ...prev,
        isMinimized: newMinimized,
      };
    });
  }, [saveState]);

  // 设置悬浮窗位置
  const setFloatingPosition = useCallback((position: FloatingPosition) => {
    setState(prev => {
      saveState({ position });
      return {
        ...prev,
        position,
      };
    });
  }, [saveState]);

  // 切换可见性
  const toggleVisibility = useCallback((visible?: boolean) => {
    setState(prev => ({
      ...prev,
      isVisible: visible !== undefined ? visible : !prev.isVisible,
    }));
  }, []);

  // 重置位置到默认值
  const resetPosition = useCallback(() => {
    setFloatingPosition(DEFAULT_POSITION);
  }, [setFloatingPosition]);

  // 智能定位 - 避免遮挡重要区域
  const smartPosition = useCallback(() => {
    const padding = 20;
    const windowSize = state.isMinimized 
      ? { width: 80, height: 80 }
      : { width: 320, height: 400 };

    // 计算可用区域
    const availableWidth = screenWidth - windowSize.width - padding * 2;
    const availableHeight = screenHeight - windowSize.height - padding * 2 - 100; // 减去状态栏和导航栏

    // 选择右下角位置，避免遮挡主要内容
    const smartPos: FloatingPosition = {
      x: availableWidth + padding,
      y: availableHeight + padding + 50, // 状态栏偏移
    };

    setFloatingPosition(smartPos);
  }, [state.isMinimized, setFloatingPosition]);

  // 检查位置是否在屏幕边界内
  const isPositionValid = useCallback((position: FloatingPosition): boolean => {
    const windowSize = state.isMinimized 
      ? { width: 80, height: 80 }
      : { width: 320, height: 400 };

    return (
      position.x >= 0 &&
      position.y >= 50 && // 状态栏下方
      position.x + windowSize.width <= screenWidth &&
      position.y + windowSize.height <= screenHeight - 50 // 导航栏上方
    );
  }, [state.isMinimized]);

  // 修正位置到有效范围内
  const correctPosition = useCallback((position: FloatingPosition): FloatingPosition => {
    const windowSize = state.isMinimized 
      ? { width: 80, height: 80 }
      : { width: 320, height: 400 };

    const correctedX = Math.max(0, Math.min(position.x, screenWidth - windowSize.width));
    const correctedY = Math.max(50, Math.min(position.y, screenHeight - windowSize.height - 50));

    return { x: correctedX, y: correctedY };
  }, [state.isMinimized]);

  // 获取当前窗口尺寸
  const getWindowSize = useCallback(() => {
    return state.isMinimized 
      ? { width: 80, height: 80 }
      : { width: 320, height: 400 };
  }, [state.isMinimized]);

  return {
    // 状态
    isFloatingMode: state.isFloatingMode,
    isMinimized: state.isMinimized,
    floatingPosition: state.position,
    isVisible: state.isVisible,
    
    // 操作方法
    toggleFloatingMode,
    toggleMinimized,
    setFloatingPosition,
    toggleVisibility,
    resetPosition,
    smartPosition,
    
    // 工具方法
    isPositionValid,
    correctPosition,
    getWindowSize,
  };
};
