// AI编排系统核心类型定义
import { AIConfig } from '../aiProviders'
import { Thought } from '../../types'

// AI场景枚举
export enum AIScenario {
  // 快速任务 - 使用高效AI
  QUICK_CLASSIFICATION = 'quick_classification',    // DeepSeek/月之暗面
  CONTENT_SUMMARIZATION = 'content_summarization',  // 月之暗面
  FILE_PROCESSING = 'file_processing',              // DeepSeek
  AUTO_TAGGING = 'auto_tagging',                    // DeepSeek/通义千问
  
  // 深度分析 - 使用顶级AI  
  DEEP_INSIGHT = 'deep_insight',                    // OpenAI GPT-4
  PHILOSOPHICAL_THINKING = 'philosophical',         // Claude
  COMPLEX_REASONING = 'complex_reasoning',          // OpenAI GPT-4
  STRATEGIC_PLANNING = 'strategic_planning',        // OpenAI GPT-4
  
  // 专项任务 - 使用专门AI
  SEARCH_OPTIMIZATION = 'search_optimization',      // Gemini
  KNOWLEDGE_LINKING = 'knowledge_linking',          // 智谱GLM
  CREATIVE_INSPIRATION = 'creative_inspiration',    // 文心一言/豆包
  RELATIONSHIP_DETECTION = 'relationship_detection', // 智谱GLM
  
  // 实时任务 - 使用快速AI
  LIVE_ANALYSIS = 'live_analysis',                  // Gemini/DeepSeek
  CONTENT_CATEGORIZATION = 'categorization',        // 通义千问
  SENTIMENT_ANALYSIS = 'sentiment_analysis',        // DeepSeek
  
  // 默认场景
  GENERAL_THINKING = 'general_thinking'             // 用户配置的默认AI
}

// AI提供商能力描述
export interface AICapability {
  scenario: AIScenario
  provider: string
  speed: 'fast' | 'medium' | 'slow'        // 响应速度
  quality: 'basic' | 'good' | 'excellent'   // 分析质量
  cost: 'low' | 'medium' | 'high'          // 使用成本
  reliability: number                       // 可靠性评分 0-1
}

// 思维上下文
export interface ThinkingContext {
  currentThought: Thought
  recentThoughts: Thought[]
  userPreferences: UserPreferences
  sessionHistory: SessionData
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  userMood?: 'creative' | 'analytical' | 'reflective' | 'urgent'
}

// 用户偏好
export interface UserPreferences {
  preferredAIs: { [scenario in AIScenario]?: string[] }
  speedVsQuality: 'speed' | 'balanced' | 'quality'
  costSensitivity: 'low' | 'medium' | 'high'
  privacyConcern: 'low' | 'medium' | 'high'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
}

// 会话数据
export interface SessionData {
  startTime: Date
  thoughtCount: number
  dominantScenarios: AIScenario[]
  aiPerformanceHistory: AIPerformanceMetric[]
}

// AI性能指标
export interface AIPerformanceMetric {
  provider: string
  scenario: AIScenario
  responseTime: number
  userSatisfaction: number
  successRate: number
  timestamp: Date
}

// 编排任务
export interface OrchestrationTask {
  id: string
  scenario: AIScenario
  content: string
  context: ThinkingContext
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: Date
  requiredCapabilities: string[]
}

// AI选择策略
export interface AISelectionStrategy {
  name: string
  description: string
  selectAI(
    scenario: AIScenario, 
    context: ThinkingContext, 
    availableAIs: AICapability[]
  ): AICapability[]
}

// 编排结果
export interface OrchestrationResult {
  taskId: string
  scenario: AIScenario
  selectedAIs: string[]
  results: AITaskResult[]
  synthesizedResult: SynthesizedInsight
  performance: TaskPerformance
  recommendations: string[]
}

// AI任务结果
export interface AITaskResult {
  provider: string
  scenario: AIScenario
  result: any
  confidence: number
  responseTime: number
  error?: string
}

// 合成洞察
export interface SynthesizedInsight {
  primaryInsight: string
  supportingInsights: string[]
  confidence: number
  sources: string[]
  actionableAdvice: string[]
  relatedConcepts: string[]
}

// 任务性能
export interface TaskPerformance {
  totalTime: number
  averageConfidence: number
  successRate: number
  costEstimate: number
  userSatisfactionPrediction: number
}

// 场景检测模式
export interface ScenarioPattern {
  name: string
  scenario: AIScenario
  textPatterns: RegExp[]
  contextCheckers: ((context: ThinkingContext) => boolean)[]
  semanticIndicators: string[]
  weight: number
}

// AI提供商映射
export interface AIProviderMapping {
  scenario: AIScenario
  primaryAI: string
  fallbackAIs: string[]
  conditions: {
    speed?: 'fast' | 'medium' | 'slow'
    quality?: 'basic' | 'good' | 'excellent'
    cost?: 'low' | 'medium' | 'high'
  }
}

// 实时AI工作状态
export interface AIWorkStatus {
  scenario: AIScenario
  selectedAIs: string[]
  currentStep: string
  processingSteps: ProcessingStep[]
  estimatedTime: number
  confidence: number
  startTime: Date
}

// 处理步骤
export interface ProcessingStep {
  name: string
  description: string
  aiProvider?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: Date
  endTime?: Date
  result?: any
}

// 连接建议
export interface ConnectionSuggestion {
  fromThoughtId: string
  toThoughtId: string
  relationshipType: string
  confidence: number
  reasoning: string
  aiProvider: string
}

// 知识图谱节点
export interface GraphNode {
  id: string
  type: 'thought' | 'knowledge' | 'concept'
  title: string
  content: string
  category: string
  importance: number
  connections: string[]
  metadata: Record<string, any>
}

// 知识图谱边
export interface GraphEdge {
  id: string
  from: string
  to: string
  type: string
  weight: number
  bidirectional: boolean
  metadata: Record<string, any>
}

// 知识图谱
export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    createdAt: Date
    lastUpdated: Date
    nodeCount: number
    edgeCount: number
    density: number
  }
}