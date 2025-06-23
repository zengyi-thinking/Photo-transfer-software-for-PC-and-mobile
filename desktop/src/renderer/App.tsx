import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import styled from 'styled-components';

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
`;

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AppContainer>
        <h1>文件传输助手</h1>
        <p>PC端浮动窗口</p>
      </AppContainer>
    </ConfigProvider>
  );
};

export default App;
