// MCP集成管理组件
// 为ThinkMate提供MCP服务器连接和管理界面

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Server, Plus, Settings, Play, Square, RefreshCw, 
  AlertCircle, CheckCircle, XCircle, Eye, Code,
  Zap, Database, Brain, Cloud
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  MCPServer, 
  MCPServerConfig, 
  MCPTool, 
  MCPResource,
  ThinkMateMCPIntegration,
  MCPEvent
} from '@/types/mcp'
import { getMCPService, initializeMCPService } from '@/lib/mcpService'

interface MCPIntegrationProps {
  onToolSelect?: (tool: MCPTool) => void
  onResourceSelect?: (resource: MCPResource) => void
}

export function MCPIntegration({ onToolSelect, onResourceSelect }: MCPIntegrationProps) {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [integration, setIntegration] = useState<ThinkMateMCPIntegration | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initializeMCP()
  }, [])

  const initializeMCP = async () => {
    try {
      // 初始化MCP服务（如果还没有初始化）
      let mcpService = getMCPService()
      if (!mcpService) {
        mcpService = initializeMCPService({
          servers: [], // 从配置加载
          defaultTimeout: 5000,
          autoDiscovery: true,
          retryAttempts: 3,
          logLevel: 'info'
        })
      }

      // 加载已连接的服务器
      const availableServers = mcpService.getAvailableServers()
      setServers(availableServers)

      // 初始化ThinkMate集成
      const mcpIntegration = await mcpService.initializeThinkMateIntegrations()
      setIntegration(mcpIntegration)

      // 监听MCP事件
      mcpService.addEventListener('server_connected', handleServerEvent)
      mcpService.addEventListener('server_disconnected', handleServerEvent)

      setIsInitialized(true)
    } catch (error) {
      console.error('MCP初始化失败:', error)
    }
  }

  const handleServerEvent = (event: MCPEvent) => {
    // 更新服务器状态
    const mcpService = getMCPService()
    if (mcpService) {
      setServers(mcpService.getAvailableServers())
    }
  }

  const handleAddServer = async (config: MCPServerConfig) => {
    const mcpService = getMCPService()
    if (!mcpService) return

    try {
      const result = await mcpService.connectServer(config)
      if (result.success && result.data) {
        setServers(prev => [...prev, result.data!])
        setShowAddModal(false)
        
        // 重新初始化集成
        const newIntegration = await mcpService.initializeThinkMateIntegrations()
        setIntegration(newIntegration)
      } else {
        alert(`连接失败: ${result.error?.message}`)
      }
    } catch (error) {
      alert(`连接失败: ${error}`)
    }
  }

  const handleDisconnectServer = async (serverId: string) => {
    const mcpService = getMCPService()
    if (!mcpService) return

    try {
      const result = await mcpService.disconnectServer(serverId)
      if (result.success) {
        setServers(prev => prev.filter(s => s.id !== serverId))
        setSelectedServer(null)
        
        // 重新初始化集成
        const newIntegration = await mcpService.initializeThinkMateIntegrations()
        setIntegration(newIntegration)
      }
    } catch (error) {
      alert(`断开连接失败: ${error}`)
    }
  }

  const getServerStatusIcon = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-gray-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getIntegrationIcon = (category: string) => {
    switch (category) {
      case 'aiServices':
        return <Brain className="w-5 h-5 text-purple-500" />
      case 'dataSources':
        return <Database className="w-5 h-5 text-blue-500" />
      case 'analysisTools':
        return <Zap className="w-5 h-5 text-yellow-500" />
      case 'syncServices':
        return <Cloud className="w-5 h-5 text-green-500" />
      default:
        return <Server className="w-5 h-5 text-gray-500" />
    }
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">初始化MCP服务...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Server className="w-6 h-6" />
            MCP集成
          </h2>
          <p className="text-muted-foreground">管理Model Context Protocol服务器连接</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加服务器
        </button>
      </div>

      {/* 状态概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-500">{servers.length}</div>
          <div className="text-sm text-muted-foreground">总服务器</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">
            {servers.filter(s => s.status === 'connected').length}
          </div>
          <div className="text-sm text-muted-foreground">已连接</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-500">
            {servers.reduce((acc, s) => acc + s.capabilities.filter(c => c.type === 'tools').length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">可用工具</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-500">
            {servers.reduce((acc, s) => acc + s.capabilities.filter(c => c.type === 'resources').length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">可用资源</div>
        </div>
      </div>

      {/* ThinkMate集成状态 */}
      {integration && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">ThinkMate集成状态</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(integration).map(([category, services]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getIntegrationIcon(category)}
                  <span className="font-medium capitalize">{category}</span>
                </div>
                <div className="space-y-1 text-sm">
                  {Object.entries(services as any).map(([service, servers]) => (
                    <div key={service} className="flex justify-between">
                      <span className="text-muted-foreground">{service}:</span>
                      <span className="font-medium">{(servers as any[])?.length || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 服务器列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">连接的服务器</h3>
        
        {servers.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Server className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无MCP服务器</h3>
            <p className="text-muted-foreground mb-4">连接MCP服务器来扩展ThinkMate的功能</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              添加第一个服务器
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {servers.map((server) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getServerStatusIcon(server.status)}
                    <div>
                      <h4 className="font-medium">{server.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {server.config.command} • v{server.version}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {server.capabilities.length} capabilities
                    </span>
                    <button
                      onClick={() => setSelectedServer(
                        selectedServer === server.id ? null : server.id
                      )}
                      className="p-2 hover:bg-muted rounded-md"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnectServer(server.id)}
                      className="p-2 hover:bg-red-500/10 text-red-500 rounded-md"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 服务器详情 */}
                <AnimatePresence>
                  {selectedServer === server.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 工具 */}
                        <div>
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            可用工具
                          </h5>
                          <div className="space-y-1">
                            {server.capabilities
                              .filter(cap => cap.type === 'tools')
                              .map((tool, index) => (
                                <div
                                  key={index}
                                  className="p-2 bg-muted/50 rounded text-xs cursor-pointer hover:bg-muted"
                                  onClick={() => onToolSelect?.({
                                    name: tool.name,
                                    description: tool.description,
                                    inputSchema: tool.schema,
                                    serverId: server.id
                                  })}
                                >
                                  <div className="font-medium">{tool.name}</div>
                                  <div className="text-muted-foreground">{tool.description}</div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* 资源 */}
                        <div>
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            可用资源
                          </h5>
                          <div className="space-y-1">
                            {server.capabilities
                              .filter(cap => cap.type === 'resources')
                              .map((resource, index) => (
                                <div
                                  key={index}
                                  className="p-2 bg-muted/50 rounded text-xs cursor-pointer hover:bg-muted"
                                  onClick={() => onResourceSelect?.({
                                    uri: `mcp://${server.id}/${resource.name}`,
                                    name: resource.name,
                                    description: resource.description,
                                    serverId: server.id
                                  })}
                                >
                                  <div className="font-medium">{resource.name}</div>
                                  <div className="text-muted-foreground">{resource.description}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 添加服务器模态框 */}
      {showAddModal && (
        <AddServerModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddServer}
        />
      )}
    </div>
  )
}

// 添加服务器模态框
interface AddServerModalProps {
  onClose: () => void
  onAdd: (config: MCPServerConfig) => void
}

function AddServerModal({ onClose, onAdd }: AddServerModalProps) {
  const [config, setConfig] = useState<MCPServerConfig>({
    command: '',
    args: [],
    env: {},
    timeout: 5000,
    autoReconnect: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!config.command.trim()) {
      alert('请输入命令')
      return
    }
    onAdd(config)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-lg font-medium mb-4">添加MCP服务器</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">命令 *</label>
            <input
              type="text"
              value={config.command}
              onChange={(e) => setConfig(prev => ({ ...prev, command: e.target.value }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="例如: npx @modelcontextprotocol/server-filesystem"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">参数</label>
            <input
              type="text"
              value={config.args?.join(' ') || ''}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                args: e.target.value.split(' ').filter(Boolean) 
              }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="例如: --path /users/docs"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">超时 (毫秒)</label>
            <input
              type="number"
              value={config.timeout}
              onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoReconnect"
              checked={config.autoReconnect}
              onChange={(e) => setConfig(prev => ({ ...prev, autoReconnect: e.target.checked }))}
            />
            <label htmlFor="autoReconnect" className="text-sm">自动重连</label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              连接
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted-hover transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}