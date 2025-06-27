// 思维链接AI引擎 - 自动发现和管理思想连接
import { 
  ConnectionType, 
  ConnectionStrength, 
  EnhancedConnection, 
  ConnectionSuggestion,
  ConnectionAnalysisResult,
  ThoughtNetwork,
  LinkingTask,
  ConnectedAnswer,
  SemanticSimilarity,
  LinkingConfig,
  ConnectionInsight,
  NetworkAnalysis
} from './types'
import { Thought } from '../../types'
import { KnowledgeItem } from '../../types/knowledge'
import { aiOrchestrator, AIScenario } from '../orchestrator'

export class ThoughtLinkingEngine {
  private config: LinkingConfig
  private activeConnections = new Map<string, EnhancedConnection>()
  private taskQueue: LinkingTask[] = []
  private isProcessing = false
  private listeners = new Set<(result: ConnectionAnalysisResult) => void>()

  constructor(config: Partial<LinkingConfig> = {}) {
    this.config = {
      enableAILinking: true,
      aiProviders: ['zhipu', 'openai', 'gemini'],
      confidenceThreshold: 0.6,
      enabledConnectionTypes: Object.values(ConnectionType),
      typeWeights: this.getDefaultTypeWeights(),
      maxConnectionsPerThought: 10,
      timeWindowDays: 30,
      semanticSimilarityThreshold: 0.7,
      batchSize: 50,
      parallelProcessing: true,
      cacheResults: true,
      userPreferences: {
        preferExplicitConnections: false,
        showWeakConnections: true,
        autoVerifyConnections: true,
        prioritizeRecentThoughts: true
      },
      ...config
    }
    
    this.loadExistingConnections()
  }

  // 主要方法：自动发现连接
  async discoverConnections(thoughts: Thought[]): Promise<ConnectionAnalysisResult> {
    const task = this.createLinkingTask('batch', thoughts)
    return await this.processLinkingTask(task)
  }

  // 实时连接建议
  async suggestConnections(currentThought: Thought, recentThoughts: Thought[]): Promise<ConnectionSuggestion[]> {
    try {
      const suggestions: ConnectionSuggestion[] = []
      
      // 1. 语义相似性分析
      const semanticSuggestions = await this.findSemanticConnections(currentThought, recentThoughts)
      suggestions.push(...semanticSuggestions)
      
      // 2. 时序关系分析
      const temporalSuggestions = this.findTemporalConnections(currentThought, recentThoughts)
      suggestions.push(...temporalSuggestions)
      
      // 3. 主题关联分析
      const thematicSuggestions = await this.findThematicConnections(currentThought, recentThoughts)
      suggestions.push(...thematicSuggestions)
      
      // 4. 问题-解答关联
      const qaSuggestions = this.findQuestionAnswerConnections(currentThought, recentThoughts)
      suggestions.push(...qaSuggestions)
      
      // 排序和过滤
      return this.rankAndFilterSuggestions(suggestions)
      
    } catch (error) {
      console.error('连接建议生成失败:', error)
      return []
    }
  }

  // 智能问答基于连接
  async answerBasedOnConnections(question: string, thoughts: Thought[]): Promise<ConnectedAnswer> {
    try {
      // 1. 找到与问题相关的思想
      const relevantThoughts = await this.findRelevantThoughts(question, thoughts)
      
      // 2. 分析相关思想的连接
      const connections = this.getConnectionsForThoughts(relevantThoughts.map(t => t.id))
      
      // 3. 使用AI生成基于连接的答案
      const answer = await this.generateConnectedAnswer(question, relevantThoughts, connections)
      
      return answer
      
    } catch (error) {
      console.error('基于连接的问答失败:', error)
      return {
        answer: '抱歉，无法基于现有思想连接回答这个问题。',
        confidence: 0,
        sources: [],
        connections: [],
        followUpQuestions: [],
        relatedConcepts: []
      }
    }
  }

  // 构建知识图谱
  async buildKnowledgeGraph(thoughts: Thought[], knowledgeItems: KnowledgeItem[]): Promise<ThoughtNetwork> {
    try {
      // 1. 创建节点
      const nodes = await this.createNetworkNodes(thoughts, knowledgeItems)
      
      // 2. 发现连接
      const connections = await this.discoverAllConnections(thoughts)
      
      // 3. 创建边
      const edges = this.createNetworkEdges(connections.newConnections)
      
      // 4. 分析网络结构
      const metadata = this.analyzeNetworkStructure(nodes, edges)
      
      return {
        nodes,
        edges,
        metadata
      }
      
    } catch (error) {
      console.error('知识图谱构建失败:', error)
      throw error
    }
  }

  // 增量更新连接
  async updateConnections(newThought: Thought, existingThoughts: Thought[]): Promise<EnhancedConnection[]> {
    try {
      // 只分析新思想与现有思想的连接
      const candidates = existingThoughts
        .filter(t => this.isWithinTimeWindow(t))
        .slice(0, this.config.maxConnectionsPerThought)
      
      const newConnections: EnhancedConnection[] = []
      
      for (const candidate of candidates) {
        const connection = await this.analyzeConnectionBetween(newThought, candidate)
        if (connection && connection.confidence >= this.config.confidenceThreshold) {
          newConnections.push(connection)
          this.activeConnections.set(connection.id, connection)
        }
      }
      
      // 保存新连接
      this.saveConnections(newConnections)
      
      return newConnections
      
    } catch (error) {
      console.error('增量连接更新失败:', error)
      return []
    }
  }

  // 网络分析
  async analyzeNetwork(thoughts: Thought[]): Promise<NetworkAnalysis> {
    try {
      const network = await this.buildKnowledgeGraph(thoughts, [])
      
      // 计算网络指标
      const overview = this.calculateNetworkOverview(network)
      const centralNodes = this.identifyCentralNodes(network)
      const communities = this.detectCommunities(network)
      const insights = this.generateNetworkInsights(network, centralNodes, communities)
      
      return {
        overview,
        centralNodes,
        communities,
        insights
      }
      
    } catch (error) {
      console.error('网络分析失败:', error)
      throw error
    }
  }

  // 连接验证
  async verifyConnections(connections: EnhancedConnection[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    
    for (const connection of connections) {
      try {
        const isValid = await this.verifyConnection(connection)
        results.set(connection.id, isValid)
        
        // 更新连接的验证计数
        connection.metadata.verificationCount++
        connection.metadata.lastVerified = new Date()
        
      } catch (error) {
        console.error(`连接验证失败 ${connection.id}:`, error)
        results.set(connection.id, false)
      }
    }
    
    return results
  }

  // 获取连接统计
  getConnectionStats(): {
    total: number
    byType: { [type: string]: number }
    byStrength: { [strength: string]: number }
    recentActivity: number
    topConnectedThoughts: string[]
  } {
    const connections = Array.from(this.activeConnections.values())
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const byType: { [type: string]: number } = {}
    const byStrength: { [strength: string]: number } = {}
    const thoughtConnections: { [thoughtId: string]: number } = {}
    
    connections.forEach(conn => {
      // 按类型统计
      byType[conn.type] = (byType[conn.type] || 0) + 1
      
      // 按强度统计
      const strength = this.getStrengthCategory(conn.strength)
      byStrength[strength] = (byStrength[strength] || 0) + 1
      
      // 统计每个思想的连接数
      thoughtConnections[conn.fromThoughtId] = (thoughtConnections[conn.fromThoughtId] || 0) + 1
      thoughtConnections[conn.toThoughtId] = (thoughtConnections[conn.toThoughtId] || 0) + 1
    })
    
    const recentActivity = connections.filter(conn => 
      conn.metadata.createdAt > oneDayAgo
    ).length
    
    const topConnectedThoughts = Object.entries(thoughtConnections)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([thoughtId]) => thoughtId)
    
    return {
      total: connections.length,
      byType,
      byStrength,
      recentActivity,
      topConnectedThoughts
    }
  }

  // 事件监听
  addConnectionListener(listener: (result: ConnectionAnalysisResult) => void): void {
    this.listeners.add(listener)
  }

  removeConnectionListener(listener: (result: ConnectionAnalysisResult) => void): void {
    this.listeners.delete(listener)
  }

  // 私有方法
  private async processLinkingTask(task: LinkingTask): Promise<ConnectionAnalysisResult> {
    task.status = 'running'
    task.metadata.startedAt = new Date()
    
    try {
      // 1. 预处理思想
      const thoughts = this.preprocessThoughts(task.input.thoughts)
      
      // 2. 并行发现连接
      const newConnections = await this.discoverAllConnections(thoughts)
      
      // 3. 生成建议
      const suggestions = await this.generateConnectionSuggestions(thoughts, newConnections.newConnections)
      
      // 4. 生成洞察
      const insights = this.generateConnectionInsights(newConnections.newConnections, thoughts)
      
      // 5. 识别模式
      const patterns = this.identifyConnectionPatterns(newConnections.newConnections)
      
      // 6. 计算指标
      const metrics = this.calculateConnectionMetrics(newConnections.newConnections, thoughts)
      
      const result: ConnectionAnalysisResult = {
        newConnections: newConnections.newConnections,
        suggestions,
        insights,
        patterns,
        metrics
      }
      
      task.output = result
      task.status = 'completed'
      task.metadata.completedAt = new Date()
      task.metadata.processingTime = task.metadata.completedAt.getTime() - task.metadata.startedAt!.getTime()
      
      // 通知监听器
      this.notifyListeners(result)
      
      return result
      
    } catch (error) {
      task.status = 'failed'
      task.metadata.error = (error as Error).message
      throw error
    }
  }

  private async discoverAllConnections(thoughts: Thought[]): Promise<{ newConnections: EnhancedConnection[] }> {
    const newConnections: EnhancedConnection[] = []
    
    // 使用不同的AI提供商并行分析
    const batches = this.createAnalysisBatches(thoughts)
    
    for (const batch of batches) {
      const batchConnections = await this.processBatch(batch)
      newConnections.push(...batchConnections)
    }
    
    // 去重和合并
    const uniqueConnections = this.deduplicateConnections(newConnections)
    
    return { newConnections: uniqueConnections }
  }

  private async processBatch(thoughts: Thought[]): Promise<EnhancedConnection[]> {
    const connections: EnhancedConnection[] = []
    
    // 两两分析思想间的连接
    for (let i = 0; i < thoughts.length; i++) {
      for (let j = i + 1; j < thoughts.length; j++) {
        const connection = await this.analyzeConnectionBetween(thoughts[i], thoughts[j])
        if (connection && connection.confidence >= this.config.confidenceThreshold) {
          connections.push(connection)
        }
      }
    }
    
    return connections
  }

  private async analyzeConnectionBetween(thought1: Thought, thought2: Thought): Promise<EnhancedConnection | null> {
    try {
      // 使用AI编排系统进行连接分析
      const analysisContent = `分析以下两个想法之间的关系：
        
想法1（${thought1.timestamp.toISOString()}）：
"${thought1.content}"

想法2（${thought2.timestamp.toISOString()}）：
"${thought2.content}"

请分析它们之间是否存在以下类型的关系：
- 因果关系 (causal)
- 相似关系 (similar)  
- 矛盾关系 (contradictory)
- 支持关系 (supporting)
- 时序关系 (sequential)
- 问题-解答关系 (question_answer)
- 启发关系 (inspiration)

如果存在关系，请返回JSON格式：
{
  "hasConnection": true,
  "type": "关系类型",
  "strength": 0.8,
  "confidence": 0.9,
  "reasoning": "详细的分析原因",
  "keyWords": ["关键词1", "关键词2"],
  "bidirectional": false
}`

      // 创建临时思想对象用于AI分析
      const analysisThought: Thought = {
        id: `analysis_${thought1.id}_${thought2.id}`,
        content: analysisContent,
        timestamp: new Date(),
        tags: [],
        category: 'analysis'
      }
      
      // 使用编排系统分析
      const result = await aiOrchestrator.processThought(analysisThought, {
        userPreferences: {
          preferredAIs: { [AIScenario.RELATIONSHIP_DETECTION]: ['zhipu'] },
          speedVsQuality: 'quality',
          costSensitivity: 'medium',
          privacyConcern: 'medium',
          experienceLevel: 'advanced'
        }
      })
      
      // 解析AI返回的结果
      const aiResponse = this.parseAIConnectionResponse(result)
      
      if (aiResponse && aiResponse.hasConnection) {
        return this.createConnection(thought1, thought2, aiResponse)
      }
      
      return null
      
    } catch (error) {
      console.error('连接分析失败:', error)
      return null
    }
  }

  private parseAIConnectionResponse(result: any): any {
    try {
      // 尝试从AI结果中提取连接信息
      const content = result.synthesizedResult?.primaryInsight || ''
      
      // 寻找JSON格式的响应
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // 如果没有JSON，尝试解析文本
      return this.parseTextConnectionResponse(content)
      
    } catch (error) {
      console.error('AI响应解析失败:', error)
      return null
    }
  }

  private parseTextConnectionResponse(content: string): any {
    // 简单的文本解析逻辑
    const hasConnection = /存在|有关系|相关/.test(content)
    if (!hasConnection) return null
    
    let type = ConnectionType.SIMILAR
    let strength = 0.5
    
    // 识别关系类型
    if (/因果|导致|原因/.test(content)) type = ConnectionType.CAUSAL
    else if (/矛盾|冲突|相反/.test(content)) type = ConnectionType.CONTRADICTORY
    else if (/支持|赞同|补充/.test(content)) type = ConnectionType.SUPPORTING
    else if (/时间|先后|接着/.test(content)) type = ConnectionType.SEQUENTIAL
    else if (/启发|灵感|想到/.test(content)) type = ConnectionType.INSPIRATION
    else if (/问题|答案|解决/.test(content)) type = ConnectionType.QUESTION_ANSWER
    
    // 估算强度
    if (/强烈|明显|很大/.test(content)) strength = 0.8
    else if (/轻微|一点|略微/.test(content)) strength = 0.3
    
    return {
      hasConnection: true,
      type,
      strength,
      confidence: 0.6,
      reasoning: content,
      keyWords: [],
      bidirectional: false
    }
  }

  private createConnection(thought1: Thought, thought2: Thought, aiResponse: any): EnhancedConnection {
    const connectionId = this.generateConnectionId(thought1.id, thought2.id)
    
    return {
      id: connectionId,
      fromThoughtId: thought1.id,
      toThoughtId: thought2.id,
      type: aiResponse.type,
      strength: aiResponse.strength,
      confidence: aiResponse.confidence,
      
      metadata: {
        createdAt: new Date(),
        lastVerified: new Date(),
        detectionMethod: 'ai',
        aiProvider: 'zhipu',
        verificationCount: 1
      },
      
      explanation: {
        reasoning: aiResponse.reasoning,
        keyWords: aiResponse.keyWords || [],
        contextualFactors: [],
        examples: []
      },
      
      properties: {
        bidirectional: aiResponse.bidirectional || false,
        temporal: this.isTemporalConnection(aiResponse.type),
        contextDependent: true,
        strengthDecay: false
      },
      
      visualization: {
        color: this.getConnectionColor(aiResponse.type),
        style: this.getConnectionStyle(aiResponse.strength),
        weight: aiResponse.strength * 5,
        curvature: 0.3
      }
    }
  }

  private async findSemanticConnections(thought: Thought, candidates: Thought[]): Promise<ConnectionSuggestion[]> {
    const suggestions: ConnectionSuggestion[] = []
    
    for (const candidate of candidates) {
      const similarity = await this.calculateSemanticSimilarity(thought, candidate)
      
      if (similarity.similarity >= this.config.semanticSimilarityThreshold) {
        suggestions.push({
          fromThoughtId: thought.id,
          toThoughtId: candidate.id,
          type: ConnectionType.SIMILAR,
          strength: similarity.similarity,
          confidence: 0.8,
          explanation: {
            reasoning: `语义相似度: ${similarity.similarity.toFixed(2)}`,
            keyWords: similarity.sharedConcepts,
            contextualFactors: ['语义分析'],
            examples: []
          },
          properties: {
            bidirectional: true,
            temporal: false,
            contextDependent: false,
            strengthDecay: false
          },
          visualization: {
            color: '#4CAF50',
            style: 'solid',
            weight: similarity.similarity * 3
          },
          priority: similarity.similarity > 0.9 ? 'high' : 'medium',
          actionable: true,
          suggestedActions: ['建立语义连接', '标记相关主题'],
          relatedSuggestions: []
        })
      }
    }
    
    return suggestions
  }

  private findTemporalConnections(thought: Thought, candidates: Thought[]): ConnectionSuggestion[] {
    const suggestions: ConnectionSuggestion[] = []
    
    candidates.forEach(candidate => {
      const timeDiff = Math.abs(thought.timestamp.getTime() - candidate.timestamp.getTime())
      const hoursDiff = timeDiff / (1000 * 60 * 60)
      
      // 如果在24小时内，可能有时序关系
      if (hoursDiff <= 24) {
        const strength = Math.max(0.3, 1 - hoursDiff / 24)
        
        suggestions.push({
          fromThoughtId: candidate.id,
          toThoughtId: thought.id,
          type: ConnectionType.SEQUENTIAL,
          strength,
          confidence: 0.7,
          explanation: {
            reasoning: `时间间隔: ${hoursDiff.toFixed(1)}小时`,
            keyWords: ['时序关系'],
            contextualFactors: ['时间接近'],
            examples: []
          },
          properties: {
            bidirectional: false,
            temporal: true,
            contextDependent: true,
            strengthDecay: true
          },
          visualization: {
            color: '#FF9800',
            style: 'dashed',
            weight: strength * 2
          },
          priority: strength > 0.7 ? 'medium' : 'low',
          actionable: true,
          suggestedActions: ['建立时序连接'],
          relatedSuggestions: []
        })
      }
    })
    
    return suggestions
  }

  private async findThematicConnections(thought: Thought, candidates: Thought[]): Promise<ConnectionSuggestion[]> {
    const suggestions: ConnectionSuggestion[] = []
    const thoughtThemes = this.extractThemes(thought.content)
    
    for (const candidate of candidates) {
      const candidateThemes = this.extractThemes(candidate.content)
      const sharedThemes = thoughtThemes.filter(theme => candidateThemes.includes(theme))
      
      if (sharedThemes.length > 0) {
        const strength = Math.min(0.9, sharedThemes.length / Math.max(thoughtThemes.length, candidateThemes.length))
        
        suggestions.push({
          fromThoughtId: thought.id,
          toThoughtId: candidate.id,
          type: ConnectionType.SIMILAR,
          strength,
          confidence: 0.75,
          explanation: {
            reasoning: `共享主题: ${sharedThemes.join(', ')}`,
            keyWords: sharedThemes,
            contextualFactors: ['主题相关'],
            examples: []
          },
          properties: {
            bidirectional: true,
            temporal: false,
            contextDependent: false,
            strengthDecay: false
          },
          visualization: {
            color: '#2196F3',
            style: 'solid',
            weight: strength * 3
          },
          priority: strength > 0.6 ? 'high' : 'medium',
          actionable: true,
          suggestedActions: ['建立主题连接', '创建主题标签'],
          relatedSuggestions: []
        })
      }
    }
    
    return suggestions
  }

  private findQuestionAnswerConnections(thought: Thought, candidates: Thought[]): ConnectionSuggestion[] {
    const suggestions: ConnectionSuggestion[] = []
    const isQuestion = this.isQuestion(thought.content)
    
    if (isQuestion) {
      candidates.forEach(candidate => {
        if (this.mightBeAnswer(thought.content, candidate.content)) {
          suggestions.push({
            fromThoughtId: thought.id,
            toThoughtId: candidate.id,
            type: ConnectionType.QUESTION_ANSWER,
            strength: 0.8,
            confidence: 0.7,
            explanation: {
              reasoning: '检测到问题-答案模式',
              keyWords: ['问题', '答案'],
              contextualFactors: ['问答模式'],
              examples: []
            },
            properties: {
              bidirectional: false,
              temporal: false,
              contextDependent: true,
              strengthDecay: false
            },
            visualization: {
              color: '#9C27B0',
              style: 'solid',
              weight: 4
            },
            priority: 'high',
            actionable: true,
            suggestedActions: ['建立问答连接'],
            relatedSuggestions: []
          })
        }
      })
    }
    
    return suggestions
  }

  // 辅助方法
  private async calculateSemanticSimilarity(thought1: Thought, thought2: Thought): Promise<SemanticSimilarity> {
    // 简化的语义相似度计算
    const words1 = this.tokenize(thought1.content)
    const words2 = this.tokenize(thought2.content)
    
    const intersection = words1.filter(word => words2.includes(word))
    const union = [...new Set([...words1, ...words2])]
    
    const similarity = intersection.length / union.length
    
    return {
      thought1Id: thought1.id,
      thought2Id: thought2.id,
      similarity,
      sharedConcepts: intersection,
      semanticDistance: 1 - similarity,
      contextualRelevance: similarity
    }
  }

  private extractThemes(content: string): string[] {
    // 简单的主题提取
    const themes = content.match(/[\u4e00-\u9fa5a-zA-Z]{2,}/g) || []
    return [...new Set(themes)].slice(0, 5)
  }

  private tokenize(content: string): string[] {
    return content.match(/[\u4e00-\u9fa5a-zA-Z]{2,}/g) || []
  }

  private isQuestion(content: string): boolean {
    return /[？?]/.test(content) || /^(为什么|怎样|如何|什么|哪里|何时|谁)/.test(content)
  }

  private mightBeAnswer(question: string, answer: string): boolean {
    // 简单的问答匹配逻辑
    const questionKeywords = this.extractThemes(question)
    const answerKeywords = this.extractThemes(answer)
    
    return questionKeywords.some(keyword => answerKeywords.includes(keyword))
  }

  // 更多私有方法...
  private createAnalysisBatches(thoughts: Thought[]): Thought[][] {
    const batches: Thought[][] = []
    const batchSize = this.config.batchSize
    
    for (let i = 0; i < thoughts.length; i += batchSize) {
      batches.push(thoughts.slice(i, i + batchSize))
    }
    
    return batches
  }

  private deduplicateConnections(connections: EnhancedConnection[]): EnhancedConnection[] {
    const seen = new Set<string>()
    const unique: EnhancedConnection[] = []
    
    connections.forEach(conn => {
      const key = `${conn.fromThoughtId}-${conn.toThoughtId}-${conn.type}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(conn)
      }
    })
    
    return unique
  }

  private generateConnectionId(thought1Id: string, thought2Id: string): string {
    return `conn_${thought1Id}_${thought2Id}_${Date.now()}`
  }

  private getDefaultTypeWeights(): { [type in ConnectionType]: number } {
    return {
      [ConnectionType.CAUSAL]: 1.0,
      [ConnectionType.SIMILAR]: 0.8,
      [ConnectionType.SUPPORTING]: 0.9,
      [ConnectionType.CONTRADICTORY]: 0.7,
      [ConnectionType.SEQUENTIAL]: 0.6,
      [ConnectionType.QUESTION_ANSWER]: 1.0,
      [ConnectionType.INSPIRATION]: 0.8,
      [ConnectionType.COMPLEMENTARY]: 0.7,
      [ConnectionType.ELABORATION]: 0.6,
      [ConnectionType.GENERALIZATION]: 0.5,
      [ConnectionType.ANALOGY]: 0.6,
      [ConnectionType.METAPHOR]: 0.5,
      [ConnectionType.PROBLEM_SOLUTION]: 0.9,
      [ConnectionType.HYPOTHESIS_EVIDENCE]: 0.8,
      [ConnectionType.CONCEPT_INSTANCE]: 0.7,
      [ConnectionType.PART_WHOLE]: 0.6,
      [ConnectionType.CATEGORY_MEMBER]: 0.5,
      [ConnectionType.MOOD_INFLUENCED]: 0.4,
      [ConnectionType.EMOTIONAL_RESONANCE]: 0.5,
      [ConnectionType.BEFORE_AFTER]: 0.6,
      [ConnectionType.REVISIT]: 0.5,
      [ConnectionType.EVOLUTION]: 0.7
    }
  }

  private isTemporalConnection(type: ConnectionType): boolean {
    return [
      ConnectionType.SEQUENTIAL,
      ConnectionType.BEFORE_AFTER,
      ConnectionType.EVOLUTION
    ].includes(type)
  }

  private getConnectionColor(type: ConnectionType): string {
    const colorMap: { [type in ConnectionType]: string } = {
      [ConnectionType.CAUSAL]: '#F44336',
      [ConnectionType.SIMILAR]: '#4CAF50',
      [ConnectionType.SUPPORTING]: '#2196F3',
      [ConnectionType.CONTRADICTORY]: '#FF5722',
      [ConnectionType.SEQUENTIAL]: '#FF9800',
      [ConnectionType.QUESTION_ANSWER]: '#9C27B0',
      [ConnectionType.INSPIRATION]: '#E91E63',
      [ConnectionType.COMPLEMENTARY]: '#00BCD4',
      [ConnectionType.ELABORATION]: '#795548',
      [ConnectionType.GENERALIZATION]: '#607D8B',
      [ConnectionType.ANALOGY]: '#FFC107',
      [ConnectionType.METAPHOR]: '#FFEB3B',
      [ConnectionType.PROBLEM_SOLUTION]: '#8BC34A',
      [ConnectionType.HYPOTHESIS_EVIDENCE]: '#03A9F4',
      [ConnectionType.CONCEPT_INSTANCE]: '#673AB7',
      [ConnectionType.PART_WHOLE]: '#3F51B5',
      [ConnectionType.CATEGORY_MEMBER]: '#009688',
      [ConnectionType.MOOD_INFLUENCED]: '#CDDC39',
      [ConnectionType.EMOTIONAL_RESONANCE]: '#FF4081',
      [ConnectionType.BEFORE_AFTER]: '#FF6F00',
      [ConnectionType.REVISIT]: '#76FF03',
      [ConnectionType.EVOLUTION]: '#B71C1C'
    }
    
    return colorMap[type] || '#757575'
  }

  private getConnectionStyle(strength: number): 'solid' | 'dashed' | 'dotted' {
    if (strength > 0.7) return 'solid'
    if (strength > 0.4) return 'dashed'
    return 'dotted'
  }

  private getStrengthCategory(strength: number): string {
    if (strength > 0.8) return 'very_strong'
    if (strength > 0.6) return 'strong'
    if (strength > 0.3) return 'moderate'
    return 'weak'
  }

  private isWithinTimeWindow(thought: Thought): boolean {
    const now = new Date()
    const windowMs = this.config.timeWindowDays * 24 * 60 * 60 * 1000
    return (now.getTime() - thought.timestamp.getTime()) <= windowMs
  }

  private createLinkingTask(type: 'single' | 'batch' | 'incremental' | 'full', thoughts: Thought[]): LinkingTask {
    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'pending',
      input: { thoughts },
      metadata: {
        createdAt: new Date(),
        aiProvider: this.config.aiProviders[0]
      },
      progress: {
        currentStep: 'Initializing',
        percentage: 0,
        estimatedTimeRemaining: 0
      }
    }
  }

  private preprocessThoughts(thoughts: Thought[]): Thought[] {
    // 过滤和预处理思想
    return thoughts
      .filter(t => t.content.length > 10) // 过滤太短的思想
      .filter(t => this.isWithinTimeWindow(t)) // 时间窗口过滤
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // 按时间排序
  }

  private async generateConnectionSuggestions(thoughts: Thought[], connections: EnhancedConnection[]): Promise<ConnectionSuggestion[]> {
    // 基于现有连接生成更多建议
    const suggestions: ConnectionSuggestion[] = []
    
    // 这里可以添加更复杂的建议逻辑
    
    return suggestions
  }

  private generateConnectionInsights(connections: EnhancedConnection[], thoughts: Thought[]): ConnectionInsight[] {
    const insights: ConnectionInsight[] = []
    
    // 分析连接密度
    if (connections.length > thoughts.length * 0.5) {
      insights.push({
        type: 'pattern',
        title: '高连接密度',
        description: '您的思想之间联系紧密，显示出很强的系统性思维',
        affectedThoughts: thoughts.map(t => t.id),
        actionableAdvice: ['继续保持这种关联思维', '考虑整理成知识体系'],
        importance: 'medium'
      })
    }
    
    // 分析孤立思想
    const connectedThoughts = new Set<string>()
    connections.forEach(conn => {
      connectedThoughts.add(conn.fromThoughtId)
      connectedThoughts.add(conn.toThoughtId)
    })
    
    const isolatedThoughts = thoughts.filter(t => !connectedThoughts.has(t.id))
    if (isolatedThoughts.length > thoughts.length * 0.3) {
      insights.push({
        type: 'opportunity',
        title: '发现孤立思想',
        description: `有${isolatedThoughts.length}个思想暂未建立连接，可能存在关联机会`,
        affectedThoughts: isolatedThoughts.map(t => t.id),
        actionableAdvice: ['尝试找出这些思想的共同点', '主动建立连接'],
        importance: 'medium'
      })
    }
    
    return insights
  }

  private identifyConnectionPatterns(connections: EnhancedConnection[]): any[] {
    // 识别连接模式
    const patterns: any[] = []
    
    // 分析连接类型分布
    const typeDistribution: { [type: string]: number } = {}
    connections.forEach(conn => {
      typeDistribution[conn.type] = (typeDistribution[conn.type] || 0) + 1
    })
    
    // 找出主导模式
    const dominantType = Object.entries(typeDistribution)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (dominantType && dominantType[1] > connections.length * 0.3) {
      patterns.push({
        id: `pattern_${dominantType[0]}`,
        name: `${dominantType[0]}主导模式`,
        description: `您的思维主要通过${dominantType[0]}方式连接`,
        pattern: [dominantType[0]],
        frequency: dominantType[1],
        examples: [],
        significance: '这种模式反映了您的思维特点'
      })
    }
    
    return patterns
  }

  private calculateConnectionMetrics(connections: EnhancedConnection[], thoughts: Thought[]): any {
    const totalConnections = connections.length
    const avgConnectionStrength = connections.reduce((sum, conn) => sum + conn.strength, 0) / Math.max(connections.length, 1)
    const networkDensity = totalConnections / Math.max((thoughts.length * (thoughts.length - 1)) / 2, 1)
    
    // 计算中心节点
    const nodeConnections: { [thoughtId: string]: number } = {}
    connections.forEach(conn => {
      nodeConnections[conn.fromThoughtId] = (nodeConnections[conn.fromThoughtId] || 0) + 1
      nodeConnections[conn.toThoughtId] = (nodeConnections[conn.toThoughtId] || 0) + 1
    })
    
    const centralNodes = Object.entries(nodeConnections)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([thoughtId]) => thoughtId)
    
    const connectedThoughts = new Set<string>()
    connections.forEach(conn => {
      connectedThoughts.add(conn.fromThoughtId)
      connectedThoughts.add(conn.toThoughtId)
    })
    
    const isolatedNodes = thoughts
      .filter(t => !connectedThoughts.has(t.id))
      .map(t => t.id)
    
    return {
      totalConnections,
      avgConnectionStrength,
      networkDensity,
      centralNodes,
      isolatedNodes
    }
  }

  private notifyListeners(result: ConnectionAnalysisResult): void {
    this.listeners.forEach(listener => {
      try {
        listener(result)
      } catch (error) {
        console.error('连接监听器错误:', error)
      }
    })
  }

  private loadExistingConnections(): void {
    try {
      const saved = localStorage.getItem('thinkmate-connections')
      if (saved) {
        const connections: EnhancedConnection[] = JSON.parse(saved)
        connections.forEach(conn => {
          this.activeConnections.set(conn.id, conn)
        })
      }
    } catch (error) {
      console.error('加载连接失败:', error)
    }
  }

  private saveConnections(connections: EnhancedConnection[]): void {
    try {
      const allConnections = Array.from(this.activeConnections.values())
      localStorage.setItem('thinkmate-connections', JSON.stringify(allConnections))
    } catch (error) {
      console.error('保存连接失败:', error)
    }
  }

  // 其他必要的私有方法将根据需要添加...
  private async findRelevantThoughts(question: string, thoughts: Thought[]): Promise<Thought[]> {
    // 简化实现
    return thoughts.filter(t => 
      this.calculateTextSimilarity(question, t.content) > 0.3
    ).slice(0, 10)
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = this.tokenize(text1)
    const words2 = this.tokenize(text2)
    const intersection = words1.filter(word => words2.includes(word))
    const union = [...new Set([...words1, ...words2])]
    return intersection.length / union.length
  }

  private getConnectionsForThoughts(thoughtIds: string[]): EnhancedConnection[] {
    return Array.from(this.activeConnections.values()).filter(conn =>
      thoughtIds.includes(conn.fromThoughtId) || thoughtIds.includes(conn.toThoughtId)
    )
  }

  private async generateConnectedAnswer(question: string, thoughts: Thought[], connections: EnhancedConnection[]): Promise<ConnectedAnswer> {
    // 简化实现
    return {
      answer: '基于您的思想连接，这是一个初步答案...',
      confidence: 0.7,
      sources: thoughts.slice(0, 3).map(t => ({
        thoughtId: t.id,
        relevance: 0.8,
        snippet: t.content.substring(0, 100)
      })),
      connections: connections.slice(0, 5).map(conn => ({
        connectionId: conn.id,
        relevance: conn.strength,
        reasoning: conn.explanation.reasoning
      })),
      followUpQuestions: ['您想了解更多关于...?'],
      relatedConcepts: ['相关概念1', '相关概念2']
    }
  }

  private async createNetworkNodes(thoughts: Thought[], knowledgeItems: KnowledgeItem[]): Promise<any[]> {
    // 简化实现
    return thoughts.map(thought => ({
      id: thought.id,
      thoughtId: thought.id,
      type: 'thought',
      properties: {
        degree: 0,
        betweenness: 0,
        closeness: 0,
        pagerank: 0,
        clusterCoefficient: 0
      },
      semantics: {
        topics: this.extractThemes(thought.content),
        sentiment: 'neutral',
        complexity: thought.content.length / 100,
        abstractness: 0.5
      },
      visualization: {
        size: 10,
        color: '#4CAF50',
        importance: 0.5
      }
    }))
  }

  private createNetworkEdges(connections: EnhancedConnection[]): any[] {
    return connections.map(conn => ({
      id: conn.id,
      source: conn.fromThoughtId,
      target: conn.toThoughtId,
      connection: conn,
      weight: conn.strength,
      properties: {
        betweenness: 0,
        bridging: false,
        redundancy: 0
      }
    }))
  }

  private analyzeNetworkStructure(nodes: any[], edges: any[]): any {
    return {
      createdAt: new Date(),
      lastUpdated: new Date(),
      nodeCount: nodes.length,
      edgeCount: edges.length,
      avgDegree: edges.length * 2 / Math.max(nodes.length, 1),
      density: edges.length / Math.max((nodes.length * (nodes.length - 1)) / 2, 1),
      clusters: []
    }
  }

  private calculateNetworkOverview(network: ThoughtNetwork): any {
    return {
      nodeCount: network.nodes.length,
      edgeCount: network.edges.length,
      density: network.metadata.density,
      averagePathLength: 3.5, // 简化计算
      clusteringCoefficient: 0.6 // 简化计算
    }
  }

  private identifyCentralNodes(network: ThoughtNetwork): any[] {
    // 简化实现：按连接数排序
    const nodeDegree: { [nodeId: string]: number } = {}
    
    network.edges.forEach(edge => {
      nodeDegree[edge.source] = (nodeDegree[edge.source] || 0) + 1
      nodeDegree[edge.target] = (nodeDegree[edge.target] || 0) + 1
    })
    
    return Object.entries(nodeDegree)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nodeId, degree]) => ({
        nodeId,
        centrality: degree / Math.max(network.nodes.length - 1, 1),
        influence: degree,
        type: degree > network.nodes.length * 0.3 ? 'hub' : 'bridge'
      }))
  }

  private detectCommunities(network: ThoughtNetwork): any[] {
    // 简化的社区检测
    return [{
      id: 'community_1',
      nodes: network.nodes.slice(0, Math.ceil(network.nodes.length / 2)).map(n => n.id),
      theme: '主要思维群',
      cohesion: 0.8
    }]
  }

  private generateNetworkInsights(network: ThoughtNetwork, centralNodes: any[], communities: any[]): any {
    return {
      strongestConnections: network.edges
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
        .map(e => e.id),
      emergingPatterns: ['序列化思维模式', '主题聚类模式'],
      knowledgeGaps: ['需要更多跨领域连接'],
      recommendations: ['加强孤立思想的连接', '探索新的思维主题']
    }
  }

  private async verifyConnection(connection: EnhancedConnection): Promise<boolean> {
    // 简化的连接验证
    return connection.confidence > 0.5
  }

  private rankAndFilterSuggestions(suggestions: ConnectionSuggestion[]): ConnectionSuggestion[] {
    return suggestions
      .sort((a, b) => {
        // 按优先级和强度排序
        const priorityScore = { high: 3, medium: 2, low: 1 }
        return (priorityScore[b.priority] * b.strength) - (priorityScore[a.priority] * a.strength)
      })
      .slice(0, 10) // 最多返回10个建议
  }
}

// 单例导出
export const thoughtLinkingEngine = new ThoughtLinkingEngine()