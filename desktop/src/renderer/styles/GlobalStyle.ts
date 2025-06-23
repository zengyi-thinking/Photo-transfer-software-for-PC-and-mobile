import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: transparent;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  #root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }
  }

  /* 拖拽样式 */
  .drag-over {
    background: rgba(64, 169, 255, 0.2) !important;
    border-color: #40a9ff !important;
    box-shadow: 0 0 20px rgba(64, 169, 255, 0.3) !important;
  }

  .dragging {
    opacity: 0.5 !important;
    transform: scale(0.95) !important;
  }

  /* Ant Design 组件样式覆盖 */
  .ant-btn {
    border-radius: 4px;
    font-size: 12px;
    
    &.ant-btn-sm {
      height: 20px;
      padding: 0 6px;
      font-size: 11px;
    }
  }

  .ant-tooltip {
    font-size: 11px;
    
    .ant-tooltip-inner {
      padding: 4px 6px;
      border-radius: 4px;
    }
  }

  .ant-spin {
    color: #40a9ff;
  }

  /* 动画效果 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px);
    }
    75% {
      transform: translateX(2px);
    }
  }

  /* 工具类 */
  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }

  .pulse {
    animation: pulse 1s ease-in-out infinite;
  }

  .shake {
    animation: shake 0.5s ease-in-out;
  }

  /* 响应式设计 */
  @media (max-width: 320px) {
    body {
      font-size: 11px;
    }
  }

  /* 高对比度模式支持 */
  @media (prefers-contrast: high) {
    * {
      border-color: #000 !important;
      color: #000 !important;
    }
    
    .ant-btn {
      border: 2px solid #000 !important;
    }
  }

  /* 减少动画模式支持 */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* 暗色主题支持 */
  @media (prefers-color-scheme: dark) {
    body {
      color: #fff;
    }
  }
`;
