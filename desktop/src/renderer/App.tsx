import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import styled from 'styled-components';
import { FloatingWindow } from './components/FloatingWindow';
import { MiniWindow } from './components/MiniWindow';
import { useWindowState } from './hooks/useWindowState';
import { useFileManager } from './hooks/useFileManager';
import { GlobalStyle } from './styles/GlobalStyle';

const AppContainer = styled.div<{ isMinimized: boolean }>`
  width: 100%;
  height: 100vh;
  background: ${props => props.isMinimized
    ? 'rgba(64, 169, 255, 0.9)'
    : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(15px);
  border-radius: ${props => props.isMinimized ? '50%' : '12px'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  &.drag-over {
    background: rgba(64, 169, 255, 0.2);
    border-color: #40a9ff;
    box-shadow: 0 0 20px rgba(64, 169, 255, 0.3);
  }
`;

const App: React.FC = () => {
  const { windowState, toggleMinimize, updateWindowState } = useWindowState();
  const { files, uploadFiles, deleteFile, startFileDrag } = useFileManager();
  const [isDragOver, setIsDragOver] = useState(false);

  // 监听主进程事件
  useEffect(() => {
    // 监听窗口状态变化
    window.electronAPI?.onWindowStateChanged((newState) => {
      updateWindowState(newState);
    });

    // 监听截图事件
    window.electronAPI?.onScreenshotCaptured((screenshotPath) => {
      uploadFiles([screenshotPath]);
    });

    // 监听托盘事件
    window.electronAPI?.onTrayToggleMinimize(() => {
      toggleMinimize();
    });

    return () => {
      // 清理事件监听器
      window.electronAPI?.removeAllListeners();
    };
  }, []);

  // 处理文件拖拽
  const handleFileDrop = async (filePaths: string[]) => {
    setIsDragOver(false);
    await uploadFiles(filePaths);
  };

  // 处理拖拽状态
  const handleDragOver = (isDragging: boolean) => {
    setIsDragOver(isDragging);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <GlobalStyle />
      <AppContainer
        isMinimized={windowState.isMinimized}
        className={isDragOver ? 'drag-over' : ''}
      >
        {windowState.isMinimized ? (
          <MiniWindow
            fileCount={files.length}
            isConnected={true}
            onClick={toggleMinimize}
          />
        ) : (
          <FloatingWindow
            files={files}
            onFileUpload={handleFileDrop}
            onFileDelete={deleteFile}
            onFileDrag={startFileDrag}
            onDragOver={handleDragOver}
            onMinimize={toggleMinimize}
            isConnected={true}
          />
        )}
      </AppContainer>
    </ConfigProvider>
  );
};

export default App;
