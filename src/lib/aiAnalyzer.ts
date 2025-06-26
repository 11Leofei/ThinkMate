import { Thought, ThoughtAnalysis, ThinkingPattern } from '@/types'

// 思维模式关键词映射
const PATTERN_KEYWORDS = {
  creative: [
    // 中文创意词汇
    '想象', '创意', '灵感', '创新', '设计', '艺术', '美的', '独特', '原创',
    '可能性', '如果', '假设', '也许', '或许', '想象一下', '创造',
    // 英文创意词汇
    'creative', 'imagine', 'design', 'art', 'unique', 'original', 'innovation',
    'possibility', 'what if', 'suppose', 'maybe', 'perhaps', 'create'
  ],
  analytical: [
    // 中文分析词汇
    '分析', '逻辑', '因为', '所以', '因此', '推理', '证明', '数据', '事实',
    '结论', '假设', '验证', '比较', '对比', '评估', '判断', '理性',
    // 英文分析词汇
    'analyze', 'logic', 'because', 'therefore', 'reasoning', 'proof', 'data',
    'evidence', 'conclusion', 'hypothesis', 'compare', 'evaluate', 'rational'
  ],
  problemSolving: [
    // 中文问题解决词汇
    '问题', '解决', '方案', '方法', '策略', '计划', '步骤', '目标', '挑战',
    '困难', '障碍', '突破', '改进', '优化', '修复', '处理',
    // 英文问题解决词汇
    'problem', 'solution', 'solve', 'method', 'strategy', 'plan', 'step',
    'goal', 'challenge', 'difficulty', 'overcome', 'improve', 'fix'
  ],
  reflective: [
    // 中文反思词汇
    '反思', '思考', '感受', '体验', '领悟', '感悟', '意识到', '发现',
    '理解', '感觉', '觉得', '认为', '意识', '内心', '自己', '我发现',
    // 英文反思词汇
    'reflect', 'thinking', 'feel', 'experience', 'realize', 'discover',
    'understand', 'conscious', 'awareness', 'myself', 'I feel', 'I think'
  ],
  planning: [
    // 中文规划词汇
    '计划', '安排', '准备', '组织', '时间', '日程', '任务', '优先级',
    '明天', '下周', '未来', '预期', '期望', '打算', '准备做',
    // 英文规划词汇
    'plan', 'schedule', 'organize', 'time', 'task', 'priority', 'tomorrow',
    'next week', 'future', 'expect', 'intend', 'prepare'
  ]
}

// 情感关键词映射
const SENTIMENT_KEYWORDS = {
  positive: [
    // 中文积极词汇
    '好', '棒', '喜欢', '开心', '快乐', '兴奋', '满意', '成功', '进步',
    '希望', '乐观', '积极', '正面', '美好', '幸福', '满足',
    // 英文积极词汇
    'good', 'great', 'happy', 'excited', 'success', 'progress', 'hope',
    'positive', 'wonderful', 'amazing', 'excellent', 'fantastic'
  ],
  negative: [
    // 中文消极词汇
    '糟糕', '难过', '失望', '焦虑', '担心', '害怕', '困惑', '迷茫',
    '沮丧', '疲惫', '压力', '痛苦', '失败', '错误', '问题',
    // 英文消极词汇
    'bad', 'terrible', 'sad', 'disappointed', 'anxious', 'worried', 'afraid',
    'confused', 'frustrated', 'tired', 'stress', 'pain', 'failure', 'wrong'
  ]
}

// 思维死胡同检测关键词
const DEAD_END_PATTERNS = [
  // 中文死胡同模式
  '不知道', '不清楚', '不确定', '迷茫', '困惑', '卡住了', '没有头绪',
  '想不出', '想不通', '死循环', '重复', '一直在', '总是', '又是',
  // 英文死胡同模式
  "don't know", "not sure", "confused", "stuck", "no idea", "can't figure",
  "going in circles", "always", "keep doing", "repeat"
]

export class AIThoughtAnalyzer {
  // 分析单个想法
  static analyzeThought(thought: Thought): ThoughtAnalysis {
    const content = thought.content.toLowerCase()
    
    // 检测思维模式
    const pattern = this.detectThinkingPattern(content)
    
    // 情感分析
    const sentiment = this.analyzeSentiment(content)
    
    // 提取主题
    const themes = this.extractThemes(content)
    
    // 寻找连接
    const connections = this.findConnections(content)
    
    // 生成洞察
    const insights = this.generateInsights(content, pattern, sentiment)
    
    return {
      sentiment,
      themes,
      connections,
      insights,
      pattern
    }
  }

  // 检测思维模式
  private static detectThinkingPattern(content: string): ThinkingPattern {
    const scores = {
      creative: 0,
      analytical: 0,
      problemSolving: 0,
      reflective: 0,
      planning: 0
    }

    // 计算每种模式的得分
    Object.entries(PATTERN_KEYWORDS).forEach(([pattern, keywords]) => {
      keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          scores[pattern as keyof typeof scores] += 1
        }
      })
    })

    // 找到得分最高的模式
    const dominantPattern = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as keyof typeof scores

    // 生成建议
    const recommendations = this.generatePatternRecommendations(dominantPattern, content)

    return {
      type: dominantPattern,
      frequency: scores[dominantPattern],
      recentTrend: 'stable', // 这里需要历史数据来计算真实趋势
      recommendations
    }
  }

  // 情感分析
  private static analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    let positiveScore = 0
    let negativeScore = 0

    SENTIMENT_KEYWORDS.positive.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        positiveScore += 1
      }
    })

    SENTIMENT_KEYWORDS.negative.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        negativeScore += 1
      }
    })

    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  // 提取主题
  private static extractThemes(content: string): string[] {
    const themes: string[] = []
    
    // 检测学术/哲学主题
    if (/哲学|思考|存在|意义|人生|价值|真理|ethics|philosophy|meaning|existence/.test(content)) {
      themes.push('哲学思考')
    }
    
    // 检测学习主题
    if (/学习|知识|研究|理论|概念|learn|study|knowledge|research/.test(content)) {
      themes.push('学习成长')
    }
    
    // 检测人际关系主题
    if (/关系|朋友|家人|同学|老师|relationship|friend|family/.test(content)) {
      themes.push('人际关系')
    }
    
    // 检测情感主题
    if (/感受|情绪|心情|感觉|emotion|feeling|mood/.test(content)) {
      themes.push('情感体验')
    }

    // 检测未来规划主题
    if (/计划|目标|未来|梦想|career|goal|future|dream/.test(content)) {
      themes.push('未来规划')
    }

    return themes.length > 0 ? themes : ['日常思考']
  }

  // 寻找连接
  private static findConnections(content: string): string[] {
    const connections: string[] = []
    
    // 检测因果关系
    if (/因为|所以|导致|because|therefore|cause/.test(content)) {
      connections.push('因果关系')
    }
    
    // 检测对比关系
    if (/但是|然而|相比|对比|however|but|compare/.test(content)) {
      connections.push('对比分析')
    }
    
    // 检测时间关系
    if (/之前|之后|现在|未来|before|after|now|future/.test(content)) {
      connections.push('时间序列')
    }

    return connections
  }

  // 生成洞察
  private static generateInsights(content: string, pattern: ThinkingPattern, sentiment: string): string[] {
    const insights: string[] = []
    
    // 检测思维死胡同
    const hasDeadEndPattern = DEAD_END_PATTERNS.some(pattern => 
      content.includes(pattern.toLowerCase())
    )
    
    if (hasDeadEndPattern) {
      insights.push('🚨 检测到思维死胡同模式 - 建议换个角度思考')
    }
    
    // 基于思维模式的洞察
    switch (pattern.type) {
      case 'creative':
        insights.push('💡 创意思维活跃 - 可以记录更多具体的想法细节')
        break
      case 'analytical':
        insights.push('🔍 分析性思考 - 建议添加更多实际案例验证')
        break
      case 'reflective':
        insights.push('🪞 深度反思 - 这种自我觉察很有价值')
        break
      case 'problemSolving':
        insights.push('⚡ 问题解决模式 - 可以尝试分解成更小的步骤')
        break
      case 'planning':
        insights.push('📋 规划思维 - 建议设定具体的时间节点')
        break
    }
    
    // 基于情感的洞察
    if (sentiment === 'negative') {
      insights.push('💙 注意到一些负面情绪 - 记得关注自己的心理状态')
    } else if (sentiment === 'positive') {
      insights.push('✨ 积极的思维状态 - 继续保持这种良好的心态')
    }

    return insights
  }

  // 生成模式建议
  private static generatePatternRecommendations(pattern: string, _content: string): string[] {
    const recommendations: string[] = []
    
    switch (pattern) {
      case 'creative':
        recommendations.push('尝试画思维导图将创意可视化')
        recommendations.push('记录灵感的具体触发点')
        break
      case 'analytical':
        recommendations.push('添加数据或实例支持你的分析')
        recommendations.push('考虑反面观点增强论证')
        break
      case 'reflective':
        recommendations.push('定期回顾这些反思的进展')
        recommendations.push('将反思转化为具体行动')
        break
      case 'problemSolving':
        recommendations.push('尝试"五个为什么"深入挖掘根因')
        recommendations.push('考虑多种解决方案的优缺点')
        break
      case 'planning':
        recommendations.push('为每个计划设定可测量的目标')
        recommendations.push('考虑可能的风险和应对措施')
        break
    }

    return recommendations
  }

  // 批量分析多个想法，寻找模式
  static analyzeThinkingPatterns(thoughts: Thought[]): {
    dominantPatterns: ThinkingPattern[]
    insights: string[]
    deadEndWarnings: string[]
  } {
    if (thoughts.length === 0) {
      return { dominantPatterns: [], insights: [], deadEndWarnings: [] }
    }

    // 分析每个想法
    const analyses = thoughts.map(thought => this.analyzeThought(thought))
    
    // 统计思维模式频率
    const patternCounts = analyses.reduce((acc, analysis) => {
      const type = analysis.pattern?.type || 'reflective'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 生成整体洞察
    const overallInsights = this.generateOverallInsights(analyses, thoughts)
    
    // 检测思维死胡同
    const deadEndWarnings = this.detectDeadEndPatterns(thoughts)

    // 创建主导模式
    const dominantPatterns = Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, frequency]) => ({
        type: type as any,
        frequency,
        recentTrend: 'stable' as const,
        recommendations: this.generatePatternRecommendations(type, '')
      }))

    return {
      dominantPatterns,
      insights: overallInsights,
      deadEndWarnings
    }
  }

  // 生成整体洞察
  private static generateOverallInsights(analyses: ThoughtAnalysis[], thoughts: Thought[]): string[] {
    const insights: string[] = []
    
    // 计算思维活跃度
    const thoughtsToday = thoughts.filter(t => {
      const today = new Date()
      const thoughtDate = new Date(t.timestamp)
      return thoughtDate.toDateString() === today.toDateString()
    }).length

    if (thoughtsToday > 5) {
      insights.push(`🔥 今日思维很活跃，已记录${thoughtsToday}个想法`)
    }

    // 分析情感趋势
    const sentiments = analyses.map(a => a.sentiment)
    const positiveRatio = sentiments.filter(s => s === 'positive').length / sentiments.length
    
    if (positiveRatio > 0.7) {
      insights.push('😊 最近思维状态很积极，继续保持')
    } else if (positiveRatio < 0.3) {
      insights.push('💙 注意到一些负面思维，建议关注心理健康')
    }

    // 分析主题多样性
    const allThemes = analyses.flatMap(a => a.themes)
    const uniqueThemes = [...new Set(allThemes)]
    
    if (uniqueThemes.length > 3) {
      insights.push('🌈 思维主题很丰富，涵盖多个领域')
    }

    return insights
  }

  // 检测思维死胡同模式
  private static detectDeadEndPatterns(thoughts: Thought[]): string[] {
    const warnings: string[] = []
    
    // 检测重复内容
    const contents = thoughts.map(t => t.content.toLowerCase())
    const similarities = contents.some((content, i) => 
      contents.slice(i + 1).some(otherContent => 
        this.calculateSimilarity(content, otherContent) > 0.7
      )
    )
    
    if (similarities) {
      warnings.push('⚠️ 检测到重复的思维模式，可能陷入思维循环')
    }

    // 检测消极循环
    const recentThoughts = thoughts.slice(0, 5)
    const negativePattern = recentThoughts.every(t => 
      DEAD_END_PATTERNS.some(pattern => 
        t.content.toLowerCase().includes(pattern.toLowerCase())
      )
    )
    
    if (negativePattern && recentThoughts.length >= 3) {
      warnings.push('🔄 连续出现困惑/不确定的表达，建议寻求新的视角')
    }

    return warnings
  }

  // 计算文本相似度
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/)
    const words2 = text2.split(/\s+/)
    const intersection = words1.filter(word => words2.includes(word))
    return intersection.length / Math.max(words1.length, words2.length)
  }
}