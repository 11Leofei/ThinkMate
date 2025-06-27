// AI智能选择器 - 根据场景选择最优AI提供商
import { 
  AIScenario, 
  AICapability, 
  ThinkingContext, 
  UserPreferences,
  AISelectionStrategy,
  AIProviderMapping,
  AIPerformanceMetric
} from './types'

export class AISelector {
  private capabilities: AICapability[] = [
    // OpenAI GPT - 最强推理能力
    {
      scenario: AIScenario.DEEP_INSIGHT,
      provider: 'openai',
      speed: 'medium',
      quality: 'excellent',
      cost: 'high',
      reliability: 0.95
    },
    {
      scenario: AIScenario.COMPLEX_REASONING,
      provider: 'openai',
      speed: 'medium',
      quality: 'excellent',
      cost: 'high',
      reliability: 0.95
    },
    {
      scenario: AIScenario.STRATEGIC_PLANNING,
      provider: 'openai',
      speed: 'medium',
      quality: 'excellent',
      cost: 'high',
      reliability: 0.93
    },
    
    // Claude - 最佳哲学思辨
    {
      scenario: AIScenario.PHILOSOPHICAL_THINKING,
      provider: 'claude',
      speed: 'medium',
      quality: 'excellent',
      cost: 'medium',
      reliability: 0.92
    },
    {
      scenario: AIScenario.DEEP_INSIGHT,
      provider: 'claude',
      speed: 'medium',
      quality: 'excellent',
      cost: 'medium',
      reliability: 0.90
    },
    
    // Gemini - 最快响应和搜索优化
    {
      scenario: AIScenario.SEARCH_OPTIMIZATION,
      provider: 'gemini',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.88
    },
    {
      scenario: AIScenario.LIVE_ANALYSIS,
      provider: 'gemini',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.85
    },
    {
      scenario: AIScenario.QUICK_CLASSIFICATION,
      provider: 'gemini',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.83
    },
    
    // DeepSeek - 高效处理和推理
    {
      scenario: AIScenario.QUICK_CLASSIFICATION,
      provider: 'deepseek',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.90
    },
    {
      scenario: AIScenario.FILE_PROCESSING,
      provider: 'deepseek',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.88
    },
    {
      scenario: AIScenario.AUTO_TAGGING,
      provider: 'deepseek',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.87
    },
    {
      scenario: AIScenario.SENTIMENT_ANALYSIS,
      provider: 'deepseek',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.85
    },
    
    // 智谱GLM - 中文和知识关联专家
    {
      scenario: AIScenario.KNOWLEDGE_LINKING,
      provider: 'zhipu',
      speed: 'medium',
      quality: 'excellent',
      cost: 'medium',
      reliability: 0.90
    },
    {
      scenario: AIScenario.RELATIONSHIP_DETECTION,
      provider: 'zhipu',
      speed: 'medium',
      quality: 'excellent',
      cost: 'medium',
      reliability: 0.88
    },
    
    // 月之暗面 - 长文本处理专家
    {
      scenario: AIScenario.CONTENT_SUMMARIZATION,
      provider: 'moonshot',
      speed: 'medium',
      quality: 'excellent',
      cost: 'medium',
      reliability: 0.90
    },
    {
      scenario: AIScenario.FILE_PROCESSING,
      provider: 'moonshot',
      speed: 'medium',
      quality: 'excellent',
      cost: 'medium',
      reliability: 0.85
    },
    
    // 文心一言 - 创意和文学性思维
    {
      scenario: AIScenario.CREATIVE_INSPIRATION,
      provider: 'wenxin',
      speed: 'medium',
      quality: 'good',
      cost: 'medium',
      reliability: 0.82
    },
    
    // 豆包 - 年轻化创意思维
    {
      scenario: AIScenario.CREATIVE_INSPIRATION,
      provider: 'doubao',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.80
    },
    
    // 通义千问 - 内容分类专家
    {
      scenario: AIScenario.CONTENT_CATEGORIZATION,
      provider: 'qwen',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.85
    },
    {
      scenario: AIScenario.AUTO_TAGGING,
      provider: 'qwen',
      speed: 'fast',
      quality: 'good',
      cost: 'low',
      reliability: 0.83
    }
  ]

  private strategies: Map<string, AISelectionStrategy> = new Map([
    ['quality_first', {
      name: '质量优先',
      description: '选择分析质量最高的AI，不考虑速度和成本',
      selectAI: (scenario, context, availableAIs) => {
        return availableAIs
          .filter(ai => ai.scenario === scenario)
          .sort((a, b) => this.getQualityScore(b) - this.getQualityScore(a))
          .slice(0, 1)
      }
    }],
    
    ['speed_first', {
      name: '速度优先',
      description: '选择响应最快的AI，适合实时分析',
      selectAI: (scenario, context, availableAIs) => {
        return availableAIs
          .filter(ai => ai.scenario === scenario)
          .sort((a, b) => this.getSpeedScore(b) - this.getSpeedScore(a))
          .slice(0, 1)
      }
    }],
    
    ['balanced', {
      name: '平衡策略',
      description: '综合考虑质量、速度、成本和可靠性',
      selectAI: (scenario, context, availableAIs) => {
        return availableAIs
          .filter(ai => ai.scenario === scenario)
          .sort((a, b) => this.getBalancedScore(b, context) - this.getBalancedScore(a, context))
          .slice(0, 1)
      }
    }],
    
    ['cost_effective', {
      name: '成本优先',
      description: '选择性价比最高的AI',
      selectAI: (scenario, context, availableAIs) => {
        return availableAIs
          .filter(ai => ai.scenario === scenario)
          .sort((a, b) => this.getCostEffectivenessScore(b) - this.getCostEffectivenessScore(a))
          .slice(0, 1)
      }
    }],
    
    ['adaptive', {
      name: '自适应策略',
      description: '根据上下文动态选择最优策略',
      selectAI: (scenario, context, availableAIs) => {
        return this.adaptiveSelection(scenario, context, availableAIs)
      }
    }],
    
    ['multi_ai', {
      name: '多AI协同',
      description: '选择多个AI进行并行分析，然后合成结果',
      selectAI: (scenario, context, availableAIs) => {
        const candidates = availableAIs.filter(ai => ai.scenario === scenario)
        if (candidates.length <= 2) return candidates
        
        // 选择最好的2-3个AI进行协同
        return candidates
          .sort((a, b) => this.getBalancedScore(b, context) - this.getBalancedScore(a, context))
          .slice(0, Math.min(3, candidates.length))
      }
    }]
  ])

  private performanceHistory: AIPerformanceMetric[] = []

  // 主要选择方法
  selectOptimalAI(
    scenario: AIScenario, 
    context: ThinkingContext,
    strategyName?: string
  ): AICapability[] {
    // 获取可用的AI能力
    const availableAIs = this.getAvailableCapabilities(scenario, context)
    
    if (availableAIs.length === 0) {
      // 如果没有专门的AI，回退到通用AI
      return this.getFallbackAIs(context)
    }
    
    // 选择策略
    const strategy = this.selectStrategy(strategyName, context)
    
    // 执行选择
    const selectedAIs = strategy.selectAI(scenario, context, availableAIs)
    
    // 记录选择历史
    this.recordSelection(scenario, selectedAIs, context)
    
    return selectedAIs
  }

  // 快速选择（用于实时分析）
  selectQuick(scenario: AIScenario): string {
    const quickMappings: { [key in AIScenario]?: string } = {
      [AIScenario.LIVE_ANALYSIS]: 'gemini',
      [AIScenario.QUICK_CLASSIFICATION]: 'deepseek',
      [AIScenario.CONTENT_SUMMARIZATION]: 'moonshot',
      [AIScenario.SEARCH_OPTIMIZATION]: 'gemini',
      [AIScenario.AUTO_TAGGING]: 'deepseek',
      [AIScenario.SENTIMENT_ANALYSIS]: 'deepseek'
    }
    
    return quickMappings[scenario] || this.getDefaultAI()
  }

  // 批量选择
  selectBatch(scenarios: AIScenario[], context: ThinkingContext): Map<AIScenario, AICapability[]> {
    const results = new Map<AIScenario, AICapability[]>()
    
    for (const scenario of scenarios) {
      const selected = this.selectOptimalAI(scenario, context)
      results.set(scenario, selected)
    }
    
    return results
  }

  // 更新性能数据
  updatePerformance(metric: AIPerformanceMetric): void {
    this.performanceHistory.push(metric)
    
    // 保持最近1000条记录
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000)
    }
    
    // 更新AI能力评分
    this.updateCapabilityScores(metric)
  }

  // 获取AI性能统计
  getPerformanceStats(provider: string, scenario?: AIScenario): {
    averageResponseTime: number
    successRate: number
    averageSatisfaction: number
    usageCount: number
  } {
    const relevantMetrics = this.performanceHistory.filter(metric => 
      metric.provider === provider && 
      (!scenario || metric.scenario === scenario)
    )
    
    if (relevantMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        successRate: 0,
        averageSatisfaction: 0,
        usageCount: 0
      }
    }
    
    return {
      averageResponseTime: relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0) / relevantMetrics.length,
      successRate: relevantMetrics.reduce((sum, m) => sum + m.successRate, 0) / relevantMetrics.length,
      averageSatisfaction: relevantMetrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / relevantMetrics.length,
      usageCount: relevantMetrics.length
    }
  }

  // 私有方法
  private getAvailableCapabilities(scenario: AIScenario, context: ThinkingContext): AICapability[] {
    // 过滤可用的AI能力
    let available = this.capabilities.filter(cap => cap.scenario === scenario)
    
    // 根据用户偏好过滤
    if (context.userPreferences.costSensitivity === 'high') {
      available = available.filter(cap => cap.cost !== 'high')
    }
    
    if (context.userPreferences.privacyConcern === 'high') {
      // 优先选择国产AI或本地AI
      available = available.filter(cap => 
        ['zhipu', 'qwen', 'wenxin', 'doubao', 'deepseek', 'moonshot', 'local'].includes(cap.provider)
      )
    }
    
    return available
  }

  private selectStrategy(strategyName: string | undefined, context: ThinkingContext): AISelectionStrategy {
    if (strategyName && this.strategies.has(strategyName)) {
      return this.strategies.get(strategyName)!
    }
    
    // 自动选择策略
    const preferences = context.userPreferences
    
    if (preferences.speedVsQuality === 'speed') {
      return this.strategies.get('speed_first')!
    } else if (preferences.speedVsQuality === 'quality') {
      return this.strategies.get('quality_first')!
    } else if (preferences.costSensitivity === 'high') {
      return this.strategies.get('cost_effective')!
    } else {
      return this.strategies.get('adaptive')!
    }
  }

  private adaptiveSelection(
    scenario: AIScenario, 
    context: ThinkingContext, 
    availableAIs: AICapability[]
  ): AICapability[] {
    const candidates = availableAIs.filter(ai => ai.scenario === scenario)
    if (candidates.length === 0) return []
    
    // 根据时间和上下文动态调整
    let strategy = 'balanced'
    
    // 工作时间优先效率
    const hour = new Date().getHours()
    if (hour >= 9 && hour <= 18) {
      strategy = 'speed_first'
    }
    
    // 深夜优先质量
    if (hour >= 22 || hour <= 6) {
      strategy = 'quality_first'
    }
    
    // 如果是复杂场景，优先质量
    if ([AIScenario.DEEP_INSIGHT, AIScenario.PHILOSOPHICAL_THINKING, AIScenario.COMPLEX_REASONING].includes(scenario)) {
      strategy = 'quality_first'
    }
    
    // 如果是快速场景，优先速度
    if ([AIScenario.LIVE_ANALYSIS, AIScenario.QUICK_CLASSIFICATION, AIScenario.AUTO_TAGGING].includes(scenario)) {
      strategy = 'speed_first'
    }
    
    const selectedStrategy = this.strategies.get(strategy)!
    return selectedStrategy.selectAI(scenario, context, candidates)
  }

  private getFallbackAIs(context: ThinkingContext): AICapability[] {
    // 返回默认的通用AI
    const defaultAIs = this.capabilities.filter(cap => 
      cap.provider === this.getDefaultAI()
    )
    
    return defaultAIs.length > 0 ? [defaultAIs[0]] : []
  }

  private getDefaultAI(): string {
    // 从用户配置中获取默认AI
    try {
      const config = JSON.parse(localStorage.getItem('thinkmate-ai-config') || '{}')
      return config.provider || 'openai'
    } catch {
      return 'openai'
    }
  }

  private recordSelection(scenario: AIScenario, selectedAIs: AICapability[], context: ThinkingContext): void {
    // 记录选择历史，用于学习和优化
    const record = {
      timestamp: new Date(),
      scenario,
      selectedProviders: selectedAIs.map(ai => ai.provider),
      context: {
        timeOfDay: context.timeOfDay,
        userPreferences: context.userPreferences
      }
    }
    
    // 可以保存到localStorage或发送到后端
    const history = JSON.parse(localStorage.getItem('ai-selection-history') || '[]')
    history.push(record)
    if (history.length > 500) {
      history.splice(0, history.length - 500)
    }
    localStorage.setItem('ai-selection-history', JSON.stringify(history))
  }

  private updateCapabilityScores(metric: AIPerformanceMetric): void {
    // 根据性能指标更新AI能力评分
    const capability = this.capabilities.find(cap => 
      cap.provider === metric.provider && cap.scenario === metric.scenario
    )
    
    if (capability) {
      // 动态调整可靠性评分
      const oldReliability = capability.reliability
      const newReliability = (oldReliability * 0.9) + (metric.successRate * 0.1)
      capability.reliability = Math.max(0.1, Math.min(1.0, newReliability))
    }
  }

  // 评分计算方法
  private getQualityScore(ai: AICapability): number {
    const qualityScores = { basic: 0.3, good: 0.6, excellent: 1.0 }
    return qualityScores[ai.quality] * ai.reliability
  }

  private getSpeedScore(ai: AICapability): number {
    const speedScores = { slow: 0.3, medium: 0.6, fast: 1.0 }
    return speedScores[ai.speed] * ai.reliability
  }

  private getCostEffectivenessScore(ai: AICapability): number {
    const costScores = { high: 0.3, medium: 0.6, low: 1.0 }
    const qualityScores = { basic: 0.3, good: 0.6, excellent: 1.0 }
    return (costScores[ai.cost] + qualityScores[ai.quality]) / 2 * ai.reliability
  }

  private getBalancedScore(ai: AICapability, context: ThinkingContext): number {
    const quality = this.getQualityScore(ai)
    const speed = this.getSpeedScore(ai)
    const cost = this.getCostEffectivenessScore(ai)
    
    // 根据用户偏好调整权重
    const prefs = context.userPreferences
    let qualityWeight = 0.4
    let speedWeight = 0.3
    let costWeight = 0.3
    
    if (prefs.speedVsQuality === 'speed') {
      speedWeight = 0.5
      qualityWeight = 0.3
    } else if (prefs.speedVsQuality === 'quality') {
      qualityWeight = 0.6
      speedWeight = 0.2
    }
    
    if (prefs.costSensitivity === 'high') {
      costWeight = 0.5
      qualityWeight *= 0.7
      speedWeight *= 0.7
    }
    
    return quality * qualityWeight + speed * speedWeight + cost * costWeight
  }
}

// 单例导出
export const aiSelector = new AISelector()