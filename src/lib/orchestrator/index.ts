// AI智能编排系统统一导出
export * from './types'
export * from './ScenarioDetector'
export * from './AISelector'
export * from './AIOrchestrator'

// 便捷导入
export { scenarioDetector } from './ScenarioDetector'
export { aiSelector } from './AISelector'
export { aiOrchestrator } from './AIOrchestrator'

// 快捷方法
export const orchestrator = {
  // 快速分析
  quick: async (content: string) => {
    const { aiOrchestrator } = await import('./AIOrchestrator')
    return aiOrchestrator.quickAnalysis(content)
  },
  
  // 完整处理
  process: async (thought: any, context?: any) => {
    const { aiOrchestrator } = await import('./AIOrchestrator')
    return aiOrchestrator.processThought(thought, context)
  },
  
  // 批量处理
  batch: async (thoughts: any[], context?: any) => {
    const { aiOrchestrator } = await import('./AIOrchestrator')
    return aiOrchestrator.processBatch(thoughts, context)
  },
  
  // 获取状态
  status: (taskId: string) => {
    const { aiOrchestrator } = require('./AIOrchestrator')
    return aiOrchestrator.getWorkStatus(taskId)
  },
  
  // 性能统计
  stats: () => {
    const { aiOrchestrator } = require('./AIOrchestrator')
    return aiOrchestrator.getPerformanceStats()
  }
}