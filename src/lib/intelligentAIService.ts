// 增强版AI服务 - 集成智能编排系统
import { AIConfig, AIResponse } from './aiProviders'
import { Thought, ThoughtAnalysis, ThinkingPattern } from '@/types'
import { aiOrchestrator, scenarioDetector, aiSelector, AIScenario, OrchestrationResult, AIWorkStatus } from './orchestrator'

// 增强版AI服务配置
interface IntelligentAIServiceConfig {
  enableOrchestration: boolean      // 启用智能编排
  enableScenarioDetection: boolean  // 启用场景检测
  enableMultiAI: boolean            // 启用多AI协同
  fallbackToOriginal: boolean       // 失败时回退到原始服务
  userPreferences: {
    speedVsQuality: 'speed' | 'balanced' | 'quality'
    costSensitivity: 'low' | 'medium' | 'high'
    privacyConcern: 'low' | 'medium' | 'high'
  }
}

export class IntelligentAIService {
  private config: IntelligentAIServiceConfig
  private orchestrationResults = new Map<string, OrchestrationResult>()
  private statusListeners = new Set<(status: AIWorkStatus) => void>()

  constructor(config: Partial<IntelligentAIServiceConfig> = {}) {
    this.config = {
      enableOrchestration: true,
      enableScenarioDetection: true,
      enableMultiAI: false,
      fallbackToOriginal: true,
      userPreferences: {
        speedVsQuality: 'balanced',
        costSensitivity: 'medium',
        privacyConcern: 'medium'
      },
      ...config
    }

    // 监听编排状态
    aiOrchestrator.addStatusListener((status) => {
      this.notifyStatusListeners(status)
    })
  }

  // 智能分析思维 - 主要方法
  async analyzeThought(thought: Thought, userHistory?: Thought[]): Promise<ThoughtAnalysis & {
    orchestrationInfo?: {
      scenario: AIScenario
      selectedAIs: string[]
      confidence: number
      processingTime: number
      suggestions: string[]
    }
  }> {
    try {
      if (!this.config.enableOrchestration) {
        return this.fallbackToBasicAnalysis(thought, userHistory)
      }

      // 构建思维上下文
      const context = this.buildThinkingContext(thought, userHistory)
      
      // 使用AI编排系统处理
      const orchestrationResult = await aiOrchestrator.processThought(thought, context)
      
      // 保存编排结果
      this.orchestrationResults.set(thought.id, orchestrationResult)
      
      // 转换为ThoughtAnalysis格式
      const analysis = this.convertOrchestrationToAnalysis(orchestrationResult)
      
      // 添加编排信息
      return {
        ...analysis,
        orchestrationInfo: {
          scenario: orchestrationResult.scenario,
          selectedAIs: orchestrationResult.selectedAIs,
          confidence: orchestrationResult.synthesizedResult.confidence,
          processingTime: orchestrationResult.performance.totalTime,
          suggestions: orchestrationResult.recommendations
        }
      }
      
    } catch (error) {
      console.error('智能AI分析失败:', error)
      
      if (this.config.fallbackToOriginal) {
        return this.fallbackToBasicAnalysis(thought, userHistory)
      }
      
      throw error
    }
  }

  // 快速实时分析 - 用于输入时的实时反馈
  async quickAnalysis(content: string): Promise<{
    scenario: AIScenario
    suggestedAI: string
    confidence: number
    preview: {
      estimatedSentiment: 'positive' | 'negative' | 'neutral'
      estimatedThemes: string[]
      estimatedPattern: string
    }
  }> {
    try {
      // 快速场景检测
      const quickResult = await aiOrchestrator.quickAnalysis(content)
      
      // 生成预览分析
      const preview = this.generateQuickPreview(content, quickResult.scenario)
      
      return {
        scenario: quickResult.scenario,
        suggestedAI: quickResult.provider,
        confidence: quickResult.confidence,
        preview
      }
      
    } catch (error) {
      console.error('快速分析失败:', error)
      return {
        scenario: AIScenario.GENERAL_THINKING,
        suggestedAI: 'gemini',
        confidence: 0.5,
        preview: {
          estimatedSentiment: 'neutral',
          estimatedThemes: ['思考'],
          estimatedPattern: 'reflective'
        }
      }
    }
  }

  // 批量智能分析
  async analyzeBatch(thoughts: Thought[]): Promise<Map<string, ThoughtAnalysis>> {
    try {
      // 使用编排系统批量处理
      const orchestrationResults = await aiOrchestrator.processBatch(thoughts)
      
      const analysisResults = new Map<string, ThoughtAnalysis>()
      
      for (const [thoughtId, result] of orchestrationResults) {
        const analysis = this.convertOrchestrationToAnalysis(result)
        analysisResults.set(thoughtId, analysis)
      }
      
      return analysisResults
      
    } catch (error) {
      console.error('批量分析失败:', error)
      
      // 回退到单个分析
      const results = new Map<string, ThoughtAnalysis>()
      for (const thought of thoughts) {
        try {
          const analysis = await this.analyzeThought(thought)
          results.set(thought.id, analysis)
        } catch (e) {
          console.error(`分析思维${thought.id}失败:`, e)
        }
      }
      
      return results
    }
  }

  // 场景化AI推荐
  async getAIRecommendations(scenario: AIScenario): Promise<{
    primaryAI: string
    alternativeAIs: string[]
    reasoning: string
    expectedQuality: 'basic' | 'good' | 'excellent'
    expectedSpeed: 'fast' | 'medium' | 'slow'
    estimatedCost: 'low' | 'medium' | 'high'
  }> {
    try {
      const context = this.buildDefaultContext()
      const selectedAIs = aiSelector.selectOptimalAI(scenario, context)
      
      if (selectedAIs.length === 0) {
        return {
          primaryAI: 'openai',
          alternativeAIs: ['gemini', 'claude'],
          reasoning: '场景未匹配，使用默认推荐',
          expectedQuality: 'good',
          expectedSpeed: 'medium',
          estimatedCost: 'medium'
        }
      }
      
      const primary = selectedAIs[0]
      const alternatives = selectedAIs.slice(1).map(ai => ai.provider)
      
      return {
        primaryAI: primary.provider,
        alternativeAIs: alternatives,
        reasoning: this.getAISelectionReasoning(scenario, primary),
        expectedQuality: primary.quality,
        expectedSpeed: primary.speed,
        estimatedCost: primary.cost
      }
      
    } catch (error) {
      console.error('获取AI推荐失败:', error)
      return {
        primaryAI: 'openai',
        alternativeAIs: ['gemini', 'claude'],
        reasoning: '推荐失败，使用默认配置',
        expectedQuality: 'good',
        expectedSpeed: 'medium',
        estimatedCost: 'medium'
      }
    }
  }

  // 获取系统性能统计
  getPerformanceStats(): {
    orchestration: ReturnType<typeof aiOrchestrator.getPerformanceStats>
    aiProviders: { [provider: string]: any }
    scenarios: { [scenario: string]: number }
    userSatisfaction: number
  } {
    const orchestrationStats = aiOrchestrator.getPerformanceStats()
    
    // 计算AI提供商性能
    const aiProviderStats: { [provider: string]: any } = {}
    for (const [provider] of Object.entries(orchestrationStats.aiUsageStats)) {
      aiProviderStats[provider] = aiSelector.getPerformanceStats(provider)
    }
    
    // 计算用户满意度
    const results = Array.from(this.orchestrationResults.values())
    const avgSatisfaction = results.length > 0 
      ? results.reduce((sum, r) => sum + r.performance.userSatisfactionPrediction, 0) / results.length
      : 0.8
    
    return {
      orchestration: orchestrationStats,
      aiProviders: aiProviderStats,
      scenarios: orchestrationStats.scenarioDistribution,
      userSatisfaction: avgSatisfaction
    }
  }

  // 工作状态监听
  addStatusListener(listener: (status: AIWorkStatus) => void): void {
    this.statusListeners.add(listener)
  }

  removeStatusListener(listener: (status: AIWorkStatus) => void): void {
    this.statusListeners.delete(listener)
  }

  // 获取场景分析能力
  async getScenarioCapabilities(): Promise<{
    [scenario in AIScenario]: {
      description: string
      bestAI: string
      capabilities: string[]
      useCase: string
      estimatedTime: string
    }
  }> {
    return {
      [AIScenario.QUICK_CLASSIFICATION]: {
        description: '快速分类和标签',
        bestAI: 'deepseek',
        capabilities: ['文本分类', '自动标签', '快速整理'],
        useCase: '整理短想法，快速分类',
        estimatedTime: '1-2秒'
      },
      [AIScenario.CONTENT_SUMMARIZATION]: {
        description: '内容总结提炼',
        bestAI: 'moonshot',
        capabilities: ['长文本总结', '要点提取', '内容精炼'],
        useCase: '总结长文章，提取核心观点',
        estimatedTime: '3-5秒'
      },
      [AIScenario.DEEP_INSIGHT]: {
        description: '深度洞察分析',
        bestAI: 'openai',
        capabilities: ['深层分析', '洞察发现', '趋势预测'],
        useCase: '复杂问题分析，深度思考',
        estimatedTime: '5-8秒'
      },
      [AIScenario.PHILOSOPHICAL_THINKING]: {
        description: '哲学思辨',
        bestAI: 'claude',
        capabilities: ['哲学分析', '伦理思考', '价值探讨'],
        useCase: '人生思考，价值观探索',
        estimatedTime: '6-10秒'
      },
      [AIScenario.CREATIVE_INSPIRATION]: {
        description: '创意激发',
        bestAI: 'wenxin',
        capabilities: ['创意生成', '灵感启发', '发散思维'],
        useCase: '创作灵感，创新思维',
        estimatedTime: '4-6秒'
      },
      [AIScenario.SEARCH_OPTIMIZATION]: {
        description: '搜索优化',
        bestAI: 'gemini',
        capabilities: ['关键词提取', '搜索优化', '信息检索'],
        useCase: '优化搜索，信息查找',
        estimatedTime: '2-3秒'
      },
      [AIScenario.KNOWLEDGE_LINKING]: {
        description: '知识关联',
        bestAI: 'zhipu',
        capabilities: ['关系发现', '知识图谱', '语义关联'],
        useCase: '建立知识连接，发现关联',
        estimatedTime: '4-7秒'
      },
      [AIScenario.LIVE_ANALYSIS]: {
        description: '实时分析',
        bestAI: 'gemini',
        capabilities: ['实时处理', '快速反馈', '即时分析'],
        useCase: '输入时的实时反馈',
        estimatedTime: '1-2秒'
      },
      [AIScenario.FILE_PROCESSING]: {
        description: '文件处理',
        bestAI: 'deepseek',
        capabilities: ['文档解析', '内容提取', '格式转换'],
        useCase: '处理上传文件，提取内容',
        estimatedTime: '3-8秒'
      },
      [AIScenario.AUTO_TAGGING]: {
        description: '自动标签',
        bestAI: 'qwen',
        capabilities: ['标签生成', '自动分类', '元数据提取'],
        useCase: '自动为内容添加标签',
        estimatedTime: '1-3秒'
      },
      [AIScenario.COMPLEX_REASONING]: {
        description: '复杂推理',
        bestAI: 'openai',
        capabilities: ['逻辑推理', '问题解决', '系统分析'],
        useCase: '复杂问题解决，系统思考',
        estimatedTime: '6-12秒'
      },
      [AIScenario.RELATIONSHIP_DETECTION]: {
        description: '关系检测',
        bestAI: 'zhipu',
        capabilities: ['关系识别', '连接发现', '模式匹配'],
        useCase: '发现想法间的关系',
        estimatedTime: '3-6秒'
      },
      [AIScenario.CONTENT_CATEGORIZATION]: {
        description: '内容分类',
        bestAI: 'qwen',
        capabilities: ['智能分类', '主题识别', '结构化整理'],
        useCase: '整理和分类大量内容',
        estimatedTime: '2-4秒'
      },
      [AIScenario.SENTIMENT_ANALYSIS]: {
        description: '情感分析',
        bestAI: 'deepseek',
        capabilities: ['情感识别', '情绪分析', '态度检测'],
        useCase: '分析情感状态，情绪趋势',
        estimatedTime: '1-3秒'
      },
      [AIScenario.STRATEGIC_PLANNING]: {
        description: '战略规划',
        bestAI: 'openai',
        capabilities: ['战略分析', '规划制定', '目标设定'],
        useCase: '制定计划，战略思考',
        estimatedTime: '8-15秒'
      },
      [AIScenario.GENERAL_THINKING]: {
        description: '通用思维',
        bestAI: 'openai',
        capabilities: ['综合分析', '通用处理', '平衡分析'],
        useCase: '一般性思维分析',
        estimatedTime: '3-6秒'
      }
    }
  }

  // 私有方法
  private buildThinkingContext(thought: Thought, userHistory?: Thought[]) {
    const now = new Date()
    const hour = now.getHours()
    
    return {
      currentThought: thought,
      recentThoughts: userHistory?.slice(-10) || [],
      userPreferences: this.config.userPreferences,
      sessionHistory: {
        startTime: now,
        thoughtCount: userHistory?.length || 0,
        dominantScenarios: [],
        aiPerformanceHistory: []
      },
      timeOfDay: hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night'
    }
  }

  private buildDefaultContext() {
    return this.buildThinkingContext({
      id: 'default',
      content: '',
      timestamp: new Date(),
      tags: [],
      category: ''
    })
  }

  private convertOrchestrationToAnalysis(result: OrchestrationResult): ThoughtAnalysis {
    const synthesized = result.synthesizedResult
    
    return {
      sentiment: this.inferSentiment(synthesized),
      themes: synthesized.relatedConcepts,
      connections: [],
      insights: [synthesized.primaryInsight, ...synthesized.supportingInsights],
      pattern: {
        type: this.inferPatternType(result.scenario),
        frequency: Math.round(synthesized.confidence * 10),
        recentTrend: 'stable',
        recommendations: synthesized.actionableAdvice
      }
    }
  }

  private inferSentiment(synthesized: any): 'positive' | 'negative' | 'neutral' {
    const insight = synthesized.primaryInsight.toLowerCase()
    
    if (insight.includes('积极') || insight.includes('positive') || insight.includes('好的') || insight.includes('优秀')) {
      return 'positive'
    }
    
    if (insight.includes('消极') || insight.includes('negative') || insight.includes('问题') || insight.includes('困难')) {
      return 'negative'
    }
    
    return 'neutral'
  }

  private inferPatternType(scenario: AIScenario): string {
    const patternMapping: { [key in AIScenario]: string } = {
      [AIScenario.CREATIVE_INSPIRATION]: 'creative',
      [AIScenario.DEEP_INSIGHT]: 'analytical',
      [AIScenario.COMPLEX_REASONING]: 'problemSolving',
      [AIScenario.PHILOSOPHICAL_THINKING]: 'reflective',
      [AIScenario.STRATEGIC_PLANNING]: 'planning',
      [AIScenario.QUICK_CLASSIFICATION]: 'analytical',
      [AIScenario.CONTENT_SUMMARIZATION]: 'analytical',
      [AIScenario.SEARCH_OPTIMIZATION]: 'problemSolving',
      [AIScenario.KNOWLEDGE_LINKING]: 'analytical',
      [AIScenario.LIVE_ANALYSIS]: 'reflective',
      [AIScenario.FILE_PROCESSING]: 'analytical',
      [AIScenario.AUTO_TAGGING]: 'analytical',
      [AIScenario.RELATIONSHIP_DETECTION]: 'analytical',
      [AIScenario.CONTENT_CATEGORIZATION]: 'analytical',
      [AIScenario.SENTIMENT_ANALYSIS]: 'reflective',
      [AIScenario.GENERAL_THINKING]: 'reflective'
    }
    
    return patternMapping[scenario] || 'reflective'
  }

  private generateQuickPreview(content: string, scenario: AIScenario) {
    // 基于内容和场景生成快速预览
    const sentiment = this.quickSentimentDetection(content)
    const themes = this.quickThemeExtraction(content)
    const pattern = this.inferPatternType(scenario)
    
    return {
      estimatedSentiment: sentiment,
      estimatedThemes: themes,
      estimatedPattern: pattern
    }
  }

  private quickSentimentDetection(content: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['好', '棒', '优秀', '成功', '开心', '满意', '喜欢', '不错', '收获']
    const negativeWords = ['差', '糟糕', '失败', '难过', '担心', '焦虑', '困难', '问题', '痛苦']
    
    const positiveCount = positiveWords.filter(word => content.includes(word)).length
    const negativeCount = negativeWords.filter(word => content.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private quickThemeExtraction(content: string): string[] {
    const themes: string[] = []
    
    // 简单的关键词提取
    const keywords = content.match(/[\u4e00-\u9fa5a-zA-Z]{2,}/g) || []
    const uniqueKeywords = [...new Set(keywords)]
    
    // 提取前3个作为主题
    themes.push(...uniqueKeywords.slice(0, 3))
    
    if (themes.length === 0) {
      themes.push('思考')
    }
    
    return themes
  }

  private getAISelectionReasoning(scenario: AIScenario, ai: any): string {
    const reasoningMap: { [key in AIScenario]: string } = {
      [AIScenario.QUICK_CLASSIFICATION]: `${ai.provider}在快速分类任务上表现优秀，响应速度快且准确度高`,
      [AIScenario.CONTENT_SUMMARIZATION]: `${ai.provider}擅长长文本处理和内容总结，能够准确提取核心要点`,
      [AIScenario.DEEP_INSIGHT]: `${ai.provider}具有强大的深度分析能力，能够提供有价值的洞察`,
      [AIScenario.PHILOSOPHICAL_THINKING]: `${ai.provider}在哲学思辨方面表现突出，适合深层次思考`,
      [AIScenario.CREATIVE_INSPIRATION]: `${ai.provider}在创意激发方面有独特优势，能够提供新颖想法`,
      [AIScenario.SEARCH_OPTIMIZATION]: `${ai.provider}在搜索优化和信息检索方面表现优异`,
      [AIScenario.KNOWLEDGE_LINKING]: `${ai.provider}擅长发现知识之间的关联，建立语义连接`,
      [AIScenario.LIVE_ANALYSIS]: `${ai.provider}响应速度快，适合实时分析场景`,
      [AIScenario.FILE_PROCESSING]: `${ai.provider}在文件处理和内容提取方面能力强`,
      [AIScenario.AUTO_TAGGING]: `${ai.provider}能够准确生成标签，自动分类效果好`,
      [AIScenario.COMPLEX_REASONING]: `${ai.provider}具有出色的逻辑推理能力，适合复杂问题分析`,
      [AIScenario.RELATIONSHIP_DETECTION]: `${ai.provider}在关系识别和模式匹配方面表现优秀`,
      [AIScenario.CONTENT_CATEGORIZATION]: `${ai.provider}分类准确度高，能够有效整理内容`,
      [AIScenario.SENTIMENT_ANALYSIS]: `${ai.provider}情感分析精准，能够准确识别情绪状态`,
      [AIScenario.STRATEGIC_PLANNING]: `${ai.provider}在战略规划和长期思考方面有优势`,
      [AIScenario.GENERAL_THINKING]: `${ai.provider}综合能力强，适合一般性思维分析`
    }
    
    return reasoningMap[scenario] || `${ai.provider}在此场景下表现良好`
  }

  private fallbackToBasicAnalysis(thought: Thought, userHistory?: Thought[]): ThoughtAnalysis {
    // 基础本地分析作为备选
    const content = thought.content
    const sentiment = this.quickSentimentDetection(content)
    const themes = this.quickThemeExtraction(content)
    
    return {
      sentiment,
      themes,
      connections: [],
      insights: ['AI编排系统暂时不可用，使用基础分析'],
      pattern: {
        type: 'reflective',
        frequency: 1,
        recentTrend: 'stable',
        recommendations: ['继续记录想法，系统将稍后提供完整分析']
      }
    }
  }

  private notifyStatusListeners(status: AIWorkStatus): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('状态监听器错误:', error)
      }
    })
  }
}

// 创建增强版AI服务实例
let intelligentAIServiceInstance: IntelligentAIService | null = null

export function createIntelligentAIService(config?: Partial<IntelligentAIServiceConfig>): IntelligentAIService {
  intelligentAIServiceInstance = new IntelligentAIService(config)
  return intelligentAIServiceInstance
}

export function getIntelligentAIService(): IntelligentAIService | null {
  return intelligentAIServiceInstance
}

// 自动检测并创建最佳配置的服务
export function createOptimalAIService(): IntelligentAIService {
  // 根据用户设备和偏好自动配置
  const config: Partial<IntelligentAIServiceConfig> = {
    enableOrchestration: true,
    enableScenarioDetection: true,
    enableMultiAI: false, // 默认关闭多AI以节省成本
    fallbackToOriginal: true,
    userPreferences: {
      speedVsQuality: 'balanced',
      costSensitivity: 'medium',
      privacyConcern: 'medium'
    }
  }
  
  return createIntelligentAIService(config)
}