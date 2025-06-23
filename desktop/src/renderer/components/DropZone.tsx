import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Button, Spin } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';

const DropContainer = styled.div<{ isDragOver: boolean; isUploading: boolean }>`
  height: 80px;
  border: 2px dashed ${props => 
    props.isDragOver ? '#40a9ff' : 
    props.isUploading ? '#52c41a' : 
    'rgba(0, 0, 0, 0.2)'};
  border-radius: 8px;
  background: ${props => 
    props.isDragOver ? 'rgba(64, 169, 255, 0.1)' : 
    props.isUploading ? 'rgba(82, 196, 26, 0.1)' : 
    'rgba(255, 255, 255, 0.1)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #40a9ff;
    background: rgba(64, 169, 255, 0.05);
  }
`;

const DropContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: none;
`;

const DropIcon = styled.div<{ isUploading: boolean }>`
  font-size: 16px;
  color: ${props => props.isUploading ? '#52c41a' : '#666'};
`;

const DropText = styled.div`
  font-size: 11px;
  color: #666;
  text-align: center;
  line-height: 1.2;
`;

const UploadButton = styled(Button)`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 24px;
  height: 20px;
  padding: 0;
  font-size: 10px;
  border-radius: 4px;
`;

export interface DropZoneProps {
  onFileUpload: (filePaths: string[]) => Promise<void>;
  onDragOver: (isDragging: boolean) => void;
  isUploading: boolean;
  onFileSelect: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileUpload,
  onDragOver,
  isUploading,
  onFileSelect,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  // 处理拖拽进入
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
      onDragOver(true);
    }
  };

  // 处理拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
      onDragOver(false);
    }
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  // 处理文件放置
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current = 0;
    setIsDragOver(false);
    onDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const filePaths = files.map(file => (file as any).path || file.name);
      await onFileUpload(filePaths);
    }
  };

  // 处理点击上传
  const handleClick = () => {
    if (!isUploading) {
      onFileSelect();
    }
  };

  return (
    <DropContainer
      isDragOver={isDragOver}
      isUploading={isUploading}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <DropContent>
        <DropIcon isUploading={isUploading}>
          {isUploading ? (
            <Spin size="small" />
          ) : isDragOver ? (
            <InboxOutlined />
          ) : (
            <UploadOutlined />
          )}
        </DropIcon>
        <DropText>
          {isUploading ? '上传中...' : 
           isDragOver ? '释放文件' : 
           '拖拽文件到此处'}
        </DropText>
      </DropContent>
      
      {!isUploading && !isDragOver && (
        <UploadButton 
          type="text" 
          size="small"
          icon={<UploadOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onFileSelect();
          }}
        />
      )}
    </DropContainer>
  );
};
