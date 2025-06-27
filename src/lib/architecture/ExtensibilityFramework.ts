// 可扩展架构框架 - 为未来修改和扩展建立强大基础
import { EventEmitter } from 'events'

// 插件系统接口
export interface Plugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  dependencies?: string[]
  
  // 生命周期方法
  onLoad?: (framework: ExtensibilityFramework) => Promise<void>
  onUnload?: () => Promise<void>
  onEnable?: () => Promise<void>
  onDisable?: () => Promise<void>
  
  // 功能扩展点
  contributes?: {
    commands?: CommandContribution[]
    views?: ViewContribution[]
    providers?: ProviderContribution[]
    themes?: ThemeContribution[]
    languages?: LanguageContribution[]
  }
}

// 命令贡献
export interface CommandContribution {
  id: string
  title: string
  category?: string
  icon?: string
  when?: string
  handler: (args?: any) => Promise<void> | void
}

// 视图贡献
export interface ViewContribution {
  id: string
  title: string
  when?: string
  component: React.ComponentType<any>
  location: 'sidebar' | 'main' | 'modal' | 'statusbar'
  order?: number
}

// 提供器贡献
export interface ProviderContribution {
  id: string
  type: 'ai' | 'storage' | 'search' | 'analysis' | 'export' | 'import'
  implementation: any
  priority?: number
}

// 主题贡献
export interface ThemeContribution {
  id: string
  name: string
  type: 'light' | 'dark' | 'auto'
  colors: Record<string, string>
  styles?: Record<string, any>
}

// 语言贡献
export interface LanguageContribution {
  id: string
  name: string
  translations: Record<string, string>
}

// 扩展点定义
export interface ExtensionPoint<T = any> {
  id: string
  description: string
  schema?: any
  contributions: T[]
}

// 配置管理接口
export interface ConfigurationManager {
  get<T>(key: string, defaultValue?: T): T
  set(key: string, value: any): Promise<void>
  update(key: string, value: any): Promise<void>
  has(key: string): boolean
  delete(key: string): Promise<void>
  watch(key: string, callback: (value: any) => void): () => void
}

// 存储抽象接口
export interface StorageProvider {
  id: string
  name: string
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
  has(key: string): Promise<boolean>
}

// AI提供器抽象接口
export interface AIProvider {
  id: string
  name: string
  initialize(config: any): Promise<void>
  analyze(content: string, context?: any): Promise<any>
  generate(prompt: string, options?: any): Promise<string>
  embeddings(text: string): Promise<number[]>
  capabilities: string[]
}

// 数据导出器接口
export interface DataExporter {
  id: string
  name: string
  supportedFormats: string[]
  export(data: any, format: string, options?: any): Promise<Blob | string>
}

// 数据导入器接口
export interface DataImporter {
  id: string
  name: string
  supportedFormats: string[]
  import(data: string | File, format: string): Promise<any>
}

// 主扩展框架类
export class ExtensibilityFramework extends EventEmitter {
  private plugins = new Map<string, Plugin>()
  private extensionPoints = new Map<string, ExtensionPoint>()
  private providers = new Map<string, Map<string, any>>()
  private commands = new Map<string, CommandContribution>()
  private views = new Map<string, ViewContribution>()
  private configManager: ConfigurationManager
  private storageProvider: StorageProvider
  
  constructor(
    configManager: ConfigurationManager,
    storageProvider: StorageProvider
  ) {
    super()
    this.configManager = configManager
    this.storageProvider = storageProvider
    this.initializeBuiltInExtensionPoints()
  }

  // 初始化内置扩展点
  private initializeBuiltInExtensionPoints() {
    this.registerExtensionPoint({
      id: 'ai.providers',
      description: 'AI服务提供器',
      contributions: []
    })

    this.registerExtensionPoint({
      id: 'storage.providers',
      description: '存储提供器',
      contributions: []
    })

    this.registerExtensionPoint({
      id: 'data.exporters',
      description: '数据导出器',
      contributions: []
    })

    this.registerExtensionPoint({
      id: 'data.importers',
      description: '数据导入器',
      contributions: []
    })

    this.registerExtensionPoint({
      id: 'ui.themes',
      description: 'UI主题',
      contributions: []
    })

    this.registerExtensionPoint({
      id: 'analysis.processors',
      description: '分析处理器',
      contributions: []
    })
  }

  // 插件管理
  async loadPlugin(plugin: Plugin): Promise<void> {
    try {
      // 检查依赖
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep)) {
            throw new Error(`缺少依赖插件: ${dep}`)
          }
        }
      }

      // 执行加载生命周期
      if (plugin.onLoad) {
        await plugin.onLoad(this)
      }

      // 注册贡献
      if (plugin.contributes) {
        await this.registerContributions(plugin.id, plugin.contributes)
      }

      this.plugins.set(plugin.id, plugin)
      this.emit('plugin:loaded', plugin)
      
      console.log(`插件已加载: ${plugin.name} v${plugin.version}`)
    } catch (error) {
      console.error(`加载插件失败 ${plugin.id}:`, error)
      throw error
    }
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`插件不存在: ${pluginId}`)
    }

    try {
      // 执行卸载生命周期
      if (plugin.onUnload) {
        await plugin.onUnload()
      }

      // 清理贡献
      await this.unregisterContributions(pluginId)

      this.plugins.delete(pluginId)
      this.emit('plugin:unloaded', plugin)
      
      console.log(`插件已卸载: ${plugin.name}`)
    } catch (error) {
      console.error(`卸载插件失败 ${pluginId}:`, error)
      throw error
    }
  }

  // 扩展点管理
  registerExtensionPoint<T>(extensionPoint: ExtensionPoint<T>): void {
    this.extensionPoints.set(extensionPoint.id, extensionPoint)
    this.emit('extension-point:registered', extensionPoint)
  }

  contributeToExtensionPoint<T>(pointId: string, contribution: T): void {
    const point = this.extensionPoints.get(pointId)
    if (!point) {
      throw new Error(`扩展点不存在: ${pointId}`)
    }

    point.contributions.push(contribution)
    this.emit('extension-point:contributed', { pointId, contribution })
  }

  getExtensionPoint<T>(pointId: string): ExtensionPoint<T> | undefined {
    return this.extensionPoints.get(pointId) as ExtensionPoint<T>
  }

  // 提供器管理
  registerProvider(type: string, id: string, provider: any): void {
    if (!this.providers.has(type)) {
      this.providers.set(type, new Map())
    }
    
    this.providers.get(type)!.set(id, provider)
    this.emit('provider:registered', { type, id, provider })
  }

  unregisterProvider(type: string, id: string): void {
    const providers = this.providers.get(type)
    if (providers) {
      providers.delete(id)
      this.emit('provider:unregistered', { type, id })
    }
  }

  getProvider<T>(type: string, id: string): T | undefined {
    return this.providers.get(type)?.get(id) as T
  }

  getProviders<T>(type: string): T[] {
    const providers = this.providers.get(type)
    return providers ? Array.from(providers.values()) as T[] : []
  }

  // 命令管理
  registerCommand(command: CommandContribution): void {
    this.commands.set(command.id, command)
    this.emit('command:registered', command)
  }

  unregisterCommand(commandId: string): void {
    this.commands.delete(commandId)
    this.emit('command:unregistered', commandId)
  }

  async executeCommand(commandId: string, args?: any): Promise<void> {
    const command = this.commands.get(commandId)
    if (!command) {
      throw new Error(`命令不存在: ${commandId}`)
    }

    try {
      await command.handler(args)
      this.emit('command:executed', { commandId, args })
    } catch (error) {
      this.emit('command:error', { commandId, args, error })
      throw error
    }
  }

  getCommands(): CommandContribution[] {
    return Array.from(this.commands.values())
  }

  // 视图管理
  registerView(view: ViewContribution): void {
    this.views.set(view.id, view)
    this.emit('view:registered', view)
  }

  unregisterView(viewId: string): void {
    this.views.delete(viewId)
    this.emit('view:unregistered', viewId)
  }

  getView(viewId: string): ViewContribution | undefined {
    return this.views.get(viewId)
  }

  getViews(location?: string): ViewContribution[] {
    const views = Array.from(this.views.values())
    return location 
      ? views.filter(v => v.location === location)
      : views
  }

  // 配置管理
  getConfiguration(): ConfigurationManager {
    return this.configManager
  }

  // 存储管理
  getStorage(): StorageProvider {
    return this.storageProvider
  }

  // 贡献注册
  private async registerContributions(pluginId: string, contributes: any): Promise<void> {
    // 注册命令
    if (contributes.commands) {
      for (const command of contributes.commands) {
        this.registerCommand({ ...command, pluginId })
      }
    }

    // 注册视图
    if (contributes.views) {
      for (const view of contributes.views) {
        this.registerView({ ...view, pluginId })
      }
    }

    // 注册提供器
    if (contributes.providers) {
      for (const provider of contributes.providers) {
        this.registerProvider(provider.type, `${pluginId}.${provider.id}`, provider.implementation)
      }
    }

    // 注册主题
    if (contributes.themes) {
      for (const theme of contributes.themes) {
        this.contributeToExtensionPoint('ui.themes', { ...theme, pluginId })
      }
    }

    // 注册语言
    if (contributes.languages) {
      for (const language of contributes.languages) {
        this.contributeToExtensionPoint('i18n.languages', { ...language, pluginId })
      }
    }
  }

  // 贡献清理
  private async unregisterContributions(pluginId: string): Promise<void> {
    // 清理命令
    for (const [id, command] of this.commands) {
      if ((command as any).pluginId === pluginId) {
        this.unregisterCommand(id)
      }
    }

    // 清理视图
    for (const [id, view] of this.views) {
      if ((view as any).pluginId === pluginId) {
        this.unregisterView(id)
      }
    }

    // 清理提供器
    for (const [type, providers] of this.providers) {
      for (const [id, provider] of providers) {
        if (id.startsWith(`${pluginId}.`)) {
          this.unregisterProvider(type, id)
        }
      }
    }
  }

  // 插件发现
  async discoverPlugins(): Promise<Plugin[]> {
    // 这里可以实现插件发现逻辑
    // 例如从特定目录扫描插件文件
    return []
  }

  // 健康检查
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error'
    plugins: { id: string; status: string }[]
    issues: string[]
  }> {
    const issues: string[] = []
    const pluginStatuses: { id: string; status: string }[] = []

    // 检查插件状态
    for (const [id, plugin] of this.plugins) {
      try {
        // 这里可以添加插件健康检查逻辑
        pluginStatuses.push({ id, status: 'healthy' })
      } catch (error) {
        pluginStatuses.push({ id, status: 'error' })
        issues.push(`插件 ${id} 出现错误: ${error}`)
      }
    }

    const status = issues.length === 0 ? 'healthy' : 'warning'

    return {
      status,
      plugins: pluginStatuses,
      issues
    }
  }

  // 获取系统信息
  getSystemInfo(): {
    pluginCount: number
    extensionPointCount: number
    providerCount: number
    commandCount: number
    viewCount: number
  } {
    return {
      pluginCount: this.plugins.size,
      extensionPointCount: this.extensionPoints.size,
      providerCount: Array.from(this.providers.values()).reduce((sum, providers) => sum + providers.size, 0),
      commandCount: this.commands.size,
      viewCount: this.views.size
    }
  }
}

// 内置存储提供器
export class LocalStorageProvider implements StorageProvider {
  id = 'localStorage'
  name = 'Local Storage'

  async get(key: string): Promise<any> {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  }

  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }

  async keys(): Promise<string[]> {
    return Object.keys(localStorage)
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(key) !== null
  }
}

// 内置配置管理器
export class LocalConfigurationManager implements ConfigurationManager {
  private storage: StorageProvider
  private cache = new Map<string, any>()
  private watchers = new Map<string, Set<(value: any) => void>>()

  constructor(storage: StorageProvider) {
    this.storage = storage
  }

  get<T>(key: string, defaultValue?: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    try {
      const value = this.storage.get(`config:${key}`)
      this.cache.set(key, value)
      return value !== undefined ? value : defaultValue
    } catch {
      return defaultValue as T
    }
  }

  async set(key: string, value: any): Promise<void> {
    await this.storage.set(`config:${key}`, value)
    this.cache.set(key, value)
    this.notifyWatchers(key, value)
  }

  async update(key: string, value: any): Promise<void> {
    const current = this.get(key, {})
    const updated = typeof current === 'object' && typeof value === 'object'
      ? { ...current, ...value }
      : value
    
    await this.set(key, updated)
  }

  has(key: string): boolean {
    return this.cache.has(key) || this.storage.has(`config:${key}`)
  }

  async delete(key: string): Promise<void> {
    await this.storage.delete(`config:${key}`)
    this.cache.delete(key)
    this.notifyWatchers(key, undefined)
  }

  watch(key: string, callback: (value: any) => void): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set())
    }
    
    this.watchers.get(key)!.add(callback)
    
    // 返回取消监听的函数
    return () => {
      const callbacks = this.watchers.get(key)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.watchers.delete(key)
        }
      }
    }
  }

  private notifyWatchers(key: string, value: any): void {
    const callbacks = this.watchers.get(key)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value)
        } catch (error) {
          console.error('配置监听器回调错误:', error)
        }
      })
    }
  }
}

// 全局框架实例
let frameworkInstance: ExtensibilityFramework | null = null

export function getExtensibilityFramework(): ExtensibilityFramework {
  if (!frameworkInstance) {
    const storage = new LocalStorageProvider()
    const config = new LocalConfigurationManager(storage)
    frameworkInstance = new ExtensibilityFramework(config, storage)
  }
  return frameworkInstance
}

// 便捷的装饰器和工具函数
export function registerPluginCommand(id: string, title: string, handler: Function) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const framework = getExtensibilityFramework()
    framework.registerCommand({
      id,
      title,
      handler: handler.bind(target)
    })
  }
}

export function registerPluginView(id: string, title: string, location: string) {
  return function (constructor: Function) {
    const framework = getExtensibilityFramework()
    framework.registerView({
      id,
      title,
      location: location as any,
      component: constructor as any
    })
  }
}

// 插件开发助手
export class PluginBuilder {
  private plugin: Partial<Plugin> = {}

  id(id: string): this {
    this.plugin.id = id
    return this
  }

  name(name: string): this {
    this.plugin.name = name
    return this
  }

  version(version: string): this {
    this.plugin.version = version
    return this
  }

  description(description: string): this {
    this.plugin.description = description
    return this
  }

  author(author: string): this {
    this.plugin.author = author
    return this
  }

  dependencies(deps: string[]): this {
    this.plugin.dependencies = deps
    return this
  }

  onLoad(handler: (framework: ExtensibilityFramework) => Promise<void>): this {
    this.plugin.onLoad = handler
    return this
  }

  contributeCommand(command: CommandContribution): this {
    if (!this.plugin.contributes) {
      this.plugin.contributes = {}
    }
    if (!this.plugin.contributes.commands) {
      this.plugin.contributes.commands = []
    }
    this.plugin.contributes.commands.push(command)
    return this
  }

  contributeView(view: ViewContribution): this {
    if (!this.plugin.contributes) {
      this.plugin.contributes = {}
    }
    if (!this.plugin.contributes.views) {
      this.plugin.contributes.views = []
    }
    this.plugin.contributes.views.push(view)
    return this
  }

  build(): Plugin {
    if (!this.plugin.id || !this.plugin.name || !this.plugin.version) {
      throw new Error('插件必须包含 id、name 和 version')
    }
    return this.plugin as Plugin
  }
}