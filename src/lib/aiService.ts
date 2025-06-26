import { AIConfig, AIResponse, AIProviderFactory } from './aiProviders'
import { Thought, ThoughtAnalysis, ThinkingPattern } from '@/types'

// AI服务配置
interface AIServiceConfig {
  primary: AIConfig
  fallback?: AIConfig
  enablePersonalization: boolean
  cacheResults: boolean
}

// 个性化分析缓存
interface AnalysisCache {
  [thoughtHash: string]: {
    result: AIResponse
    timestamp: number
    userContext: string[]
  }
}

export class AIService {
  private primaryProvider: any
  private fallbackProvider: any
  private config: AIServiceConfig
  private cache: AnalysisCache = {}
  private userProfile: {
    dominantPatterns: string[]
    commonThemes: string[]
    recentTrends: string[]
    preferences: any
  } = {
    dominantPatterns: [],
    commonThemes: [],
    recentTrends: [],
    preferences: {}
  }

  constructor(config: AIServiceConfig) {
    this.config = config
    this.primaryProvider = AIProviderFactory.createProvider(config.primary)
    if (config.fallback) {
      this.fallbackProvider = AIProviderFactory.createProvider(config.fallback)
    }
    this.loadUserProfile()
  }

  // 分析单个思维
  async analyzeThought(thought: Thought, userHistory?: Thought[]): Promise<ThoughtAnalysis> {
    try {
      // 检查缓存
      const thoughtHash = this.hashThought(thought.content)
      if (this.config.cacheResults && this.cache[thoughtHash]) {
        const cached = this.cache[thoughtHash]
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5分钟缓存
          return this.convertToThoughtAnalysis(cached.result)
        }
      }

      // 准备用户上下文
      const userContext = this.buildUserContext(userHistory)
      
      // 调用AI分析
      const aiResponse = await this.callAI(thought.content, userContext)
      
      // 缓存结果
      if (this.config.cacheResults) {
        this.cache[thoughtHash] = {
          result: aiResponse,
          timestamp: Date.now(),
          userContext: userContext.slice(-5) // 保留最近5个上下文
        }
      }

      // 更新用户画像
      if (this.config.enablePersonalization) {
        this.updateUserProfile(aiResponse)
      }

      return this.convertToThoughtAnalysis(aiResponse)
    } catch (error) {
      console.error('AI思维分析失败:', error)
      // 返回基础分析
      return this.getBasicAnalysis(thought.content)
    }
  }

  // 批量分析思维模式
  async analyzeThinkingPatterns(thoughts: Thought[]): Promise<{
    dominantPatterns: ThinkingPattern[]
    insights: string[]
    deadEndWarnings: string[]
    personalizedRecommendations: string[]
  }> {
    if (thoughts.length === 0) {
      return { dominantPatterns: [], insights: [], deadEndWarnings: [], personalizedRecommendations: [] }
    }

    try {
      // 批量分析最近的思维
      const recentThoughts = thoughts.slice(0, 10)
      const analyses = await Promise.all(
        recentThoughts.map(thought => this.analyzeThought(thought, thoughts))
      )

      // 统计思维模式
      const patternStats = this.calculatePatternStatistics(analyses)
      
      // 检测死胡同模式
      const deadEndAnalysis = this.detectDeadEndPatterns(analyses, recentThoughts)
      
      // 生成个性化建议
      const personalizedRecommendations = this.generatePersonalizedRecommendations(
        patternStats, 
        this.userProfile,
        deadEndAnalysis
      )

      // 生成整体洞察
      const insights = this.generateOverallInsights(analyses, thoughts.length)

      return {
        dominantPatterns: patternStats,
        insights,
        deadEndWarnings: deadEndAnalysis.warnings,
        personalizedRecommendations
      }
    } catch (error) {
      console.error('批量思维分析失败:', error)
      return {
        dominantPatterns: [],
        insights: ['AI分析服务暂时不可用'],
        deadEndWarnings: [],
        personalizedRecommendations: ['继续记录你的想法，AI将稍后分析']
      }
    }
  }

  // 获取AI配置建议
  getAIConfigRecommendations(): {
    providers: Array<{name: string, description: string, pros: string[], cons: string[]}>
    recommendedProvider: string
    setupInstructions: string
  } {
    return {
      providers: [
        {
          name: 'OpenAI GPT-4',
          description: '最先进的AI模型，思维分析精准度最高',
          pros: ['分析精度高', '支持复杂推理', '中文理解优秀'],
          cons: ['需要API密钥', '按使用量付费', '网络要求']
        },
        {
          name: 'Claude (Anthropic)',
          description: '擅长深度思维分析和哲学思考',
          pros: ['思维深度分析', '安全性高', '对话自然'],
          cons: ['需要API密钥', 'API额度限制', '速度较慢']
        },
        {
          name: '本地AI (Ollama)',
          description: '在本地运行，数据隐私安全',
          pros: ['完全私密', '无网络依赖', '免费使用'],
          cons: ['需要本地安装', '性能要求高', '分析精度较低']
        }
      ],
      recommendedProvider: 'OpenAI GPT-4',
      setupInstructions: '推荐使用OpenAI GPT-4获得最佳思维分析体验。请在设置中配置您的API密钥。'
    }
  }

  // 私有方法

  private async callAI(content: string, userContext: string[]): Promise<AIResponse> {
    try {
      return await this.primaryProvider.analyzeThought(content, userContext)
    } catch (error) {
      console.error('主要AI提供商失败，尝试备用:', error)
      if (this.fallbackProvider) {
        return await this.fallbackProvider.analyzeThought(content, userContext)
      }
      throw error
    }
  }

  private buildUserContext(userHistory?: Thought[]): string[] {
    if (!userHistory || userHistory.length === 0) return []
    
    // 构建用户上下文：最近的想法 + 用户画像
    const recentThoughts = userHistory
      .slice(0, 5)
      .map(t => t.content)
    
    const contextualInfo = [
      ...recentThoughts,
      `用户常见思维模式: ${this.userProfile.dominantPatterns.join(', ')}`,
      `常见主题: ${this.userProfile.commonThemes.join(', ')}`
    ]

    return contextualInfo
  }

  private convertToThoughtAnalysis(aiResponse: AIResponse): ThoughtAnalysis {
    return {
      sentiment: aiResponse.sentiment.polarity,
      themes: aiResponse.themes,
      connections: [], // 可以基于AI分析结果生成
      insights: [
        ...aiResponse.insights,
        ...(aiResponse.deadEndDetection.isDeadEnd ? [aiResponse.deadEndDetection.warning || ''] : []),
        ...aiResponse.personalizedAdvice.slice(0, 2)
      ].filter(Boolean),
      pattern: {
        type: aiResponse.thinkingPattern.type,
        frequency: Math.round(aiResponse.thinkingPattern.confidence * 10),
        recentTrend: 'stable' as const,
        recommendations: aiResponse.personalizedAdvice
      }
    }
  }

  private calculatePatternStatistics(analyses: ThoughtAnalysis[]): ThinkingPattern[] {
    const patternCounts = analyses.reduce((acc, analysis) => {
      if (analysis.pattern) {
        const type = analysis.pattern.type
        acc[type] = (acc[type] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, frequency]) => ({
        type: type as any,
        frequency,
        recentTrend: 'stable' as const,
        recommendations: this.getPatternRecommendations(type)
      }))
  }

  private detectDeadEndPatterns(analyses: ThoughtAnalysis[], thoughts: Thought[]): {
    warnings: string[]
    suggestions: string[]
  } {
    const warnings: string[] = []
    const suggestions: string[] = []

    // 检测重复思维模式
    const recentPatterns = analyses.slice(0, 5).map(a => a.pattern?.type).filter(Boolean)
    const uniquePatterns = new Set(recentPatterns)
    
    if (recentPatterns.length >= 4 && uniquePatterns.size <= 2) {
      warnings.push('🔄 检测到思维模式过于单一，可能陷入固定思维')
      suggestions.push('尝试用不同角度思考问题，或暂时换个话题')
    }

    // 检测消极情绪循环
    const recentSentiments = analyses.slice(0, 3).map(a => a.sentiment)
    if (recentSentiments.every(s => s === 'negative')) {
      warnings.push('💙 连续检测到消极思维，建议关注心理状态')
      suggestions.push('试试写下一些积极的想法，或进行放松活动')
    }

    // 检测思维碎片化
    const avgThoughtLength = thoughts.slice(0, 5).reduce((sum, t) => sum + t.content.length, 0) / 5
    if (avgThoughtLength < 20) {
      warnings.push('📝 最近的想法较为简短，可能缺乏深度思考')
      suggestions.push('尝试展开思考，写下更多细节和感受')
    }

    return { warnings, suggestions }
  }

  private generatePersonalizedRecommendations(
    patterns: ThinkingPattern[],
    _profile: typeof this.userProfile,
    deadEndAnalysis: any
  ): string[] {
    const recommendations: string[] = []

    // 基于主导模式的建议
    if (patterns.length > 0) {
      const dominantPattern = patterns[0].type
      switch (dominantPattern) {
        case 'creative':
          recommendations.push('💡 你的创意思维很活跃！建议创建一个想法收集本，记录灵感闪现')
          break
        case 'analytical':
          recommendations.push('🔍 你善于分析思考！可以尝试写下分析的逻辑链条，强化思维结构')
          break
        case 'reflective':
          recommendations.push('🪞 你的反思能力很强！建议定期回顾过往思考，寻找成长轨迹')
          break
        case 'problemSolving':
          recommendations.push('⚡ 你的问题解决思维突出！试试用"5个为什么"深挖问题根源')
          break
        case 'planning':
          recommendations.push('📋 你的规划思维清晰！建议为每个计划设定具体的时间节点和成功指标')
          break
      }
    }

    // 基于死胡同分析的建议
    recommendations.push(...deadEndAnalysis.suggestions)

    return recommendations.slice(0, 3) // 最多返回3个建议
  }

  private generateOverallInsights(analyses: ThoughtAnalysis[], totalThoughts: number): string[] {
    const insights: string[] = []

    // 思维活跃度分析
    if (totalThoughts > 10) {
      insights.push(`🔥 你已经记录了${totalThoughts}个想法，思维非常活跃！`)
    }

    // 情感趋势分析
    const sentiments = analyses.map(a => a.sentiment)
    const positiveRatio = sentiments.filter(s => s === 'positive').length / sentiments.length
    
    if (positiveRatio > 0.6) {
      insights.push('😊 最近的思维状态积极向上，保持这种良好心态')
    } else if (positiveRatio < 0.3) {
      insights.push('💙 注意到一些消极思绪，建议适当调整和关注心理健康')
    }

    // 主题多样性分析
    const allThemes = analyses.flatMap(a => a.themes)
    const uniqueThemes = new Set(allThemes)
    
    if (uniqueThemes.size > 5) {
      insights.push('🌈 你的思维涵盖多个领域，知识面很广泛')
    }

    return insights
  }

  private getPatternRecommendations(patternType: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      creative: ['记录灵感触发点', '尝试思维导图', '定期进行头脑风暴'],
      analytical: ['增加实例验证', '考虑反面观点', '建立逻辑框架'],
      reflective: ['定期回顾思考', '写下行动计划', '寻找思考模式'],
      problemSolving: ['分解复杂问题', '尝试多种方案', '评估解决效果'],
      planning: ['设定具体目标', '考虑风险因素', '制定时间节点']
    }
    return recommendations[patternType] || ['继续保持思考习惯']
  }

  private getBasicAnalysis(_content: string): ThoughtAnalysis {
    // 基础的本地分析作为备选
    return {
      sentiment: 'neutral',
      themes: ['思考'],
      connections: [],
      insights: ['AI分析暂时不可用，已保存您的想法'],
      pattern: {
        type: 'reflective',
        frequency: 1,
        recentTrend: 'stable',
        recommendations: ['继续记录你的想法']
      }
    }
  }

  private hashThought(content: string): string {
    // 简单的哈希函数
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString()
  }

  private loadUserProfile(): void {
    try {
      const saved = localStorage.getItem('thinkmate-user-profile')
      if (saved) {
        this.userProfile = { ...this.userProfile, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('加载用户画像失败:', error)
    }
  }

  private updateUserProfile(aiResponse: AIResponse): void {
    try {
      // 更新主导思维模式
      const patternType = aiResponse.thinkingPattern.type
      if (!this.userProfile.dominantPatterns.includes(patternType)) {
        this.userProfile.dominantPatterns.unshift(patternType)
        this.userProfile.dominantPatterns = this.userProfile.dominantPatterns.slice(0, 3)
      }

      // 更新常见主题
      aiResponse.themes.forEach(theme => {
        if (!this.userProfile.commonThemes.includes(theme)) {
          this.userProfile.commonThemes.unshift(theme)
          this.userProfile.commonThemes = this.userProfile.commonThemes.slice(0, 5)
        }
      })

      // 保存到localStorage
      localStorage.setItem('thinkmate-user-profile', JSON.stringify(this.userProfile))
    } catch (error) {
      console.error('更新用户画像失败:', error)
    }
  }
}

// 创建单例AI服务
let aiServiceInstance: AIService | null = null

export function createAIService(config: AIServiceConfig): AIService {
  aiServiceInstance = new AIService(config)
  return aiServiceInstance
}

export function getAIService(): AIService | null {
  return aiServiceInstance
}