// AI场景智能检测器
import { 
  AIScenario, 
  ThinkingContext, 
  ScenarioPattern,
  AIWorkStatus 
} from './types'
import { Thought } from '../../types'

export class ScenarioDetector {
  private patterns: ScenarioPattern[] = [
    // 快速分类场景
    {
      name: '文件分类',
      scenario: AIScenario.QUICK_CLASSIFICATION,
      textPatterns: [
        /整理|分类|归档|标签|文件|文档/i,
        /分组|排序|组织|管理/i
      ],
      contextCheckers: [
        (context) => context.currentThought.content.length < 100,
        (context) => this.hasListStructure(context.currentThought.content)
      ],
      semanticIndicators: ['organize', 'classify', 'sort', 'categorize'],
      weight: 0.8
    },
    
    // 内容总结场景
    {
      name: '内容总结',
      scenario: AIScenario.CONTENT_SUMMARIZATION,
      textPatterns: [
        /总结|概括|摘要|提炼|梳理/i,
        /重点|要点|核心|关键/i
      ],
      contextCheckers: [
        (context) => context.currentThought.content.length > 200,
        (context) => this.hasSourceReference(context.currentThought.content)
      ],
      semanticIndicators: ['summarize', 'digest', 'key points', 'overview'],
      weight: 0.85
    },
    
    // 深度洞察场景
    {
      name: '深度思考',
      scenario: AIScenario.DEEP_INSIGHT,
      textPatterns: [
        /为什么|怎样|如何|原因|本质/i,
        /深层|深度|深入|根本|底层/i,
        /洞察|理解|认识|看法|观点/i
      ],
      contextCheckers: [
        (context) => this.hasQuestionPattern(context.currentThought.content),
        (context) => this.hasPhilosophicalWords(context.currentThought.content),
        (context) => context.currentThought.content.length > 50
      ],
      semanticIndicators: ['insight', 'understanding', 'deeper', 'why', 'how'],
      weight: 0.9
    },
    
    // 哲学思辨场景
    {
      name: '哲学思辨',
      scenario: AIScenario.PHILOSOPHICAL_THINKING,
      textPatterns: [
        /存在|意义|价值|道德|伦理/i,
        /人生|生命|死亡|永恒|真理/i,
        /正义|善恶|美丑|自由|责任/i
      ],
      contextCheckers: [
        (context) => this.hasPhilosophicalConcepts(context.currentThought.content),
        (context) => this.hasAbstractThinking(context.currentThought.content)
      ],
      semanticIndicators: ['meaning', 'existence', 'truth', 'philosophy', 'ethics'],
      weight: 0.95
    },
    
    // 创意灵感场景
    {
      name: '创意思维',
      scenario: AIScenario.CREATIVE_INSPIRATION,
      textPatterns: [
        /创意|灵感|想法|点子|创新/i,
        /设计|构思|创作|发明|突破/i,
        /新颖|独特|有趣|创造性/i
      ],
      contextCheckers: [
        (context) => this.hasCreativeWords(context.currentThought.content),
        (context) => this.hasIdeaGenerationPattern(context.currentThought.content)
      ],
      semanticIndicators: ['creative', 'idea', 'innovation', 'inspiration', 'design'],
      weight: 0.8
    },
    
    // 问题解决场景
    {
      name: '问题解决',
      scenario: AIScenario.COMPLEX_REASONING,
      textPatterns: [
        /问题|困难|挑战|障碍|瓶颈/i,
        /解决|方案|对策|办法|策略/i,
        /分析|推理|逻辑|步骤|方法/i
      ],
      contextCheckers: [
        (context) => this.hasProblemSolvingPattern(context.currentThought.content),
        (context) => this.hasStepByStepThinking(context.currentThought.content)
      ],
      semanticIndicators: ['problem', 'solution', 'strategy', 'method', 'approach'],
      weight: 0.85
    },
    
    // 搜索优化场景
    {
      name: '搜索查询',
      scenario: AIScenario.SEARCH_OPTIMIZATION,
      textPatterns: [
        /搜索|查找|寻找|检索|查询/i,
        /关键词|搜索词|查询条件/i
      ],
      contextCheckers: [
        (context) => this.hasSearchIntent(context.currentThought.content),
        (context) => context.currentThought.content.length < 150
      ],
      semanticIndicators: ['search', 'find', 'lookup', 'query', 'keywords'],
      weight: 0.7
    },
    
    // 知识关联场景
    {
      name: '知识关联',
      scenario: AIScenario.KNOWLEDGE_LINKING,
      textPatterns: [
        /关联|联系|关系|连接|相关/i,
        /类似|相似|对比|区别|比较/i,
        /启发|借鉴|参考|联想/i
      ],
      contextCheckers: [
        (context) => this.hasConnectionWords(context.currentThought.content),
        (context) => context.recentThoughts.length > 5
      ],
      semanticIndicators: ['relate', 'connect', 'similar', 'association', 'link'],
      weight: 0.75
    },
    
    // 实时分析场景
    {
      name: '实时分析',
      scenario: AIScenario.LIVE_ANALYSIS,
      textPatterns: [
        /现在|当前|此刻|正在/i,
        /快速|立即|马上|及时/i
      ],
      contextCheckers: [
        (context) => context.currentThought.content.length > 20 && context.currentThought.content.length < 200,
        (context) => this.isRealTimeContext(context)
      ],
      semanticIndicators: ['now', 'current', 'immediate', 'quick', 'real-time'],
      weight: 0.6
    }
  ]

  // 主要检测方法
  async detect(thought: Thought, context?: Partial<ThinkingContext>): Promise<AIScenario> {
    const fullContext = this.buildContext(thought, context)
    
    // 1. 基于模式的快速检测
    const patternScores = this.calculatePatternScores(thought.content, fullContext)
    
    // 2. 上下文感知调整
    const contextAdjustedScores = this.adjustForContext(patternScores, fullContext)
    
    // 3. 选择最佳场景
    const selectedScenario = this.selectBestScenario(contextAdjustedScores)
    
    // 4. 置信度验证
    const confidence = this.calculateConfidence(selectedScenario, contextAdjustedScores)
    
    // 如果置信度太低，使用通用场景
    if (confidence < 0.6) {
      return AIScenario.GENERAL_THINKING
    }
    
    return selectedScenario
  }

  // 实时场景检测（轻量级）
  detectQuick(content: string): AIScenario {
    // 使用简化的模式匹配进行快速检测
    for (const pattern of this.patterns) {
      let score = 0
      
      // 检查文本模式
      for (const regex of pattern.textPatterns) {
        if (regex.test(content)) {
          score += pattern.weight
        }
      }
      
      // 简单的长度和结构检查
      if (content.length < 50 && pattern.scenario === AIScenario.QUICK_CLASSIFICATION) {
        score += 0.3
      }
      if (content.length > 200 && pattern.scenario === AIScenario.CONTENT_SUMMARIZATION) {
        score += 0.3
      }
      if (this.hasQuestionPattern(content) && pattern.scenario === AIScenario.DEEP_INSIGHT) {
        score += 0.4
      }
      
      if (score > 0.8) {
        return pattern.scenario
      }
    }
    
    return AIScenario.LIVE_ANALYSIS
  }

  // 批量场景检测
  async detectBatch(thoughts: Thought[]): Promise<Map<string, AIScenario>> {
    const results = new Map<string, AIScenario>()
    
    for (const thought of thoughts) {
      const scenario = await this.detect(thought)
      results.set(thought.id, scenario)
    }
    
    return results
  }

  // 私有辅助方法
  private buildContext(thought: Thought, partialContext?: Partial<ThinkingContext>): ThinkingContext {
    const now = new Date()
    const hour = now.getHours()
    
    return {
      currentThought: thought,
      recentThoughts: [],
      userPreferences: {
        preferredAIs: {},
        speedVsQuality: 'balanced',
        costSensitivity: 'medium',
        privacyConcern: 'medium',
        experienceLevel: 'intermediate'
      },
      sessionHistory: {
        startTime: now,
        thoughtCount: 1,
        dominantScenarios: [],
        aiPerformanceHistory: []
      },
      timeOfDay: hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night',
      ...partialContext
    }
  }

  private calculatePatternScores(content: string, context: ThinkingContext): Map<AIScenario, number> {
    const scores = new Map<AIScenario, number>()
    
    for (const pattern of this.patterns) {
      let score = 0
      
      // 文本模式匹配
      for (const regex of pattern.textPatterns) {
        if (regex.test(content)) {
          score += pattern.weight * 0.4
        }
      }
      
      // 上下文检查
      for (const checker of pattern.contextCheckers) {
        if (checker(context)) {
          score += pattern.weight * 0.3
        }
      }
      
      // 语义指标检查
      const lowerContent = content.toLowerCase()
      for (const indicator of pattern.semanticIndicators) {
        if (lowerContent.includes(indicator)) {
          score += pattern.weight * 0.2
        }
      }
      
      scores.set(pattern.scenario, score)
    }
    
    return scores
  }

  private adjustForContext(scores: Map<AIScenario, number>, context: ThinkingContext): Map<AIScenario, number> {
    const adjusted = new Map(scores)
    
    // 根据时间调整
    if (context.timeOfDay === 'morning') {
      // 早晨更适合规划和深度思考
      adjusted.set(AIScenario.STRATEGIC_PLANNING, (adjusted.get(AIScenario.STRATEGIC_PLANNING) || 0) + 0.1)
      adjusted.set(AIScenario.DEEP_INSIGHT, (adjusted.get(AIScenario.DEEP_INSIGHT) || 0) + 0.1)
    } else if (context.timeOfDay === 'evening') {
      // 晚上更适合反思和总结
      adjusted.set(AIScenario.CONTENT_SUMMARIZATION, (adjusted.get(AIScenario.CONTENT_SUMMARIZATION) || 0) + 0.1)
      adjusted.set(AIScenario.PHILOSOPHICAL_THINKING, (adjusted.get(AIScenario.PHILOSOPHICAL_THINKING) || 0) + 0.1)
    }
    
    // 根据用户偏好调整
    if (context.userPreferences.speedVsQuality === 'speed') {
      // 提升快速场景的分数
      adjusted.set(AIScenario.QUICK_CLASSIFICATION, (adjusted.get(AIScenario.QUICK_CLASSIFICATION) || 0) + 0.2)
      adjusted.set(AIScenario.LIVE_ANALYSIS, (adjusted.get(AIScenario.LIVE_ANALYSIS) || 0) + 0.2)
    } else if (context.userPreferences.speedVsQuality === 'quality') {
      // 提升高质量场景的分数
      adjusted.set(AIScenario.DEEP_INSIGHT, (adjusted.get(AIScenario.DEEP_INSIGHT) || 0) + 0.2)
      adjusted.set(AIScenario.PHILOSOPHICAL_THINKING, (adjusted.get(AIScenario.PHILOSOPHICAL_THINKING) || 0) + 0.2)
    }
    
    return adjusted
  }

  private selectBestScenario(scores: Map<AIScenario, number>): AIScenario {
    let bestScenario = AIScenario.GENERAL_THINKING
    let bestScore = 0
    
    for (const [scenario, score] of scores) {
      if (score > bestScore) {
        bestScore = score
        bestScenario = scenario
      }
    }
    
    return bestScenario
  }

  private calculateConfidence(scenario: AIScenario, scores: Map<AIScenario, number>): number {
    const selectedScore = scores.get(scenario) || 0
    const allScores = Array.from(scores.values()).sort((a, b) => b - a)
    
    if (allScores.length < 2) return selectedScore
    
    const secondBest = allScores[1]
    const difference = selectedScore - secondBest
    
    // 归一化置信度
    return Math.min(selectedScore + difference * 0.3, 1.0)
  }

  // 内容模式检测方法
  private hasQuestionPattern(content: string): boolean {
    const questionPatterns = [
      /[？?]/, // 问号
      /^(为什么|怎样|如何|什么|哪里|何时|谁)/, // 疑问词开头
      /(原因是什么|怎么办|如何解决)/
    ]
    return questionPatterns.some(pattern => pattern.test(content))
  }

  private hasPhilosophicalWords(content: string): boolean {
    const philosophicalWords = [
      '存在', '意义', '价值', '本质', '真理', '自由', '责任', '道德', '伦理',
      '正义', '善恶', '美丑', '人生', '生命', '死亡', '永恒', '时间', '空间'
    ]
    return philosophicalWords.some(word => content.includes(word))
  }

  private hasPhilosophicalConcepts(content: string): boolean {
    const concepts = ['存在主义', '唯物主义', '理想主义', '功利主义', '人道主义']
    return concepts.some(concept => content.includes(concept))
  }

  private hasAbstractThinking(content: string): boolean {
    const abstractWords = ['抽象', '概念', '理论', '思想', '观念', '精神', '意识']
    return abstractWords.some(word => content.includes(word))
  }

  private hasCreativeWords(content: string): boolean {
    const creativeWords = [
      '创意', '灵感', '想法', '点子', '创新', '设计', '构思', '创作',
      '发明', '突破', '新颖', '独特', '有趣', '创造性', '艺术'
    ]
    return creativeWords.some(word => content.includes(word))
  }

  private hasIdeaGenerationPattern(content: string): boolean {
    const patterns = [
      /我想到了/, /突然想到/, /灵光一闪/, /有个想法/, /想起来了/
    ]
    return patterns.some(pattern => pattern.test(content))
  }

  private hasProblemSolvingPattern(content: string): boolean {
    const patterns = [
      /问题是/, /需要解决/, /怎么办/, /解决方案/, /对策/,
      /方法/, /策略/, /步骤/, /流程/, /计划/
    ]
    return patterns.some(pattern => pattern.test(content))
  }

  private hasStepByStepThinking(content: string): boolean {
    const patterns = [
      /第一|首先|然后|接下来|最后/, /步骤/, /阶段/, /过程/,
      /先.*再.*后/, /1\.|2\.|3\./, /一、|二、|三、/
    ]
    return patterns.some(pattern => pattern.test(content))
  }

  private hasSearchIntent(content: string): boolean {
    const searchWords = ['搜索', '查找', '寻找', '检索', '查询', '搜一下', '百度', '谷歌']
    return searchWords.some(word => content.includes(word))
  }

  private hasConnectionWords(content: string): boolean {
    const connectionWords = [
      '关联', '联系', '关系', '连接', '相关', '类似', '相似',
      '对比', '区别', '比较', '启发', '借鉴', '参考', '联想'
    ]
    return connectionWords.some(word => content.includes(word))
  }

  private hasListStructure(content: string): boolean {
    const listPatterns = [
      /1\.|2\.|3\./, /一、|二、|三、/, /\n.*\n.*\n/, /[，,].*[，,].*[，,]/
    ]
    return listPatterns.some(pattern => pattern.test(content))
  }

  private hasSourceReference(content: string): boolean {
    const sourcePatterns = [
      /来源|出处|引用|参考/, /根据.*说/, /.*提到/, /书中|文章中|报告中/
    ]
    return sourcePatterns.some(pattern => pattern.test(content))
  }

  private isRealTimeContext(context: ThinkingContext): boolean {
    // 检查是否是实时分析上下文
    const now = new Date()
    const timeSinceStart = now.getTime() - context.sessionHistory.startTime.getTime()
    return timeSinceStart < 60000 // 1分钟内认为是实时上下文
  }
}

// 单例导出
export const scenarioDetector = new ScenarioDetector()