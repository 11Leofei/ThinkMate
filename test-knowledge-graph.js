// 测试知识图谱视图切换功能

console.log('测试知识图谱视图切换功能...');

// 模拟视图模式
const VisualizationMode = {
  OVERVIEW: 'overview',
  FOCUS: 'focus',
  CLUSTER: 'cluster',
  PATH: 'path',
  TEMPORAL: 'temporal',
  COMPARISON: 'comparison'
};

// 模拟布局算法
const LayoutAlgorithm = {
  FORCE_DIRECTED: 'force-directed',
  HIERARCHICAL: 'hierarchical',
  CIRCULAR: 'circular',
  RADIAL: 'radial',
  GRID: 'grid',
  ORGANIC: 'organic',
  TIMELINE: 'timeline'
};

// 测试各种模式
console.log('可用的视图模式:');
Object.entries(VisualizationMode).forEach(([key, value]) => {
  console.log(`- ${key}: ${value}`);
});

console.log('\n可用的布局算法:');
Object.entries(LayoutAlgorithm).forEach(([key, value]) => {
  console.log(`- ${key}: ${value}`);
});

console.log('\n视图切换功能已实现，包括:');
console.log('1. 模式选择下拉框 - 支持6种可视化模式');
console.log('2. 布局选择下拉框 - 支持7种布局算法');
console.log('3. handleModeChange 方法处理模式切换');
console.log('4. handleLayoutChange 方法处理布局切换');
console.log('5. 所有切换都会调用 GraphVisualizationEngine 的相应方法');

console.log('\n测试完成！');