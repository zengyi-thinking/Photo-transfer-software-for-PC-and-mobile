import React from 'react';
import styled from 'styled-components';
import { MobileOutlined, WifiOutlined } from '@ant-design/icons';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatusIcon = styled.div`
  font-size: 12px;
  color: #666;
`;

const StatusText = styled.div`
  flex: 1;
  font-size: 11px;
  color: #333;
  font-weight: 500;
`;

const ConnectionDot = styled.div<{ isConnected: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.isConnected ? '#52c41a' : '#ff4d4f'};
  flex-shrink: 0;
`;

export interface DeviceStatusProps {
  isConnected: boolean;
  deviceName?: string;
  deviceCount?: number;
}

export const DeviceStatus: React.FC<DeviceStatusProps> = ({
  isConnected,
  deviceName = 'iPhone 13',
  deviceCount = 1,
}) => {
  const getStatusText = () => {
    if (!isConnected) {
      return '设备未连接';
    }
    
    if (deviceCount > 1) {
      return `${deviceCount} 台设备已连接`;
    }
    
    return deviceName;
  };

  return (
    <StatusContainer>
      <StatusIcon>
        <MobileOutlined />
      </StatusIcon>
      <StatusText>
        {getStatusText()}
      </StatusText>
      <ConnectionDot isConnected={isConnected} />
    </StatusContainer>
  );
};
