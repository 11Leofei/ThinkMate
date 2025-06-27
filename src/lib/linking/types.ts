// 思维链接AI引擎类型定义
import { Thought } from '../../types'
import { KnowledgeItem } from '../../types/knowledge'

// 连接类型枚举
export enum ConnectionType {
  // 逻辑关系
  CAUSAL = 'causal',                    // 因果关系
  SEQUENTIAL = 'sequential',            // 时序关系  
  CONTRADICTORY = 'contradictory',      // 矛盾关系
  SUPPORTING = 'supporting',            // 支持关系
  
  // 语义关系
  SIMILAR = 'similar',                  // 相似关系
  COMPLEMENTARY = 'complementary',      // 互补关系
  ELABORATION = 'elaboration',          // 详述关系
  GENERALIZATION = 'generalization',   // 泛化关系
  
  // 创意关系
  INSPIRATION = 'inspiration',          // 启发关系
  ANALOGY = 'analogy',                  // 类比关系
  METAPHOR = 'metaphor',               // 隐喻关系
  
  // 问题解决
  PROBLEM_SOLUTION = 'problem_solution', // 问题-解决方案
  QUESTION_ANSWER = 'question_answer',   // 问题-答案
  HYPOTHESIS_EVIDENCE = 'hypothesis_evidence', // 假设-证据
  
  // 知识关系
  CONCEPT_INSTANCE = 'concept_instance', // 概念-实例
  PART_WHOLE = 'part_whole',            // 部分-整体
  CATEGORY_MEMBER = 'category_member',   // 类别-成员
  
  // 情感关系
  MOOD_INFLUENCED = 'mood_influenced',   // 情绪影响
  EMOTIONAL_RESONANCE = 'emotional_resonance', // 情感共鸣
  
  // 时间关系
  BEFORE_AFTER = 'before_after',        // 前后关系
  REVISIT = 'revisit',                  // 重访关系
  EVOLUTION = 'evolution'               // 演化关系
}

// 连接强度级别
export enum ConnectionStrength {
  WEAK = 'weak',         // 0.1 - 0.3
  MODERATE = 'moderate', // 0.3 - 0.6
  STRONG = 'strong',     // 0.6 - 0.8
  VERY_STRONG = 'very_strong' // 0.8 - 1.0
}

// 增强的连接接口
export interface EnhancedConnection {
  id: string
  fromThoughtId: string
  toThoughtId: string
  type: ConnectionType
  strength: number // 0-1
  confidence: number // AI分析的置信度
  
  // 连接元数据
  metadata: {
    createdAt: Date
    lastVerified: Date
    detectionMethod: 'ai' | 'user' | 'hybrid'
    aiProvider: string
    verificationCount: number
    userFeedback?: 'positive' | 'negative' | 'neutral'
  }
  
  // 连接解释
  explanation: {
    reasoning: string
    keyWords: string[]
    contextualFactors: string[]
    examples?: string[]
  }
  
  // 连接属性
  properties: {
    bidirectional: boolean
    temporal: boolean
    contextDependent: boolean
    strengthDecay: boolean // 连接强度是否随时间衰减
  }
  
  // 可视化属性
  visualization: {
    color?: string
    style?: 'solid' | 'dashed' | 'dotted'
    weight?: number
    curvature?: number
  }
}

// 连接建议
export interface ConnectionSuggestion extends Omit<EnhancedConnection, 'id' | 'metadata'> {
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  suggestedActions: string[]
  relatedSuggestions: string[]
}

// 连接分析结果
export interface ConnectionAnalysisResult {
  newConnections: EnhancedConnection[]
  suggestions: ConnectionSuggestion[]
  insights: ConnectionInsight[]
  patterns: ConnectionPattern[]
  metrics: {
    totalConnections: number
    avgConnectionStrength: number
    networkDensity: number
    centralNodes: string[]
    isolatedNodes: string[]
  }
}

// 连接洞察
export interface ConnectionInsight {
  type: 'pattern' | 'anomaly' | 'opportunity' | 'warning'
  title: string
  description: string
  affectedThoughts: string[]
  actionableAdvice: string[]
  importance: 'low' | 'medium' | 'high' | 'critical'
}

// 连接模式
export interface ConnectionPattern {
  id: string
  name: string
  description: string
  pattern: ConnectionType[]
  frequency: number
  examples: string[]
  significance: string
}

// 思维网络
export interface ThoughtNetwork {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  metadata: {
    createdAt: Date
    lastUpdated: Date
    nodeCount: number
    edgeCount: number
    avgDegree: number
    density: number
    clusters: NetworkCluster[]
  }
}

// 网络节点
export interface NetworkNode {
  id: string
  thoughtId: string
  type: 'thought' | 'concept' | 'question' | 'insight'
  
  // 网络属性
  properties: {
    degree: number
    betweenness: number
    closeness: number
    pagerank: number
    clusterCoefficient: number
  }
  
  // 语义属性
  semantics: {
    topics: string[]
    sentiment: 'positive' | 'negative' | 'neutral'
    complexity: number
    abstractness: number
  }
  
  // 可视化属性
  visualization: {
    size: number
    color: string
    position?: { x: number, y: number }
    importance: number
  }
}

// 网络边
export interface NetworkEdge {
  id: string
  source: string
  target: string
  connection: EnhancedConnection
  weight: number
  
  // 网络属性
  properties: {
    betweenness: number
    bridging: boolean
    redundancy: number
  }
}

// 网络集群
export interface NetworkCluster {
  id: string
  name: string
  nodes: string[]
  centralTheme: string
  coherence: number
  isolation: number
}

// 链接发现配置
export interface LinkingConfig {
  // AI设置
  enableAILinking: boolean
  aiProviders: string[]
  confidenceThreshold: number
  
  // 连接类型设置
  enabledConnectionTypes: ConnectionType[]
  typeWeights: { [type in ConnectionType]?: number }
  
  // 发现设置
  maxConnectionsPerThought: number
  timeWindowDays: number
  semanticSimilarityThreshold: number
  
  // 性能设置
  batchSize: number
  parallelProcessing: boolean
  cacheResults: boolean
  
  // 用户偏好
  userPreferences: {
    preferExplicitConnections: boolean
    showWeakConnections: boolean
    autoVerifyConnections: boolean
    prioritizeRecentThoughts: boolean
  }
}

// 链接发现任务
export interface LinkingTask {
  id: string
  type: 'single' | 'batch' | 'incremental' | 'full'
  status: 'pending' | 'running' | 'completed' | 'failed'
  
  input: {
    thoughts: Thought[]
    existingConnections?: EnhancedConnection[]
    focusAreas?: string[]
  }
  
  output?: ConnectionAnalysisResult
  
  metadata: {
    createdAt: Date
    startedAt?: Date
    completedAt?: Date
    aiProvider: string
    processingTime?: number
    error?: string
  }
  
  progress: {
    currentStep: string
    percentage: number
    estimatedTimeRemaining: number
  }
}

// 智能问答结果
export interface ConnectedAnswer {
  answer: string
  confidence: number
  sources: {
    thoughtId: string
    relevance: number
    snippet: string
  }[]
  connections: {
    connectionId: string
    relevance: number
    reasoning: string
  }[]
  followUpQuestions: string[]
  relatedConcepts: string[]
}

// 知识映射
export interface KnowledgeMapping {
  thoughtId: string
  knowledgeId: string
  mappingType: 'inspired_by' | 'contradicts' | 'elaborates' | 'applies' | 'questions'
  strength: number
  explanation: string
  aiProvider: string
  createdAt: Date
}

// 语义相似度结果
export interface SemanticSimilarity {
  thought1Id: string
  thought2Id: string
  similarity: number
  sharedConcepts: string[]
  semanticDistance: number
  contextualRelevance: number
}

// 连接验证结果
export interface ConnectionVerification {
  connectionId: string
  verified: boolean
  confidence: number
  reasoning: string
  suggestedModifications?: {
    newType?: ConnectionType
    newStrength?: number
    additionalProperties?: any
  }
}

// 链接引擎状态
export interface LinkingEngineStatus {
  isRunning: boolean
  currentTask?: LinkingTask
  queuedTasks: number
  completedTasks: number
  lastRunTime?: Date
  performanceMetrics: {
    avgProcessingTime: number
    successRate: number
    userSatisfaction: number
  }
}

// 批量分析选项
export interface BatchAnalysisOptions {
  parallel: boolean
  maxConcurrency: number
  progressCallback?: (progress: number, currentTask: string) => void
  aiProvider?: string
  timeLimit?: number
}

// 连接质量评估
export interface ConnectionQuality {
  connectionId: string
  qualityScore: number // 0-1
  dimensions: {
    semantic: number
    temporal: number
    logical: number
    useful: number
    novel: number
  }
  feedback: {
    userRating?: number
    aiConfidence: number
    verificationCount: number
  }
}

// 网络分析结果
export interface NetworkAnalysis {
  overview: {
    nodeCount: number
    edgeCount: number
    density: number
    averagePathLength: number
    clusteringCoefficient: number
  }
  
  centralNodes: {
    nodeId: string
    centrality: number
    influence: number
    type: 'hub' | 'bridge' | 'authority'
  }[]
  
  communities: {
    id: string
    nodes: string[]
    theme: string
    cohesion: number
  }[]
  
  insights: {
    strongestConnections: string[]
    emergingPatterns: string[]
    knowledgeGaps: string[]
    recommendations: string[]
  }
}