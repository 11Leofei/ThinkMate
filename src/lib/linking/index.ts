// 思维链接AI引擎统一导出
export * from './types'
export * from './ThoughtLinkingEngine'

// 便捷导入
export { thoughtLinkingEngine } from './ThoughtLinkingEngine'

// 快捷方法
export const linking = {
  // 发现连接
  discover: async (thoughts: any[]) => {
    const { thoughtLinkingEngine } = await import('./ThoughtLinkingEngine')
    return thoughtLinkingEngine.discoverConnections(thoughts)
  },
  
  // 实时建议
  suggest: async (currentThought: any, recentThoughts: any[]) => {
    const { thoughtLinkingEngine } = await import('./ThoughtLinkingEngine')
    return thoughtLinkingEngine.suggestConnections(currentThought, recentThoughts)
  },
  
  // 智能问答
  answer: async (question: string, thoughts: any[]) => {
    const { thoughtLinkingEngine } = await import('./ThoughtLinkingEngine')
    return thoughtLinkingEngine.answerBasedOnConnections(question, thoughts)
  },
  
  // 构建图谱
  buildGraph: async (thoughts: any[], knowledge: any[] = []) => {
    const { thoughtLinkingEngine } = await import('./ThoughtLinkingEngine')
    return thoughtLinkingEngine.buildKnowledgeGraph(thoughts, knowledge)
  },
  
  // 增量更新
  update: async (newThought: any, existingThoughts: any[]) => {
    const { thoughtLinkingEngine } = await import('./ThoughtLinkingEngine')
    return thoughtLinkingEngine.updateConnections(newThought, existingThoughts)
  },
  
  // 网络分析
  analyze: async (thoughts: any[]) => {
    const { thoughtLinkingEngine } = await import('./ThoughtLinkingEngine')
    return thoughtLinkingEngine.analyzeNetwork(thoughts)
  },
  
  // 获取统计
  stats: () => {
    const { thoughtLinkingEngine } = require('./ThoughtLinkingEngine')
    return thoughtLinkingEngine.getConnectionStats()
  }
}

// 连接类型常量
export const CONNECTION_TYPES = {
  // 逻辑关系
  CAUSAL: 'causal',
  SEQUENTIAL: 'sequential',
  CONTRADICTORY: 'contradictory',
  SUPPORTING: 'supporting',
  
  // 语义关系
  SIMILAR: 'similar',
  COMPLEMENTARY: 'complementary',
  ELABORATION: 'elaboration',
  GENERALIZATION: 'generalization',
  
  // 创意关系
  INSPIRATION: 'inspiration',
  ANALOGY: 'analogy',
  METAPHOR: 'metaphor',
  
  // 问题解决
  PROBLEM_SOLUTION: 'problem_solution',
  QUESTION_ANSWER: 'question_answer',
  HYPOTHESIS_EVIDENCE: 'hypothesis_evidence',
  
  // 知识关系
  CONCEPT_INSTANCE: 'concept_instance',
  PART_WHOLE: 'part_whole',
  CATEGORY_MEMBER: 'category_member',
  
  // 情感关系
  MOOD_INFLUENCED: 'mood_influenced',
  EMOTIONAL_RESONANCE: 'emotional_resonance',
  
  // 时间关系
  BEFORE_AFTER: 'before_after',
  REVISIT: 'revisit',
  EVOLUTION: 'evolution'
} as const

// 连接强度常量
export const CONNECTION_STRENGTH = {
  WEAK: 'weak',
  MODERATE: 'moderate', 
  STRONG: 'strong',
  VERY_STRONG: 'very_strong'
} as const

// 预设配置
export const LINKING_PRESETS = {
  // 快速模式 - 适合实时建议
  QUICK: {
    enableAILinking: true,
    aiProviders: ['gemini', 'deepseek'],
    confidenceThreshold: 0.7,
    maxConnectionsPerThought: 5,
    timeWindowDays: 7,
    semanticSimilarityThreshold: 0.8,
    batchSize: 20,
    parallelProcessing: true,
    userPreferences: {
      preferExplicitConnections: true,
      showWeakConnections: false,
      autoVerifyConnections: false,
      prioritizeRecentThoughts: true
    }
  },
  
  // 深度模式 - 适合全面分析
  DEEP: {
    enableAILinking: true,
    aiProviders: ['openai', 'claude', 'zhipu'],
    confidenceThreshold: 0.5,
    maxConnectionsPerThought: 15,
    timeWindowDays: 90,
    semanticSimilarityThreshold: 0.6,
    batchSize: 100,
    parallelProcessing: true,
    userPreferences: {
      preferExplicitConnections: false,
      showWeakConnections: true,
      autoVerifyConnections: true,
      prioritizeRecentThoughts: false
    }
  },
  
  // 平衡模式 - 默认配置
  BALANCED: {
    enableAILinking: true,
    aiProviders: ['zhipu', 'gemini', 'deepseek'],
    confidenceThreshold: 0.6,
    maxConnectionsPerThought: 10,
    timeWindowDays: 30,
    semanticSimilarityThreshold: 0.7,
    batchSize: 50,
    parallelProcessing: true,
    userPreferences: {
      preferExplicitConnections: false,
      showWeakConnections: true,
      autoVerifyConnections: true,
      prioritizeRecentThoughts: true
    }
  },
  
  // 隐私模式 - 仅本地分析
  PRIVACY: {
    enableAILinking: false,
    aiProviders: ['local'],
    confidenceThreshold: 0.8,
    maxConnectionsPerThought: 8,
    timeWindowDays: 14,
    semanticSimilarityThreshold: 0.8,
    batchSize: 30,
    parallelProcessing: false,
    userPreferences: {
      preferExplicitConnections: true,
      showWeakConnections: false,
      autoVerifyConnections: false,
      prioritizeRecentThoughts: true
    }
  }
} as const

// 工具函数
export const linkingUtils = {
  // 格式化连接强度
  formatStrength: (strength: number): string => {
    if (strength > 0.8) return '非常强'
    if (strength > 0.6) return '强'
    if (strength > 0.3) return '中等'
    return '弱'
  },
  
  // 格式化连接类型
  formatConnectionType: (type: string): string => {
    const typeNames: { [key: string]: string } = {
      causal: '因果关系',
      similar: '相似关系',
      supporting: '支持关系',
      contradictory: '矛盾关系',
      sequential: '时序关系',
      question_answer: '问答关系',
      inspiration: '启发关系',
      complementary: '互补关系',
      elaboration: '详述关系',
      generalization: '泛化关系',
      analogy: '类比关系',
      metaphor: '隐喻关系',
      problem_solution: '问题解决',
      hypothesis_evidence: '假设证据',
      concept_instance: '概念实例',
      part_whole: '部分整体',
      category_member: '类别成员',
      mood_influenced: '情绪影响',
      emotional_resonance: '情感共鸣',
      before_after: '前后关系',
      revisit: '重访关系',
      evolution: '演化关系'
    }
    return typeNames[type] || type
  },
  
  // 获取连接颜色
  getConnectionColor: (type: string): string => {
    const colorMap: { [key: string]: string } = {
      causal: '#F44336',
      similar: '#4CAF50',
      supporting: '#2196F3',
      contradictory: '#FF5722',
      sequential: '#FF9800',
      question_answer: '#9C27B0',
      inspiration: '#E91E63',
      complementary: '#00BCD4',
      elaboration: '#795548',
      generalization: '#607D8B'
    }
    return colorMap[type] || '#757575'
  },
  
  // 验证连接有效性
  validateConnection: (connection: any): boolean => {
    return !!(
      connection.fromThoughtId &&
      connection.toThoughtId &&
      connection.type &&
      connection.strength >= 0 &&
      connection.strength <= 1 &&
      connection.confidence >= 0 &&
      connection.confidence <= 1
    )
  },
  
  // 计算连接质量分数
  calculateQualityScore: (connection: any): number => {
    const strengthWeight = 0.4
    const confidenceWeight = 0.3
    const verificationWeight = 0.2
    const typeWeight = 0.1
    
    const verificationScore = Math.min(connection.metadata?.verificationCount || 0, 5) / 5
    const typeScore = connection.type === 'causal' || connection.type === 'question_answer' ? 1 : 0.8
    
    return (
      connection.strength * strengthWeight +
      connection.confidence * confidenceWeight +
      verificationScore * verificationWeight +
      typeScore * typeWeight
    )
  }
}

// 事件类型
export const LINKING_EVENTS = {
  CONNECTION_DISCOVERED: 'connection_discovered',
  CONNECTION_SUGGESTED: 'connection_suggested',
  CONNECTION_VERIFIED: 'connection_verified',
  CONNECTION_REMOVED: 'connection_removed',
  NETWORK_UPDATED: 'network_updated',
  ANALYSIS_COMPLETED: 'analysis_completed'
} as const