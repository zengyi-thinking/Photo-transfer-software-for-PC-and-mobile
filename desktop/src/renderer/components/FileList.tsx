import React from 'react';
import styled from 'styled-components';
import { Button, Tooltip } from 'antd';
import { 
  FileOutlined, 
  PictureOutlined, 
  VideoCameraOutlined,
  FileTextOutlined,
  DeleteOutlined,
  DragOutlined
} from '@ant-design/icons';
import { formatFileSize, formatRelativeTime } from '../utils/format';

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 80px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: grab;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(64, 169, 255, 0.3);
  }
  
  &:active {
    cursor: grabbing;
  }
  
  &.dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }
`;

const FileIcon = styled.div`
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const FileName = styled.div`
  font-size: 11px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileDetails = styled.div`
  font-size: 9px;
  color: #999;
  display: flex;
  gap: 4px;
`;

const FileActions = styled.div`
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${FileItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled(Button)`
  width: 16px;
  height: 16px;
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
  
  &.delete:hover {
    background: #ff4d4f;
    color: white;
  }
`;

const MoreIndicator = styled.div`
  text-align: center;
  font-size: 10px;
  color: #999;
  padding: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
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

export interface FileListProps {
  files: FileInfo[];
  onFileDelete: (fileId: string) => Promise<void>;
  onFileDrag: (fileInfo: FileInfo) => void;
  maxVisible?: number;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onFileDelete,
  onFileDrag,
  maxVisible = 3,
}) => {
  const visibleFiles = files.slice(0, maxVisible);
  const hiddenCount = files.length - maxVisible;

  // 获取文件图标
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PictureOutlined />;
      case 'video':
        return <VideoCameraOutlined />;
      case 'document':
        return <FileTextOutlined />;
      default:
        return <FileOutlined />;
    }
  };

  // 处理文件拖拽开始
  const handleDragStart = (e: React.DragEvent, fileInfo: FileInfo) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', fileInfo.name);
    
    // 设置拖拽样式
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
    
    // 通知主进程准备文件拖拽
    onFileDrag(fileInfo);
  };

  // 处理文件拖拽结束
  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
  };

  // 处理文件删除
  const handleDelete = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onFileDelete(fileId);
  };

  return (
    <ListContainer>
      {visibleFiles.map((file) => (
        <FileItem
          key={file.id}
          draggable
          onDragStart={(e) => handleDragStart(e, file)}
          onDragEnd={handleDragEnd}
        >
          <FileIcon>
            {getFileIcon(file.type)}
          </FileIcon>
          
          <FileInfo>
            <FileName title={file.name}>
              {file.name}
            </FileName>
            <FileDetails>
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{formatRelativeTime(file.uploadedAt)}</span>
            </FileDetails>
          </FileInfo>
          
          <FileActions>
            <Tooltip title="拖拽分享">
              <ActionButton 
                icon={<DragOutlined />}
                size="small"
              />
            </Tooltip>
            <Tooltip title="删除">
              <ActionButton 
                icon={<DeleteOutlined />}
                size="small"
                className="delete"
                onClick={(e) => handleDelete(file.id, e)}
              />
            </Tooltip>
          </FileActions>
        </FileItem>
      ))}
      
      {hiddenCount > 0 && (
        <MoreIndicator>
          还有 {hiddenCount} 个文件...
        </MoreIndicator>
      )}
    </ListContainer>
  );
};
