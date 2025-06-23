import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Button, Tooltip } from 'antd';
import { 
  FolderOutlined, 
  SettingOutlined, 
  MinusOutlined, 
  CloseOutlined,
  UploadOutlined,
  DragOutlined
} from '@ant-design/icons';
import { FileList } from './FileList';
import { DropZone } from './DropZone';
import { DeviceStatus } from './DeviceStatus';

const WindowContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const TitleBar = styled.div`
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  -webkit-app-region: drag;
`;

const TitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 12px;
  font-weight: 500;
`;

const TitleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  -webkit-app-region: no-drag;
`;

const WindowButton = styled(Button)`
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }
  
  &.close:hover {
    background: #ff4d4f;
    color: white;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;
`;

const StatusBar = styled.div`
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 11px;
  color: #666;
`;

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
  onFileUpload: (filePaths: string[]) => Promise<void>;
  onFileDelete: (fileId: string) => Promise<void>;
  onFileDrag: (fileInfo: FileInfo) => void;
  onDragOver: (isDragging: boolean) => void;
  onMinimize: () => void;
  isConnected: boolean;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  files,
  onFileUpload,
  onFileDelete,
  onFileDrag,
  onDragOver,
  onMinimize,
  isConnected,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 处理文件输入变化
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const filePaths = Array.from(files).map(file => file.path || file.name);
      await handleFileUpload(filePaths);
    }
    // 清空输入框
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理文件上传
  const handleFileUpload = async (filePaths: string[]) => {
    setIsUploading(true);
    try {
      await onFileUpload(filePaths);
    } finally {
      setIsUploading(false);
    }
  };

  // 处理窗口关闭
  const handleClose = () => {
    window.electronAPI?.hideWindow();
  };

  // 处理设置
  const handleSettings = () => {
    window.electronAPI?.openSettings();
  };

  return (
    <WindowContainer>
      {/* 标题栏 */}
      <TitleBar>
        <TitleLeft>
          <FolderOutlined />
          文件传输
        </TitleLeft>
        <TitleRight>
          <Tooltip title="设置">
            <WindowButton 
              icon={<SettingOutlined />} 
              onClick={handleSettings}
            />
          </Tooltip>
          <Tooltip title="最小化">
            <WindowButton 
              icon={<MinusOutlined />} 
              onClick={onMinimize}
            />
          </Tooltip>
          <Tooltip title="隐藏">
            <WindowButton 
              icon={<CloseOutlined />} 
              onClick={handleClose}
              className="close"
            />
          </Tooltip>
        </TitleRight>
      </TitleBar>

      {/* 内容区域 */}
      <ContentArea>
        {/* 设备状态 */}
        <DeviceStatus isConnected={isConnected} />

        {/* 拖拽上传区域 */}
        <DropZone
          onFileUpload={handleFileUpload}
          onDragOver={onDragOver}
          isUploading={isUploading}
          onFileSelect={handleFileSelect}
        />

        {/* 文件列表 */}
        {files.length > 0 && (
          <FileList
            files={files}
            onFileDelete={onFileDelete}
            onFileDrag={onFileDrag}
            maxVisible={2}
          />
        )}
      </ContentArea>

      {/* 状态栏 */}
      <StatusBar>
        {isUploading ? '上传中...' : `${files.length} 个文件`}
      </StatusBar>

      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
    </WindowContainer>
  );
};
