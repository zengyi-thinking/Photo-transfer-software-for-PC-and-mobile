import React from 'react';
import styled from 'styled-components';
import { FolderOutlined } from '@ant-design/icons';

const MiniContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    background: rgba(64, 169, 255, 1);
  }
`;

const IconWrapper = styled.div`
  font-size: 20px;
  color: white;
  margin-bottom: 2px;
`;

const FileCount = styled.div`
  font-size: 10px;
  color: white;
  font-weight: bold;
  line-height: 1;
`;

const StatusDot = styled.div<{ isConnected: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.isConnected ? '#52c41a' : '#ff4d4f'};
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
`;

export interface MiniWindowProps {
  fileCount: number;
  isConnected: boolean;
  onClick: () => void;
}

export const MiniWindow: React.FC<MiniWindowProps> = ({
  fileCount,
  isConnected,
  onClick,
}) => {
  return (
    <MiniContainer onClick={onClick}>
      <StatusDot isConnected={isConnected} />
      <IconWrapper>
        <FolderOutlined />
      </IconWrapper>
      <FileCount>
        {fileCount > 99 ? '99+' : fileCount}
      </FileCount>
    </MiniContainer>
  );
};
