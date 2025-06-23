import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { FloatingWindowModule } from '../../native/FloatingWindowModule';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface FloatingPosition {
  x: number;
  y: number;
}

export interface FloatingWindowManagerProps {
  children: React.ReactNode;
  isMinimized: boolean;
  position: FloatingPosition;
  onPositionChange: (position: FloatingPosition) => void;
  onToggleMinimized: (minimized: boolean) => void;
  onClose: () => void;
}

export const FloatingWindowManager: React.FC<FloatingWindowManagerProps> = ({
  children,
  isMinimized,
  position,
  onPositionChange,
  onToggleMinimized,
  onClose,
}) => {
  // 动画值
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  const scale = useSharedValue(1);

  // 窗口尺寸
  const windowSize = isMinimized 
    ? { width: 80, height: 80 }
    : { width: 320, height: 400 };

  // 更新位置
  useEffect(() => {
    translateX.value = withSpring(position.x);
    translateY.value = withSpring(position.y);
  }, [position]);

  // 贴边吸附
  const snapToEdge = (x: number, y: number) => {
    const snapThreshold = 20;
    const maxX = screenWidth - windowSize.width;
    const maxY = screenHeight - windowSize.height - 100; // 留出状态栏和导航栏空间

    let newX = x;
    let newY = y;

    // 水平贴边
    if (x < snapThreshold) {
      newX = 0;
    } else if (x > maxX - snapThreshold) {
      newX = maxX;
    }

    // 垂直边界限制
    if (y < 50) { // 状态栏下方
      newY = 50;
    } else if (y > maxY) {
      newY = maxY;
    }

    return { x: newX, y: newY };
  };

  // 拖拽手势处理
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
      scale.value = withSpring(0.95);
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      scale.value = withSpring(1);
      
      const finalX = translateX.value;
      const finalY = translateY.value;
      
      // 贴边吸附
      const snappedPosition = snapToEdge(finalX, finalY);
      
      translateX.value = withSpring(snappedPosition.x);
      translateY.value = withSpring(snappedPosition.y);
      
      // 更新位置状态
      runOnJS(onPositionChange)(snappedPosition);
    },
  });

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // 初始化悬浮窗服务
  useEffect(() => {
    const initFloatingWindow = async () => {
      try {
        await FloatingWindowModule.showFloatingWindow();
      } catch (error) {
        console.error('初始化悬浮窗失败:', error);
      }
    };

    initFloatingWindow();

    // 清理
    return () => {
      FloatingWindowModule.hideFloatingWindow();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            styles.floatingWindow,
            {
              width: windowSize.width,
              height: windowSize.height,
            },
            animatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingWindow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
