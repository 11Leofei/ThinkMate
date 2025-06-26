import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  ZoomIn, ZoomOut, RotateCcw, Filter, Search, 
  Brain, BookOpen, Link, Maximize2, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KnowledgeGraph as GraphData, KnowledgeItem, EnhancedThought } from '@/types'
import { getKnowledgeService } from '@/lib/knowledgeService'

interface KnowledgeGraphProps {
  thoughts?: EnhancedThought[]
  onNodeClick?: (node: KnowledgeItem | EnhancedThought) => void
  className?: string
}

interface GraphNode {
  id: string
  x: number
  y: number
  type: 'thought' | 'knowledge'
  data: KnowledgeItem | EnhancedThought
  size: number
  color: string
  connections: string[]
}

interface GraphEdge {
  id: string
  from: string
  to: string
  type: string
  strength: number
  color: string
}

export function KnowledgeGraph({ thoughts = [], onNodeClick, className }: KnowledgeGraphProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    showThoughts: true,
    showKnowledge: true,
    minConnectionStrength: 0,
    selectedTypes: new Set<string>()
  })
  
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const knowledgeService = getKnowledgeService()

  // 加载图谱数据
  useEffect(() => {
    loadGraphData()
  }, [thoughts])

  // 生成节点和边
  useEffect(() => {
    if (graphData) {
      generateNodesAndEdges()
    }
  }, [graphData, filters])

  const loadGraphData = async () => {
    const graph = knowledgeService.generateKnowledgeGraph(thoughts)
    setGraphData(graph)
  }

  const generateNodesAndEdges = () => {
    if (!graphData) return

    const newNodes: GraphNode[] = []
    const newEdges: GraphEdge[] = []
    const containerWidth = containerRef.current?.clientWidth || 800
    const containerHeight = containerRef.current?.clientHeight || 600

    // 生成节点
    graphData.nodes.forEach((node, index) => {
      const isThought = 'content' in node
      const isKnowledge = 'type' in node && !('content' in node)

      // 应用过滤器
      if (isThought && !filters.showThoughts) return
      if (isKnowledge && !filters.showKnowledge) return

      // 计算节点位置（简单的圆形布局）
      const angle = (index / graphData.nodes.length) * 2 * Math.PI
      const radius = Math.min(containerWidth, containerHeight) * 0.3
      const centerX = containerWidth / 2
      const centerY = containerHeight / 2

      const graphNode: GraphNode = {
        id: node.id,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
        type: isThought ? 'thought' : 'knowledge',
        data: node,
        size: isThought ? 8 : 12,
        color: getNodeColor(node),
        connections: []
      }

      newNodes.push(graphNode)
    })

    // 生成边
    graphData.edges.forEach((edge) => {
      const fromNode = newNodes.find(n => n.id === getEdgeFromId(edge))
      const toNode = newNodes.find(n => n.id === getEdgeToId(edge))

      if (!fromNode || !toNode) return

      const strength = getEdgeStrength(edge)
      if (strength < filters.minConnectionStrength) return

      const graphEdge: GraphEdge = {
        id: edge.id,
        from: fromNode.id,
        to: toNode.id,
        type: getEdgeType(edge),
        strength,
        color: getEdgeColor(edge)
      }

      newEdges.push(graphEdge)

      // 更新节点连接信息
      fromNode.connections.push(toNode.id)
      toNode.connections.push(fromNode.id)
    })

    setNodes(newNodes)
    setEdges(newEdges)
  }

  // 处理鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // 缩放控制
  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(3, zoomLevel + delta))
    setZoomLevel(newZoom)
  }

  const resetView = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  // 节点点击
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node.id)
    onNodeClick?.(node.data)
  }

  // 工具函数
  const getNodeColor = (node: KnowledgeItem | EnhancedThought): string => {
    if ('content' in node) {
      // 思想节点
      return '#4ECDC4'
    } else {
      // 知识库节点
      const colorMap = {
        book: '#FF6B6B',
        article: '#4ECDC4',
        paper: '#45B7D1',
        course: '#96CEB4',
        podcast: '#FFEAA7',
        video: '#DDA0DD',
        note: '#FFB347'
      }
      return colorMap[node.type] || '#808080'
    }
  }

  const getEdgeFromId = (edge: any): string => {
    return edge.fromKnowledgeId || edge.fromThoughtId || edge.thoughtId
  }

  const getEdgeToId = (edge: any): string => {
    return edge.toKnowledgeId || edge.toThoughtId || edge.knowledgeId
  }

  const getEdgeStrength = (edge: any): number => {
    return edge.strength || edge.relevanceScore || 0.5
  }

  const getEdgeType = (edge: any): string => {
    return edge.type || 'related'
  }

  const getEdgeColor = (edge: any): string => {
    const strength = getEdgeStrength(edge)
    const opacity = Math.max(0.2, strength)
    return `rgba(100, 100, 100, ${opacity})`
  }

  return (
    <div className={cn("relative w-full h-full bg-card border border-border rounded-lg overflow-hidden", className)}>
      {/* 控制面板 */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 flex gap-2">
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="重置视图"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-md transition-colors",
              showFilters ? "bg-primary text-white" : "hover:bg-muted"
            )}
            title="过滤器"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* 图例 */}
        <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3">
          <div className="text-xs font-medium mb-2">图例</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#4ECDC4]" />
              <span>思想</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
              <span>知识库</span>
            </div>
          </div>
        </div>

        {/* 过滤器面板 */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 min-w-[200px]"
          >
            <div className="text-xs font-medium mb-3">过滤选项</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filters.showThoughts}
                  onChange={(e) => setFilters(prev => ({ ...prev, showThoughts: e.target.checked }))}
                  className="rounded"
                />
                显示思想
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filters.showKnowledge}
                  onChange={(e) => setFilters(prev => ({ ...prev, showKnowledge: e.target.checked }))}
                  className="rounded"
                />
                显示知识库
              </label>
              <div className="text-xs">
                <label>连接强度: {filters.minConnectionStrength.toFixed(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.minConnectionStrength}
                  onChange={(e) => setFilters(prev => ({ ...prev, minConnectionStrength: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 信息面板 */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3">
          <div className="text-xs font-medium mb-2">统计信息</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>节点: {nodes.length}</div>
            <div>连接: {edges.length}</div>
            <div>缩放: {(zoomLevel * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* SVG 图谱 */}
      <div ref={containerRef} className="w-full h-full">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
          }}
        >
          {/* 边 */}
          <g>
            {edges.map((edge) => {
              const fromNode = nodes.find(n => n.id === edge.from)
              const toNode = nodes.find(n => n.id === edge.to)
              
              if (!fromNode || !toNode) return null

              return (
                <line
                  key={edge.id}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={edge.color}
                  strokeWidth={edge.strength * 3}
                  strokeOpacity={0.6}
                  className="transition-all duration-200"
                />
              )
            })}
          </g>

          {/* 节点 */}
          <g>
            {nodes.map((node) => (
              <g key={node.id}>
                {/* 选中高亮 */}
                {selectedNode === node.id && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size + 4}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                )}
                
                {/* 悬停高亮 */}
                {hoveredNode === node.id && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size + 2}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                )}
                
                {/* 主节点 */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={node.color}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:r-[14px]"
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
                
                {/* 节点图标 */}
                <foreignObject
                  x={node.x - 8}
                  y={node.y - 8}
                  width="16"
                  height="16"
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center w-full h-full text-white">
                    {node.type === 'thought' ? (
                      <Brain className="w-3 h-3" />
                    ) : (
                      <BookOpen className="w-3 h-3" />
                    )}
                  </div>
                </foreignObject>
                
                {/* 节点标签 */}
                {(hoveredNode === node.id || selectedNode === node.id) && (
                  <text
                    x={node.x}
                    y={node.y - node.size - 8}
                    textAnchor="middle"
                    className="text-xs fill-foreground font-medium pointer-events-none"
                  >
                    {'title' in node.data 
                      ? node.data.title.substring(0, 20) + (node.data.title.length > 20 ? '...' : '')
                      : node.data.content.substring(0, 20) + (node.data.content.length > 20 ? '...' : '')
                    }
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* 选中节点详情 */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 max-w-md"
          >
            {(() => {
              const node = nodes.find(n => n.id === selectedNode)
              if (!node) return null

              const data = node.data
              const isThought = 'content' in data

              return (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isThought ? (
                        <Brain className="w-4 h-4 text-[#4ECDC4]" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-[#FF6B6B]" />
                      )}
                      <span className="text-sm font-medium">
                        {isThought ? '思想' : '知识库'}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="text-sm mb-2">
                    <div className="font-medium mb-1">
                      {isThought 
                        ? data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '')
                        : data.title
                      }
                    </div>
                    {!isThought && data.description && (
                      <div className="text-muted-foreground text-xs">
                        {data.description.substring(0, 100) + (data.description.length > 100 ? '...' : '')}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    连接数: {node.connections.length}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        </div>
      )}

      {/* 空状态 */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 opacity-50">
              <Network className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium mb-2">暂无图谱数据</h3>
            <p className="text-muted-foreground">
              添加一些思想和知识库项目来查看关联图谱
            </p>
          </div>
        </div>
      )}
    </div>
  )
}