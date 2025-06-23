import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface DeviceStatusProps {
  isConnected: boolean;
  deviceName?: string;
  deviceCount?: number;
  connectionType?: 'wifi' | 'mobile' | 'bluetooth';
}

export const DeviceStatus: React.FC<DeviceStatusProps> = ({
  isConnected,
  deviceName = 'PC设备',
  deviceCount = 1,
  connectionType = 'wifi',
}) => {
  // 获取连接状态文本
  const getStatusText = () => {
    if (!isConnected) {
      return '设备未连接';
    }
    
    if (deviceCount > 1) {
      return `${deviceCount} 台设备已连接`;
    }
    
    return deviceName;
  };

  // 获取连接状态颜色
  const getStatusColor = () => {
    return isConnected ? '#4CAF50' : '#F44336';
  };

  // 获取连接类型图标
  const getConnectionIcon = () => {
    if (!isConnected) return 'signal-wifi-off';
    
    switch (connectionType) {
      case 'wifi':
        return 'wifi';
      case 'mobile':
        return 'signal-cellular-4-bar';
      case 'bluetooth':
        return 'bluetooth';
      default:
        return 'wifi';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 设备图标 */}
        <View style={styles.iconContainer}>
          <Icon
            name="computer"
            size={12}
            color="#666"
          />
        </View>

        {/* 状态文本 */}
        <Text style={styles.statusText}>
          {getStatusText()}
        </Text>

        {/* 连接类型图标 */}
        <Icon
          name={getConnectionIcon()}
          size={10}
          color={isConnected ? '#666' : '#ccc'}
          style={styles.connectionIcon}
        />

        {/* 状态指示点 */}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor() }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  iconContainer: {
    marginRight: 6,
  },
  statusText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  connectionIcon: {
    marginRight: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'white',
  },
});
