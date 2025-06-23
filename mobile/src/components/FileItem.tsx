import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

export interface FileItemProps {
  file: FileInfo;
  isSelected?: boolean;
  onSelect?: () => void;
  onShare: () => void;
  onDelete: () => void;
  compact?: boolean;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  isSelected = false,
  onSelect,
  onShare,
  onDelete,
  compact = false,
}) => {
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 获取文件图标
  const getFileIcon = () => {
    switch (file.type) {
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'audio':
        return 'audiotrack';
      case 'document':
        return 'description';
      default:
        return 'insert-drive-file';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        compact && styles.compactContainer,
        isSelected && styles.selectedContainer,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* 文件图标或缩略图 */}
        <View style={[styles.iconContainer, compact && styles.compactIcon]}>
          {file.thumbnailUrl ? (
            <Image
              source={{ uri: file.thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <Icon
              name={getFileIcon()}
              size={compact ? 16 : 20}
              color="#666"
            />
          )}
        </View>

        {/* 文件信息 */}
        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, compact && styles.compactFileName]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {file.name}
          </Text>
          <Text style={[styles.fileDetails, compact && styles.compactFileDetails]}>
            {formatFileSize(file.size)} • {formatTime(file.uploadedAt)}
          </Text>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, compact && styles.compactActionButton]}
            onPress={onShare}
          >
            <Icon
              name="share"
              size={compact ? 14 : 16}
              color="#2196F3"
            />
          </TouchableOpacity>
          
          {!compact && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
            >
              <Icon
                name="delete"
                size={16}
                color="#F44336"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 选中指示器 */}
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Icon name="check-circle" size={16} color="#2196F3" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  compactContainer: {
    borderRadius: 6,
    marginBottom: 3,
  },
  selectedContainer: {
    borderColor: '#2196F3',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  compactIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  fileInfo: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  compactFileName: {
    fontSize: 11,
    marginBottom: 1,
  },
  fileDetails: {
    fontSize: 10,
    color: '#999',
  },
  compactFileDetails: {
    fontSize: 9,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactActionButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
