import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FileItem } from '../FileItem';
import { DeviceStatus } from '../DeviceStatus';

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

export interface FloatingWindowProps {
  files: FileInfo[];
  onFileShare: (fileId: string) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
  onMinimize: () => void;
  onClose: () => void;
  isConnected: boolean;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  files,
  onFileShare,
  onFileDelete,
  onMinimize,
  onClose,
  isConnected,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // 处理文件选择
  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 处理文件分享
  const handleFileShare = async (fileId: string) => {
    try {
      await onFileShare(fileId);
    } catch (error) {
      Alert.alert('分享失败', '文件分享时出现错误，请重试。');
    }
  };

  // 处理文件删除
  const handleFileDelete = async (fileId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个文件吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await onFileDelete(fileId);
            } catch (error) {
              Alert.alert('删除失败', '文件删除时出现错误，请重试。');
            }
          }
        }
      ]
    );
  };

  // 批量分享
  const handleBatchShare = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      for (const fileId of selectedFiles) {
        await onFileShare(fileId);
      }
      setSelectedFiles([]);
    } catch (error) {
      Alert.alert('批量分享失败', '部分文件分享时出现错误。');
    }
  };

  return (
    <View style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="folder" size={16} color="#666" />
          <Text style={styles.title}>文件传输</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={onMinimize}
          >
            <Icon name="remove" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={onClose}
          >
            <Icon name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 设备状态 */}
      <DeviceStatus isConnected={isConnected} />

      {/* 文件列表 */}
      <View style={styles.content}>
        {files.length > 0 ? (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                最近文件 ({files.length})
              </Text>
              {selectedFiles.length > 0 && (
                <TouchableOpacity 
                  style={styles.batchButton}
                  onPress={handleBatchShare}
                >
                  <Icon name="share" size={14} color="#2196F3" />
                  <Text style={styles.batchButtonText}>
                    分享 ({selectedFiles.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView 
              style={styles.fileList}
              showsVerticalScrollIndicator={false}
            >
              {files.slice(0, 10).map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  isSelected={selectedFiles.includes(file.id)}
                  onSelect={() => handleFileSelect(file.id)}
                  onShare={() => handleFileShare(file.id)}
                  onDelete={() => handleFileDelete(file.id)}
                  compact={true}
                />
              ))}
              
              {files.length > 10 && (
                <TouchableOpacity style={styles.moreButton}>
                  <Text style={styles.moreButtonText}>
                    查看更多 ({files.length - 10} 个文件)
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="cloud-upload" size={32} color="#ccc" />
            <Text style={styles.emptyText}>暂无文件</Text>
            <Text style={styles.emptySubText}>
              从PC端传输文件后将显示在这里
            </Text>
          </View>
        )}
      </View>

      {/* 底部状态栏 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isConnected ? '已连接' : '未连接'} • {files.length} 个文件
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
  },
  batchButtonText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '500',
  },
  fileList: {
    flex: 1,
  },
  moreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  moreButtonText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  emptySubText: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});
