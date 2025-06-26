// MCP (Model Context Protocol) 集成类型定义
// 为ThinkMate预留MCP服务集成的类型系统

export interface MCPServer {
  id: string
  name: string
  version: string
  status: 'connected' | 'disconnected' | 'error'
  capabilities: MCPCapability[]
  config: MCPServerConfig
  lastConnected?: Date
  error?: string
}

export interface MCPServerConfig {
  command: string
  args?: string[]
  env?: Record<string, string>
  timeout?: number
  autoReconnect?: boolean
}

export interface MCPCapability {
  type: 'tools' | 'resources' | 'prompts'
  name: string
  description: string
  schema?: any
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: any
  outputSchema?: any
  serverId: string
}

export interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
  serverId: string
}

export interface MCPPrompt {
  name: string
  description?: string
  arguments: MCPPromptArgument[]
  serverId: string
}

export interface MCPPromptArgument {
  name: string
  description?: string
  required?: boolean
}

// ThinkMate特定的MCP集成接口
export interface ThinkMateMCPIntegration {
  // AI服务集成
  aiServices: {
    textGeneration?: MCPServer[]
    imageAnalysis?: MCPServer[]
    speechToText?: MCPServer[]
    translation?: MCPServer[]
  }
  
  // 外部数据源
  dataSources: {
    knowledgeBases?: MCPServer[]
    searchEngines?: MCPServer[]
    documentSources?: MCPServer[]
  }
  
  // 分析工具
  analysisTools: {
    sentimentAnalysis?: MCPServer[]
    topicModeling?: MCPServer[]
    relationExtraction?: MCPServer[]
  }
  
  // 导出/同步服务
  syncServices: {
    cloudStorage?: MCPServer[]
    noteApps?: MCPServer[]
    databases?: MCPServer[]
  }
}

// MCP操作结果
export interface MCPOperationResult<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  serverId: string
  operationType: string
  timestamp: Date
}

// MCP事件
export interface MCPEvent {
  type: 'server_connected' | 'server_disconnected' | 'tool_executed' | 'resource_updated'
  serverId: string
  timestamp: Date
  data?: any
}

// MCP配置
export interface MCPConfig {
  servers: MCPServerConfig[]
  defaultTimeout: number
  autoDiscovery: boolean
  retryAttempts: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

// ThinkMate中的MCP使用场景
export interface MCPUsageScenario {
  id: string
  name: string
  description: string
  requiredCapabilities: string[]
  suggestedServers: string[]
  integrationPoints: MCPIntegrationPoint[]
}

export interface MCPIntegrationPoint {
  component: string // 组件名称
  action: string // 具体操作
  mcpTool?: string // 使用的MCP工具
  mcpResource?: string // 使用的MCP资源
  fallbackBehavior: 'disable' | 'mock' | 'error'
}

// 为现有功能预留MCP扩展点
export interface ThoughtMCPExtension {
  // AI分析增强
  aiAnalysisProviders: string[] // MCP服务ID列表
  
  // 内容增强
  contentEnrichment: {
    factChecking?: string // MCP服务ID
    relatedContent?: string // MCP服务ID
    translation?: string // MCP服务ID
  }
  
  // 外部链接
  externalConnections: {
    searchEngines: string[]
    knowledgeBases: string[]
    socialPlatforms?: string[]
  }
}

export interface MediaMCPExtension {
  // 文件处理增强
  processingProviders: {
    ocr?: string[] // OCR服务提供者
    speechToText?: string[] // 语音转文字服务
    imageAnalysis?: string[] // 图像分析服务
    documentParsing?: string[] // 文档解析服务
  }
  
  // 云存储集成
  storageProviders: string[]
  
  // 内容分析
  contentAnalysis: {
    objectDetection?: string
    textAnalysis?: string
    audioAnalysis?: string
  }
}

export interface KnowledgeMCPExtension {
  // 知识源集成
  knowledgeSources: {
    wikipedia?: string
    scholar?: string
    books?: string
    papers?: string
    news?: string
  }
  
  // 自动关联服务
  relationshipAnalysis: {
    semanticSimilarity?: string
    topicModeling?: string
    entityExtraction?: string
  }
  
  // 推荐系统
  recommendations: {
    contentRecommendation?: string
    readingList?: string
    relatedResearch?: string
  }
}