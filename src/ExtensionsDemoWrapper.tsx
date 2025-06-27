/**
 * 临时包装器，用于在当前应用中查看扩展演示
 * 
 * 使用方法：
 * 1. 在 App.tsx 中导入: import { ExtensionsDemoWrapper } from './ExtensionsDemoWrapper'
 * 2. 在 currentView 类型中添加 'extensions-demo'
 * 3. 在侧边栏添加导航项
 * 4. 在主内容区域添加条件渲染
 */

import React from 'react';
import ExtensionsDemo from './pages/ExtensionsDemo';

export const ExtensionsDemoWrapper: React.FC = () => {
  return <ExtensionsDemo />;
};

// 导航项配置
export const extensionsDemoNavItem = {
  id: 'extensions-demo',
  label: 'Extensions Demo',
  icon: '🍎',
  description: 'Explore all ThinkMate extensions'
};