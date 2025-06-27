import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ZoomIn, ZoomOut, RotateCcw, Filter, Search, 
  Brain, BookOpen, Link, Maximize2, Settings,
  Play, Pause, Download, Move, Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KnowledgeGraph as GraphData, KnowledgeItem, EnhancedThought } from '@/types'
import { getKnowledgeService } from '@/lib/knowledgeService'
import { GraphVisualizationEngine } from '../../lib/visualization/GraphVisualizationEngine'
import { 
  GraphVisualizationConfig,
  VisualizationMode,
  LayoutAlgorithm,
  RenderEngine,
  GraphInteractionEvent,
  NodeVisualization,
  EdgeVisualization,
  GraphStatistics,
  GraphFilter
} from '../../lib/visualization/types'

interface KnowledgeGraphProps {
  thoughts?: EnhancedThought[]
  knowledgeItems?: KnowledgeItem[]
  onNodeClick?: (node: KnowledgeItem | EnhancedThought) => void
  className?: string
  height?: number
  initialConfig?: Partial<GraphVisualizationConfig>
}

export function KnowledgeGraph({ 
  thoughts = [], 
  knowledgeItems = [],
  onNodeClick, 
  className,
  height = 600,
  initialConfig = {}
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GraphVisualizationEngine | null>(null)
  
  // 组件状态
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // 图谱状态
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<GraphStatistics | null>(null)
  
  // 控制面板状态
  const [showSettings, setShowSettings] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // 可视化设置
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(VisualizationMode.OVERVIEW)
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<LayoutAlgorithm>(LayoutAlgorithm.FORCE_DIRECTED)
  const [renderEngine, setRenderEngine] = useState<RenderEngine>(RenderEngine.CANVAS)
  const [zoom, setZoom] = useState(1)
  
  // 过滤器
  const [filters, setFilters] = useState<GraphFilter[]>([])
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  // 初始化图谱引擎
  useEffect(() => {
    if (!containerRef.current) return
    
    const initEngine = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 创建引擎实例
        const engine = new GraphVisualizationEngine(containerRef.current, {
          width: containerRef.current.clientWidth,
          height: height,
          renderEngine,
          layoutAlgorithm,
          mode: visualizationMode,
          ...initialConfig
        })
        
        engineRef.current = engine
        
        // 注册事件监听器
        engine.on('nodeClick', handleNodeClick)
        engine.on('edgeClick', handleEdgeClick)
        engine.on('nodeHover', handleNodeHover)
        engine.on('selectionChange', handleSelectionChange)
        engine.on('error', handleError)
        engine.on('layoutComplete', handleLayoutComplete)
        
        // 加载数据
        await engine.loadGraphData(thoughts, knowledgeItems)
        
        // 获取初始统计信息
        const stats = await engine.getStatistics()
        setStatistics(stats)
        
        setIsLoading(false)
      } catch (err) {
        console.error('初始化图谱引擎失败:', err)
        setError(err instanceof Error ? err.message : '未知错误')
        setIsLoading(false)
      }
    }
    
    initEngine()
    
    // 清理函数
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
    }
  }, []) // 只在组件挂载时初始化一次

  // 数据更新
  useEffect(() => {
    if (!engineRef.current || isLoading) return
    
    const updateData = async () => {
      try {
        await engineRef.current.loadGraphData(thoughts, knowledgeItems)
        const stats = await engineRef.current.getStatistics()
        setStatistics(stats)
      } catch (err) {
        console.error('更新图谱数据失败:', err)
      }
    }
    
    updateData()
  }, [thoughts, knowledgeItems])

  // 事件处理器
  const handleNodeClick = useCallback((event: GraphInteractionEvent) => {
    if (event.target.type === 'node' && event.target.id) {
      setSelectedNode(event.target.id)
      setSelectedEdge(null)
      // 调用原始的onNodeClick回调（需要获取节点数据）
      const nodeData = thoughts.find(t => t.id === event.target.id) || 
                      knowledgeItems.find(k => k.id === event.target.id)
      if (nodeData && onNodeClick) {
        onNodeClick(nodeData)
      }
    }
  }, [thoughts, knowledgeItems, onNodeClick])

  const handleEdgeClick = useCallback((event: GraphInteractionEvent) => {
    if (event.target.type === 'edge' && event.target.id) {
      setSelectedEdge(event.target.id)
      setSelectedNode(null)
    }
  }, [])

  const handleNodeHover = useCallback((event: GraphInteractionEvent) => {
    setHoveredNode(event.target.id || null)
  }, [])

  const handleSelectionChange = useCallback((selection: { nodes: string[], edges: string[] }) => {
    if (selection.nodes.length > 0) {
      setSelectedNode(selection.nodes[0])
      setSelectedEdge(null)
    } else if (selection.edges.length > 0) {
      setSelectedEdge(selection.edges[0])
      setSelectedNode(null)
    }
  }, [])

  const handleError = useCallback((error: Error) => {
    console.error('图谱错误:', error)
    setError(error.message)
  }, [])

  const handleLayoutComplete = useCallback(() => {
    console.log('布局计算完成')
  }, [])

  // 控制方法
  const handleZoomIn = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.zoomIn()
      setZoom(engineRef.current.getZoom())
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.zoomOut()
      setZoom(engineRef.current.getZoom())
    }
  }, [])

  const handleResetView = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetView()
      setZoom(1)
    }
  }, [])

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [isFullscreen])

  const handleToggleAnimation = useCallback(() => {
    if (engineRef.current) {
      if (isPlaying) {
        engineRef.current.pauseAnimation()
      } else {
        engineRef.current.startAnimation()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const handleExport = useCallback(async (format: 'png' | 'svg' | 'json') => {
    if (!engineRef.current) return
    
    try {
      const data = await engineRef.current.export({ 
        format, 
        quality: 0.9,
        includeMetadata: true 
      })
      
      // 创建下载链接
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : `image/${format}` 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `knowledge-graph-${new Date().toISOString()}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('导出失败:', err)
    }
  }, [])

  const handleSearch = useCallback((query: string) => {
    if (!engineRef.current) return
    
    setSearchQuery(query)
    if (query) {
      engineRef.current.search(query)
    } else {
      engineRef.current.clearSearch()
    }
  }, [])

  const handleModeChange = useCallback((mode: VisualizationMode) => {
    if (!engineRef.current) return
    
    setVisualizationMode(mode)
    engineRef.current.setVisualizationMode(mode)
  }, [])

  const handleLayoutChange = useCallback(async (layout: LayoutAlgorithm) => {
    if (!engineRef.current) return
    
    setLayoutAlgorithm(layout)
    await engineRef.current.setLayoutAlgorithm(layout)
  }, [])

  const handleFilterToggle = useCallback((filterId: string) => {
    const newActiveFilters = new Set(activeFilters)
    if (newActiveFilters.has(filterId)) {
      newActiveFilters.delete(filterId)
    } else {
      newActiveFilters.add(filterId)
    }
    setActiveFilters(newActiveFilters)
    
    if (engineRef.current) {
      engineRef.current.applyFilters(Array.from(newActiveFilters))
    }
  }, [activeFilters])

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center", `h-[${height}px]`, className)}>
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500">正在构建知识图谱...</p>
        </div>
      </div>
    )
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className={cn("flex items-center justify-center", `h-[${height}px]`, className)}>
        <div className="text-center">
          <p className="text-red-500 mb-4">加载知识图谱失败</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : '', className)}>
      {/* 图谱容器 */}
      <div 
        ref={containerRef}
        className="w-full bg-gray-50 dark:bg-gray-800 relative"
        style={{ height: isFullscreen ? '100vh' : height }}
      />
      
      {/* 控制面板 */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        {/* 左侧控制 */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* 模式选择 */}
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2">
            <select
              value={visualizationMode}
              onChange={(e) => handleModeChange(e.target.value as VisualizationMode)}
              className="text-sm bg-transparent outline-none"
            >
              <option value={VisualizationMode.OVERVIEW}>全景模式</option>
              <option value={VisualizationMode.FOCUS}>聚焦模式</option>
              <option value={VisualizationMode.CLUSTER}>集群模式</option>
              <option value={VisualizationMode.PATH}>路径模式</option>
              <option value={VisualizationMode.TEMPORAL}>时间模式</option>
              <option value={VisualizationMode.COMPARISON}>对比模式</option>
            </select>
          </div>
          
          {/* 布局选择 */}
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2">
            <select
              value={layoutAlgorithm}
              onChange={(e) => handleLayoutChange(e.target.value as LayoutAlgorithm)}
              className="text-sm bg-transparent outline-none"
            >
              <option value={LayoutAlgorithm.FORCE_DIRECTED}>力导向布局</option>
              <option value={LayoutAlgorithm.HIERARCHICAL}>层次布局</option>
              <option value={LayoutAlgorithm.CIRCULAR}>圆形布局</option>
              <option value={LayoutAlgorithm.RADIAL}>径向布局</option>
              <option value={LayoutAlgorithm.GRID}>网格布局</option>
              <option value={LayoutAlgorithm.ORGANIC}>有机布局</option>
              <option value={LayoutAlgorithm.TIMELINE}>时间线布局</option>
            </select>
          </div>
        </div>
        
        {/* 右侧工具栏 */}
        <div className="flex gap-2 pointer-events-auto">
          {/* 搜索 */}
          <motion.div
            initial={false}
            animate={{ width: showSearch ? 200 : 40 }}
            className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden"
          >
            {showSearch ? (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索节点..."
                className="w-full px-3 py-2 text-sm bg-transparent outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </motion.div>
          
          {/* 过滤器 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <Filter className="w-5 h-5" />
          </button>
          
          {/* 设置 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* 全屏 */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* 底部控制栏 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2">
        {/* 缩放控制 */}
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        
        <span className="px-3 py-2 text-sm min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        
        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* 动画控制 */}
        <button
          onClick={handleToggleAnimation}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        
        {/* 重置视图 */}
        <button
          onClick={handleResetView}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* 导出 */}
        <button
          onClick={() => handleExport('png')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          title="导出为PNG"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
      
      {/* 统计信息 */}
      {statistics && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-3 text-sm">
          <div className="flex gap-4">
            <div>
              <span className="text-gray-500 dark:text-gray-400">节点:</span>
              <span className="ml-1 font-medium">{statistics.overview.nodeCount}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">连接:</span>
              <span className="ml-1 font-medium">{statistics.overview.edgeCount}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">密度:</span>
              <span className="ml-1 font-medium">{statistics.overview.density.toFixed(3)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 节点详情面板 */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-20 right-4 w-80 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4"
          >
            <h3 className="font-medium mb-3">节点详情</h3>
            <div className="space-y-2 text-sm">
              <p>ID: {selectedNode}</p>
              {/* 更多节点信息 */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 过滤器面板 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-20 right-4 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4"
          >
            <h3 className="font-medium mb-3">过滤器</h3>
            <div className="space-y-2">
              {filters.map(filter => (
                <label key={filter.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeFilters.has(filter.id)}
                    onChange={() => handleFilterToggle(filter.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{filter.name}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}