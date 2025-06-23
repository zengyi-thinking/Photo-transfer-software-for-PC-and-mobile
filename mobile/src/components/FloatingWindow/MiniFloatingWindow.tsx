import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export interface MiniFloatingWindowProps {
  fileCount: number;
  isConnected: boolean;
  onExpand: () => void;
  hasNewFile?: boolean;
}

export const MiniFloatingWindow: React.FC<MiniFloatingWindowProps> = ({
  fileCount,
  isConnected,
  onExpand,
  hasNewFile = false,
}) => {
  // 动画值
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // 新文件提示动画
  useEffect(() => {
    if (hasNewFile) {
      // 脉冲动画
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        3,
        false
      );
      
      // 发光效果
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        3,
        false
      );
    }
  }, [hasNewFile]);

  // 脉冲动画样式
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  // 发光动画样式
  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  // 获取文件数量显示文本
  const getFileCountText = () => {
    if (fileCount === 0) return '';
    if (fileCount > 99) return '99+';
    return fileCount.toString();
  };

  // 获取连接状态颜色
  const getStatusColor = () => {
    return isConnected ? '#4CAF50' : '#F44336';
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onExpand}
      activeOpacity={0.8}
    >
      {/* 发光效果 */}
      <Animated.View style={[styles.glowEffect, glowStyle]} />
      
      {/* 主体容器 */}
      <Animated.View style={[styles.content, pulseStyle]}>
        {/* 文件夹图标 */}
        <View style={styles.iconContainer}>
          <Icon 
            name="folder" 
            size={28} 
            color="#2196F3" 
          />
          
          {/* 文件数量徽章 */}
          {fileCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {getFileCountText()}
              </Text>
            </View>
          )}
        </View>

        {/* 连接状态指示器 */}
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />

        {/* 新文件指示器 */}
        {hasNewFile && (
          <View style={styles.newFileIndicator}>
            <Icon name="fiber-new" size={12} color="#FF5722" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 50,
    backgroundColor: '#2196F3',
    opacity: 0,
  },
  content: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 40,
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  newFileIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
