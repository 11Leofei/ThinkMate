import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Network, 
  Plus, 
  X, 
  Search, 
 
  Unlink,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Thought } from '@/types'

interface Connection {
  id: string
  fromThoughtId: string
  toThoughtId: string
  type: 'related' | 'opposite' | 'builds_on' | 'inspired_by' | 'question_answer'
  strength: number // 1-5
  description?: string
  createdAt: Date
}

interface ThoughtConnectionsProps {
  thoughts: Thought[]
  connections: Connection[]
  onAddConnection: (connection: Omit<Connection, 'id' | 'createdAt'>) => void
  onRemoveConnection: (connectionId: string) => void
  selectedThoughtId?: string
}

export function ThoughtConnections({
  thoughts,
  connections,
  onAddConnection,
  onRemoveConnection,
  selectedThoughtId
}: ThoughtConnectionsProps) {
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [sourceThoughtId, setSourceThoughtId] = useState<string>('')
  const [targetThoughtId, setTargetThoughtId] = useState<string>('')
  const [connectionType, setConnectionType] = useState<Connection['type']>('related')
  const [connectionStrength, setConnectionStrength] = useState(3)
  const [connectionDescription, setConnectionDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showVisualization, setShowVisualization] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 过滤可连接的想法
  const filteredThoughts = thoughts.filter(thought => 
    thought.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
    thought.id !== sourceThoughtId
  )

  // 获取想法的连接
  const getThoughtConnections = (thoughtId: string) => {
    return connections.filter(conn => 
      conn.fromThoughtId === thoughtId || conn.toThoughtId === thoughtId
    )
  }


  // 添加连接
  const handleAddConnection = () => {
    if (sourceThoughtId && targetThoughtId && sourceThoughtId !== targetThoughtId) {
      onAddConnection({
        fromThoughtId: sourceThoughtId,
        toThoughtId: targetThoughtId,
        type: connectionType,
        strength: connectionStrength,
        description: connectionDescription.trim() || undefined
      })
      
      // 重置表单
      setTargetThoughtId('')
      setConnectionDescription('')
      setShowConnectionModal(false)
    }
  }

  // 渲染连接可视化
  useEffect(() => {
    if (!showVisualization || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 计算节点位置
    const nodePositions = new Map<string, { x: number; y: number }>()
    const radius = Math.min(canvas.width, canvas.height) * 0.3
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    thoughts.forEach((thought, index) => {
      const angle = (index / thoughts.length) * 2 * Math.PI
      const x = centerX + Math.cos(angle) * radius * zoomLevel
      const y = centerY + Math.sin(angle) * radius * zoomLevel
      nodePositions.set(thought.id, { x, y })
    })

    // 绘制连接线
    connections.forEach(connection => {
      const fromPos = nodePositions.get(connection.fromThoughtId)
      const toPos = nodePositions.get(connection.toThoughtId)
      
      if (fromPos && toPos) {
        ctx.beginPath()
        ctx.moveTo(fromPos.x, fromPos.y)
        ctx.lineTo(toPos.x, toPos.y)
        
        // 根据连接类型设置颜色
        const colors = {
          related: '#3b82f6',
          opposite: '#ef4444',
          builds_on: '#10b981',
          inspired_by: '#f59e0b',
          question_answer: '#8b5cf6'
        }
        ctx.strokeStyle = colors[connection.type]
        ctx.lineWidth = connection.strength
        ctx.globalAlpha = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // 绘制节点
    thoughts.forEach(thought => {
      const pos = nodePositions.get(thought.id)
      if (!pos) return

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI)
      
      // 高亮选中的想法
      if (thought.id === selectedThoughtId) {
        ctx.fillStyle = '#f59e0b'
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 3
      } else {
        ctx.fillStyle = '#6b7280'
        ctx.strokeStyle = '#374151'
        ctx.lineWidth = 2
      }
      
      ctx.fill()
      ctx.stroke()

      // 添加想法文本（简短版本）
      ctx.fillStyle = '#f3f4f6'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      const shortText = thought.content.slice(0, 20) + (thought.content.length > 20 ? '...' : '')
      ctx.fillText(shortText, pos.x, pos.y + 20)
    })
  }, [thoughts, connections, selectedThoughtId, showVisualization, zoomLevel])

  const connectionTypeLabels = {
    related: '相关',
    opposite: '对立',
    builds_on: '基于',
    inspired_by: '启发自',
    question_answer: '问答'
  }

  const connectionTypeColors = {
    related: 'text-blue-500',
    opposite: 'text-red-500',
    builds_on: 'text-green-500',
    inspired_by: 'text-yellow-500',
    question_answer: 'text-purple-500'
  }

  return (
    <div className="space-y-6">
      {/* 连接控制面板 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Network className="w-5 h-5" />
            想法连接
          </h3>
          <div className="text-sm text-muted-foreground">
            {connections.length} 个连接
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVisualization(!showVisualization)}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              showVisualization
                ? "bg-primary text-white"
                : "bg-secondary text-foreground hover:bg-secondary-hover"
            )}
          >
            {showVisualization ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showVisualization ? '隐藏' : '可视化'}
          </button>
          
          <button
            onClick={() => setShowConnectionModal(true)}
            className="px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加连接
          </button>
        </div>
      </div>

      {/* 可视化画布 */}
      {showVisualization && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 400 }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">思维连接图</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-full bg-muted/20 rounded border border-border"
          />
          
          {/* 图例 */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            {Object.entries(connectionTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={cn("w-3 h-0.5", `bg-${type === 'related' ? 'blue' : type === 'opposite' ? 'red' : type === 'builds_on' ? 'green' : type === 'inspired_by' ? 'yellow' : 'purple'}-500`)} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 连接列表 */}
      {selectedThoughtId && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            当前想法的连接
          </h4>
          {getThoughtConnections(selectedThoughtId).map(connection => {
            const otherThoughtId = connection.fromThoughtId === selectedThoughtId 
              ? connection.toThoughtId 
              : connection.fromThoughtId
            const otherThought = thoughts.find(t => t.id === otherThoughtId)
            
            if (!otherThought) return null

            return (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-xs font-medium", connectionTypeColors[connection.type])}>
                      {connectionTypeLabels[connection.type]}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            i < connection.strength ? "bg-primary" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {otherThought.content}
                  </p>
                  {connection.description && (
                    <p className="text-xs text-muted-foreground italic">
                      "{connection.description}"
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveConnection(connection.id)}
                  className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* 添加连接模态框 */}
      <AnimatePresence>
        {showConnectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg mx-4 bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">添加想法连接</h3>
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 选择源想法 */}
                <div>
                  <label className="block text-sm font-medium mb-2">源想法</label>
                  <select
                    value={sourceThoughtId}
                    onChange={(e) => setSourceThoughtId(e.target.value)}
                    className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">选择源想法...</option>
                    {thoughts.map(thought => (
                      <option key={thought.id} value={thought.id}>
                        {thought.content.slice(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* 搜索目标想法 */}
                <div>
                  <label className="block text-sm font-medium mb-2">目标想法</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索想法..."
                      className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {filteredThoughts.slice(0, 5).map(thought => (
                      <label
                        key={thought.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="targetThought"
                          value={thought.id}
                          checked={targetThoughtId === thought.id}
                          onChange={(e) => setTargetThoughtId(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          {thought.content.slice(0, 60)}...
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 连接类型 */}
                <div>
                  <label className="block text-sm font-medium mb-2">连接类型</label>
                  <select
                    value={connectionType}
                    onChange={(e) => setConnectionType(e.target.value as Connection['type'])}
                    className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(connectionTypeLabels).map(([type, label]) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* 连接强度 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    连接强度: {connectionStrength}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={connectionStrength}
                    onChange={(e) => setConnectionStrength(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>弱</span>
                    <span>强</span>
                  </div>
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm font-medium mb-2">描述（可选）</label>
                  <textarea
                    value={connectionDescription}
                    onChange={(e) => setConnectionDescription(e.target.value)}
                    placeholder="描述这个连接的具体关系..."
                    className="w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddConnection}
                  disabled={!sourceThoughtId || !targetThoughtId}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  添加连接
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}