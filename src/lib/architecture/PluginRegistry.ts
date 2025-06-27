// 插件注册表 - 管理和协调所有插件
import { Plugin, ExtensibilityFramework, getExtensibilityFramework, PluginBuilder } from './ExtensibilityFramework'
import { aiOrchestrator } from '../orchestrator'
import { thoughtLinkingEngine } from '../linking'

// 核心AI插件
export const coreAIPlugin: Plugin = new PluginBuilder()
  .id('thinkmate.core.ai')
  .name('核心AI功能')
  .version('1.0.0')
  .description('提供核心AI分析和智能功能')
  .author('ThinkMate Team')
  .onLoad(async (framework) => {
    // 注册AI编排器
    framework.registerProvider('ai', 'orchestrator', aiOrchestrator)
    
    // 注册AI分析命令
    framework.registerCommand({
      id: 'ai.analyze',
      title: 'AI分析',
      category: 'AI',
      handler: async (args) => {
        if (args?.thought) {
          return await aiOrchestrator.processThought(args.thought)
        }
      }
    })
    
    // 注册AI场景检测命令
    framework.registerCommand({
      id: 'ai.detectScenario',
      title: '检测AI场景',
      category: 'AI', 
      handler: async (args) => {
        if (args?.thought) {
          const scenarioDetector = await import('../orchestrator/ScenarioDetector')
          return await scenarioDetector.ScenarioDetector.detect(args.thought)
        }
      }
    })
  })
  .build()

// 思维链接插件
export const thoughtLinkingPlugin: Plugin = new PluginBuilder()
  .id('thinkmate.core.linking')
  .name('思维链接引擎')
  .version('1.0.0')
  .description('自动发现和管理思想连接')
  .author('ThinkMate Team')
  .onLoad(async (framework) => {
    // 注册思维链接引擎
    framework.registerProvider('analysis', 'thoughtLinking', thoughtLinkingEngine)
    
    // 注册连接发现命令
    framework.registerCommand({
      id: 'linking.discover',
      title: '发现连接',
      category: '分析',
      handler: async (args) => {
        if (args?.thoughts) {
          return await thoughtLinkingEngine.discoverConnections(args.thoughts)
        }
      }
    })
    
    // 注册连接建议命令
    framework.registerCommand({
      id: 'linking.suggest',
      title: '建议连接',
      category: '分析',
      handler: async (args) => {
        if (args?.currentThought && args?.recentThoughts) {
          return await thoughtLinkingEngine.suggestConnections(args.currentThought, args.recentThoughts)
        }
      }
    })
    
    // 注册网络分析命令
    framework.registerCommand({
      id: 'linking.analyzeNetwork',
      title: '网络分析',
      category: '分析',
      handler: async (args) => {
        if (args?.thoughts) {
          return await thoughtLinkingEngine.analyzeNetwork(args.thoughts)
        }
      }
    })
  })
  .build()

// 知识图谱可视化插件
export const graphVisualizationPlugin: Plugin = new PluginBuilder()
  .id('thinkmate.visualization.graph')
  .name('知识图谱可视化')
  .version('1.0.0')
  .description('提供交互式知识图谱可视化')
  .author('ThinkMate Team')
  .dependencies(['thinkmate.core.linking'])
  .onLoad(async (framework) => {
    // 动态导入可视化引擎
    const { GraphVisualizationEngine } = await import('../visualization/GraphVisualizationEngine')
    
    // 注册可视化引擎
    framework.registerProvider('visualization', 'graph', GraphVisualizationEngine)
    
    // 注册可视化命令
    framework.registerCommand({
      id: 'graph.render',
      title: '渲染知识图谱',
      category: '可视化',
      handler: async (args) => {
        // 图谱渲染逻辑
        console.log('渲染知识图谱', args)
      }
    })
    
    // 注册布局切换命令
    framework.registerCommand({
      id: 'graph.changeLayout',
      title: '切换布局',
      category: '可视化',
      handler: async (args) => {
        console.log('切换图谱布局', args)
      }
    })
    
    // 注册导出命令
    framework.registerCommand({
      id: 'graph.export',
      title: '导出图谱',
      category: '可视化',
      handler: async (args) => {
        console.log('导出知识图谱', args)
      }
    })
  })
  .build()

// 媒体处理插件
export const mediaProcessingPlugin: Plugin = new PluginBuilder()
  .id('thinkmate.core.media')
  .name('媒体处理')
  .version('1.0.0')
  .description('处理图片、音频、文档等媒体文件')
  .author('ThinkMate Team')
  .onLoad(async (framework) => {
    // 动态导入媒体服务
    const { getMediaService } = await import('../mediaService')
    const mediaService = getMediaService()
    
    // 注册媒体处理器
    framework.registerProvider('media', 'processor', mediaService)
    
    // 注册文件处理命令
    framework.registerCommand({
      id: 'media.processFile',
      title: '处理文件',
      category: '媒体',
      handler: async (args) => {
        if (args?.file) {
          return await mediaService.processFile(args.file)
        }
      }
    })
    
    // 注册OCR命令
    framework.registerCommand({
      id: 'media.extractText',
      title: '提取文本',
      category: '媒体',
      handler: async (args) => {
        if (args?.imageFile) {
          return await mediaService.extractTextFromImage(args.imageFile)
        }
      }
    })
    
    // 注册语音转文字命令
    framework.registerCommand({
      id: 'media.speechToText',
      title: '语音转文字',
      category: '媒体',
      handler: async (args) => {
        if (args?.audioFile) {
          return await mediaService.transcribeAudio(args.audioFile)
        }
      }
    })
  })
  .build()

// 知识管理插件
export const knowledgeManagementPlugin: Plugin = new PluginBuilder()
  .id('thinkmate.core.knowledge')
  .name('知识管理')
  .version('1.0.0')
  .description('管理知识库和学习资源')
  .author('ThinkMate Team')
  .onLoad(async (framework) => {
    // 动态导入知识服务
    const { getKnowledgeService } = await import('../knowledgeService')
    const knowledgeService = getKnowledgeService()
    
    // 注册知识管理器
    framework.registerProvider('knowledge', 'manager', knowledgeService)
    
    // 注册知识库操作命令
    framework.registerCommand({
      id: 'knowledge.addItem',
      title: '添加知识项',
      category: '知识库',
      handler: async (args) => {
        if (args?.item) {
          return await knowledgeService.addKnowledgeItem(args.item)
        }
      }
    })
    
    framework.registerCommand({
      id: 'knowledge.linkThought',
      title: '关联思想',
      category: '知识库',
      handler: async (args) => {
        if (args?.thoughtId && args?.knowledgeId) {
          return await knowledgeService.linkThoughtToKnowledge(
            args.thoughtId,
            args.knowledgeId,
            args.type || 'related',
            args.explanation || ''
          )
        }
      }
    })
    
    framework.registerCommand({
      id: 'knowledge.autoLink',
      title: '自动关联',
      category: '知识库',
      handler: async (args) => {
        if (args?.thoughts) {
          return await knowledgeService.autoLinkThoughts(args.thoughts)
        }
      }
    })
  })
  .build()

// 数据导出插件
export const dataExportPlugin: Plugin = new PluginBuilder()
  .id('thinkmate.tools.export')
  .name('数据导出')
  .version('1.0.0')
  .description('导出数据为各种格式')
  .author('ThinkMate Team')
  .onLoad(async (framework) => {
    // 注册JSON导出器
    framework.registerProvider('export', 'json', {
      id: 'json',
      name: 'JSON导出器',
      supportedFormats: ['json'],
      export: async (data: any, format: string) => {
        const jsonStr = JSON.stringify(data, null, 2)
        return new Blob([jsonStr], { type: 'application/json' })
      }
    })
    
    // 注册Markdown导出器
    framework.registerProvider('export', 'markdown', {
      id: 'markdown',
      name: 'Markdown导出器',
      supportedFormats: ['md', 'markdown'],
      export: async (data: any, format: string) => {
        const { convertToMarkdown } = await import('../exporters/MarkdownExporter')
        const markdown = convertToMarkdown(data)
        return new Blob([markdown], { type: 'text/markdown' })
      }
    })
    
    // 注册CSV导出器
    framework.registerProvider('export', 'csv', {
      id: 'csv',
      name: 'CSV导出器',
      supportedFormats: ['csv'],
      export: async (data: any, format: string) => {
        const { convertToCSV } = await import('../exporters/CSVExporter')
        const csv = convertToCSV(data)
        return new Blob([csv], { type: 'text/csv' })
      }
    })
    
    // 注册导出命令
    framework.registerCommand({
      id: 'export.thoughts',
      title: '导出思想',
      category: '导出',
      handler: async (args) => {
        const { thoughts, format = 'json' } = args || {}
        if (thoughts) {
          const exporter = framework.getProvider('export', format)
          if (exporter) {
            return await exporter.export(thoughts, format)
          }
        }
      }
    })
  })
  .build()

// MCP集成插件
export const mcpIntegrationPlugin: Plugin = new PluginBuilder()
  .id('thinkmate.integration.mcp')
  .name('MCP集成')
  .version('1.0.0')
  .description('Model Context Protocol集成')
  .author('ThinkMate Team')
  .onLoad(async (framework) => {
    // 注册MCP服务器管理器
    framework.registerProvider('integration', 'mcp', {
      id: 'mcp',
      name: 'MCP管理器',
      servers: new Map(),
      
      async connectServer(config: any) {
        console.log('连接MCP服务器:', config)
        // MCP连接逻辑
      },
      
      async disconnectServer(serverId: string) {
        console.log('断开MCP服务器:', serverId)
        // MCP断开逻辑
      },
      
      async listTools(serverId: string) {
        console.log('列出MCP工具:', serverId)
        // 返回工具列表
        return []
      },
      
      async callTool(serverId: string, toolName: string, args: any) {
        console.log('调用MCP工具:', serverId, toolName, args)
        // 工具调用逻辑
      }
    })
    
    // 注册MCP命令
    framework.registerCommand({
      id: 'mcp.connect',
      title: '连接MCP服务器',
      category: 'MCP',
      handler: async (args) => {
        const mcpManager = framework.getProvider('integration', 'mcp')
        if (mcpManager && args?.config) {
          return await mcpManager.connectServer(args.config)
        }
      }
    })
  })
  .build()

// 插件注册表
export class PluginRegistry {
  private framework: ExtensibilityFramework
  private corePlugins: Plugin[]

  constructor() {
    this.framework = getExtensibilityFramework()
    this.corePlugins = [
      coreAIPlugin,
      thoughtLinkingPlugin,
      graphVisualizationPlugin,
      mediaProcessingPlugin,
      knowledgeManagementPlugin,
      dataExportPlugin,
      mcpIntegrationPlugin
    ]
  }

  // 初始化核心插件
  async initializeCorePlugins(): Promise<void> {
    console.log('正在加载核心插件...')
    
    for (const plugin of this.corePlugins) {
      try {
        await this.framework.loadPlugin(plugin)
      } catch (error) {
        console.error(`加载核心插件失败 ${plugin.id}:`, error)
      }
    }
    
    console.log(`已加载 ${this.corePlugins.length} 个核心插件`)
  }

  // 获取框架实例
  getFramework(): ExtensibilityFramework {
    return this.framework
  }

  // 获取已加载的插件
  getLoadedPlugins(): Plugin[] {
    return Array.from((this.framework as any).plugins.values())
  }

  // 获取可用的命令
  getAvailableCommands(): any[] {
    return this.framework.getCommands()
  }

  // 获取可用的提供器
  getAvailableProviders(type?: string): any[] {
    if (type) {
      return this.framework.getProviders(type)
    }
    
    const allProviders: any[] = []
    const providerTypes = ['ai', 'analysis', 'visualization', 'media', 'knowledge', 'export', 'integration']
    
    for (const providerType of providerTypes) {
      allProviders.push(...this.framework.getProviders(providerType))
    }
    
    return allProviders
  }

  // 执行命令
  async executeCommand(commandId: string, args?: any): Promise<any> {
    return await this.framework.executeCommand(commandId, args)
  }

  // 健康检查
  async performHealthCheck(): Promise<any> {
    return await this.framework.healthCheck()
  }

  // 获取系统信息
  getSystemInfo(): any {
    return {
      ...this.framework.getSystemInfo(),
      corePluginsLoaded: this.corePlugins.length,
      frameworkVersion: '1.0.0',
      architecture: 'extensible'
    }
  }
}

// 全局插件注册表实例
let registryInstance: PluginRegistry | null = null

export function getPluginRegistry(): PluginRegistry {
  if (!registryInstance) {
    registryInstance = new PluginRegistry()
  }
  return registryInstance
}

// 便捷的插件管理函数
export async function initializeThinkMateExtensions(): Promise<void> {
  const registry = getPluginRegistry()
  await registry.initializeCorePlugins()
  
  // 注册全局错误处理
  const framework = registry.getFramework()
  framework.on('plugin:error', (error) => {
    console.error('插件错误:', error)
  })
  
  framework.on('command:error', (error) => {
    console.error('命令执行错误:', error)
  })
  
  console.log('ThinkMate扩展系统初始化完成')
}

// 插件开发工具
export const PluginUtils = {
  // 创建新插件
  createPlugin: (options: {
    id: string
    name: string
    version: string
    description: string
    author: string
  }) => {
    return new PluginBuilder()
      .id(options.id)
      .name(options.name)
      .version(options.version)
      .description(options.description)
      .author(options.author)
  },
  
  // 获取框架
  getFramework: () => getExtensibilityFramework(),
  
  // 获取注册表
  getRegistry: () => getPluginRegistry(),
  
  // 检查插件依赖
  checkDependencies: (plugin: Plugin) => {
    const registry = getPluginRegistry()
    const loadedPlugins = registry.getLoadedPlugins()
    const loadedIds = new Set(loadedPlugins.map(p => p.id))
    
    if (plugin.dependencies) {
      const missingDeps = plugin.dependencies.filter(dep => !loadedIds.has(dep))
      return {
        satisfied: missingDeps.length === 0,
        missing: missingDeps
      }
    }
    
    return { satisfied: true, missing: [] }
  }
}