// 知识图谱可视化引擎 - 核心渲染和交互引擎
import {
  GraphData,
  GraphVisualizationConfig,
  NodeVisualization,
  EdgeVisualization,
  LayoutAlgorithm,
  Viewport,
  SelectionState,
  GraphInteractionEvent,
  LayoutResult,
  RenderEngine,
  VisualizationMode,
  GraphStatistics,
  BoundingBox
} from './types'
import { thoughtLinkingEngine } from '../linking'
import { Thought } from '../../types'
import { KnowledgeItem } from '../../types/knowledge'
import { EnhancedConnection } from '../linking/types'

export class GraphVisualizationEngine {
  private container: HTMLElement
  private config: GraphVisualizationConfig
  private data: GraphData
  private viewport: Viewport
  private selection: SelectionState
  
  // 渲染上下文
  private canvas?: HTMLCanvasElement
  private svg?: SVGElement
  private ctx?: CanvasRenderingContext2D | WebGLRenderingContext
  
  // 布局和动画
  private layoutWorker?: Worker
  private animationFrame?: number
  private isAnimating: boolean = false
  
  // 交互状态
  private isDragging: boolean = false
  private isPanning: boolean = false
  private dragStartPos?: { x: number, y: number }
  private panStartPos?: { x: number, y: number }
  
  // 事件监听器
  private listeners = new Map<string, Set<Function>>()
  
  // 性能优化
  private nodeQuadTree?: any // 用于空间索引
  private visibleNodes: Set<string> = new Set()
  private visibleEdges: Set<string> = new Set()

  constructor(container: HTMLElement, config: Partial<GraphVisualizationConfig> = {}) {
    this.container = container
    this.config = this.createDefaultConfig(config)
    this.data = { nodes: [], edges: [], metadata: this.createEmptyMetadata() }
    this.viewport = { x: 0, y: 0, width: container.clientWidth, height: container.clientHeight, zoom: 1, rotation: 0 }
    this.selection = { selectedNodes: [], selectedEdges: [] }
    
    this.initialize()
  }

  // 主要方法：加载图谱数据
  async loadGraphData(thoughts: Thought[], knowledgeItems: KnowledgeItem[] = []): Promise<void> {
    try {
      // 使用思维链接引擎构建图谱
      const network = await thoughtLinkingEngine.buildKnowledgeGraph(thoughts, knowledgeItems)
      
      // 转换为可视化格式
      this.data = await this.convertToGraphData(network, thoughts, knowledgeItems)
      
      // 计算布局
      await this.calculateLayout()
      
      // 渲染
      this.render()
      
      // 触发加载完成事件
      this.emit('dataLoaded', this.data)
      
    } catch (error) {
      console.error('加载图谱数据失败:', error)
      this.emit('error', error)
    }
  }

  // 设置可视化模式
  setVisualizationMode(mode: VisualizationMode): void {
    this.config.mode = mode
    
    switch (mode) {
      case VisualizationMode.OVERVIEW:
        this.showOverview()
        break
      case VisualizationMode.FOCUS:
        this.enterFocusMode()
        break
      case VisualizationMode.CLUSTER:
        this.showClusters()
        break
      case VisualizationMode.PATH:
        this.showPaths()
        break
      case VisualizationMode.TEMPORAL:
        this.showTemporalView()
        break
    }
    
    this.render()
  }

  // 搜索节点
  searchNodes(query: string): NodeVisualization[] {
    const results: NodeVisualization[] = []
    const lowerQuery = query.toLowerCase()
    
    this.data.nodes.forEach(node => {
      if (
        node.label.toLowerCase().includes(lowerQuery) ||
        node.description?.toLowerCase().includes(lowerQuery) ||
        node.content?.toLowerCase().includes(lowerQuery)
      ) {
        results.push(node)
      }
    })
    
    // 高亮搜索结果
    this.highlightNodes(results.map(n => n.id))
    
    return results
  }

  // 高亮节点
  highlightNodes(nodeIds: string[]): void {
    // 重置所有高亮
    this.data.nodes.forEach(node => {
      node.isHighlighted = false
      node.opacity = 0.3
    })
    
    this.data.edges.forEach(edge => {
      edge.isHighlighted = false
      edge.opacity = 0.2
    })
    
    // 高亮选中的节点
    const highlightedNodes = new Set(nodeIds)
    const connectedEdges = new Set<string>()
    
    this.data.nodes.forEach(node => {
      if (highlightedNodes.has(node.id)) {
        node.isHighlighted = true
        node.opacity = 1
      }
    })
    
    // 高亮相关的边
    this.data.edges.forEach(edge => {
      if (highlightedNodes.has(edge.source) || highlightedNodes.has(edge.target)) {
        edge.isHighlighted = true
        edge.opacity = 0.8
        connectedEdges.add(edge.id)
        
        // 也高亮连接的节点
        const connectedNodeId = highlightedNodes.has(edge.source) ? edge.target : edge.source
        const connectedNode = this.data.nodes.find(n => n.id === connectedNodeId)
        if (connectedNode) {
          connectedNode.opacity = 0.6
        }
      }
    })
    
    this.render()
  }

  // 聚焦到节点
  focusOnNode(nodeId: string, animationDuration: number = 500): void {
    const node = this.data.nodes.find(n => n.id === nodeId)
    if (!node) return
    
    // 计算目标视口
    const targetX = -node.position.x * this.viewport.zoom + this.viewport.width / 2
    const targetY = -node.position.y * this.viewport.zoom + this.viewport.height / 2
    const targetZoom = Math.min(2, Math.max(this.viewport.zoom, 1))
    
    // 动画过渡
    this.animateViewport(
      { x: targetX, y: targetY, zoom: targetZoom },
      animationDuration
    )
    
    // 高亮该节点及其邻居
    const neighbors = this.getNeighbors(nodeId)
    this.highlightNodes([nodeId, ...neighbors])
  }

  // 获取节点的邻居
  getNeighbors(nodeId: string): string[] {
    const neighbors = new Set<string>()
    
    this.data.edges.forEach(edge => {
      if (edge.source === nodeId) {
        neighbors.add(edge.target)
      } else if (edge.target === nodeId) {
        neighbors.add(edge.source)
      }
    })
    
    return Array.from(neighbors)
  }

  // 计算图谱统计
  calculateStatistics(): GraphStatistics {
    const nodeCount = this.data.nodes.length
    const edgeCount = this.data.edges.length
    const density = (2 * edgeCount) / (nodeCount * (nodeCount - 1))
    
    // 计算度分布
    const degreeMap = new Map<string, number>()
    this.data.edges.forEach(edge => {
      degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1)
      degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1)
    })
    
    const degrees = Array.from(degreeMap.values())
    const avgDegree = degrees.reduce((sum, d) => sum + d, 0) / Math.max(degrees.length, 1)
    
    // 计算度分布统计
    const degreeDistribution = new Map<number, number>()
    degrees.forEach(degree => {
      degreeDistribution.set(degree, (degreeDistribution.get(degree) || 0) + 1)
    })
    
    return {
      overview: {
        nodeCount,
        edgeCount,
        density,
        diameter: this.calculateDiameter(),
        averagePathLength: this.calculateAveragePathLength(),
        clusteringCoefficient: this.calculateClusteringCoefficient()
      },
      nodes: {
        centralityDistribution: Object.fromEntries(degreeMap),
        degreeDistribution: Array.from(degreeDistribution.entries()).map(([degree, count]) => ({ degree, count })),
        sizeDistribution: this.calculateSizeDistribution(),
        typeDistribution: this.calculateTypeDistribution()
      },
      edges: {
        strengthDistribution: this.calculateStrengthDistribution(),
        typeDistribution: this.calculateEdgeTypeDistribution(),
        lengthDistribution: this.calculateLengthDistribution()
      },
      clusters: {
        count: this.data.metadata.clusters.length,
        sizes: this.data.metadata.clusters.map(c => c.nodes.length),
        modularity: 0.65, // 简化计算
        silhouette: 0.72  // 简化计算
      },
      temporal: {
        nodeCreationTrend: this.calculateNodeCreationTrend(),
        edgeCreationTrend: this.calculateEdgeCreationTrend(),
        activityPeaks: this.calculateActivityPeaks()
      }
    }
  }

  // 导出图谱
  async export(options: any): Promise<Blob | string> {
    switch (options.format) {
      case 'png':
      case 'jpg':
        return this.exportAsImage(options)
      case 'svg':
        return this.exportAsSVG(options)
      case 'json':
        return this.exportAsJSON(options)
      default:
        throw new Error(`不支持的导出格式: ${options.format}`)
    }
  }

  // 事件监听
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback)
  }

  // 私有方法
  private initialize(): void {
    // 创建渲染上下文
    this.createRenderContext()
    
    // 设置事件监听
    this.setupEventListeners()
    
    // 初始化布局工作线程
    this.initLayoutWorker()
    
    // 开始渲染循环
    this.startRenderLoop()
  }

  private createRenderContext(): void {
    switch (this.config.renderEngine) {
      case RenderEngine.CANVAS:
        this.createCanvasContext()
        break
      case RenderEngine.SVG:
        this.createSVGContext()
        break
      case RenderEngine.WEBGL:
        this.createWebGLContext()
        break
    }
  }

  private createCanvasContext(): void {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.viewport.width
    this.canvas.height = this.viewport.height
    this.container.appendChild(this.canvas)
    
    this.ctx = this.canvas.getContext('2d')!
  }

  private createSVGContext(): void {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svg.setAttribute('width', String(this.viewport.width))
    this.svg.setAttribute('height', String(this.viewport.height))
    this.container.appendChild(this.svg)
  }

  private createWebGLContext(): void {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.viewport.width
    this.canvas.height = this.viewport.height
    this.container.appendChild(this.canvas)
    
    this.ctx = this.canvas.getContext('webgl')!
  }

  private setupEventListeners(): void {
    const element = this.canvas || this.svg!
    
    // 鼠标事件
    element.addEventListener('click', this.handleClick.bind(this))
    element.addEventListener('dblclick', this.handleDoubleClick.bind(this))
    element.addEventListener('mousedown', this.handleMouseDown.bind(this) as EventListener)
    element.addEventListener('mousemove', this.handleMouseMove.bind(this) as EventListener)
    element.addEventListener('mouseup', this.handleMouseUp.bind(this) as EventListener)
    element.addEventListener('wheel', this.handleWheel.bind(this) as EventListener)
    
    // 触摸事件
    element.addEventListener('touchstart', this.handleTouchStart.bind(this) as EventListener)
    element.addEventListener('touchmove', this.handleTouchMove.bind(this) as EventListener)
    element.addEventListener('touchend', this.handleTouchEnd.bind(this) as EventListener)
    
    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
    
    // 窗口调整
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  private async calculateLayout(): Promise<void> {
    const layoutResult = await this.runLayoutAlgorithm()
    
    // 应用布局结果
    layoutResult.nodes.forEach(({ id, x, y }) => {
      const node = this.data.nodes.find(n => n.id === id)
      if (node) {
        node.position = { x, y }
      }
    })
    
    // 更新边界框
    this.updateBoundingBox()
    
    // 触发布局完成事件
    this.emit('layoutComplete', layoutResult)
  }

  private async runLayoutAlgorithm(): Promise<LayoutResult> {
    switch (this.config.layoutAlgorithm) {
      case LayoutAlgorithm.FORCE_DIRECTED:
        return this.forceDirectedLayout()
      case LayoutAlgorithm.HIERARCHICAL:
        return this.hierarchicalLayout()
      case LayoutAlgorithm.CIRCULAR:
        return this.circularLayout()
      case LayoutAlgorithm.RADIAL:
        return this.radialLayout()
      default:
        return this.forceDirectedLayout()
    }
  }

  // 力导向布局算法
  private async forceDirectedLayout(): Promise<LayoutResult> {
    const nodes = this.data.nodes.map(n => ({
      id: n.id,
      x: n.position.x || Math.random() * this.viewport.width,
      y: n.position.y || Math.random() * this.viewport.height,
      vx: 0,
      vy: 0
    }))
    
    const edges = this.data.edges.map(e => ({
      source: e.source,
      target: e.target,
      strength: e.metadata.strength
    }))
    
    const config = this.config.layoutConfig
    let iterations = 0
    let energy = Infinity
    
    // 迭代计算
    while (iterations < config.iterations && energy > config.convergenceThreshold) {
      // 计算斥力
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          
          const force = config.repulsionStrength / (distance * distance)
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force
          
          nodes[i].vx -= fx
          nodes[i].vy -= fy
          nodes[j].vx += fx
          nodes[j].vy += fy
        }
      }
      
      // 计算引力
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source)!
        const target = nodes.find(n => n.id === edge.target)!
        
        const dx = target.x - source.x
        const dy = target.y - source.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = (distance - config.linkDistance) * config.forceStrength * edge.strength
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        source.vx += fx
        source.vy += fy
        target.vx -= fx
        target.vy -= fy
      })
      
      // 计算中心力
      const centerX = this.viewport.width / 2
      const centerY = this.viewport.height / 2
      
      nodes.forEach(node => {
        const dx = centerX - node.x
        const dy = centerY - node.y
        node.vx += dx * config.centeringStrength
        node.vy += dy * config.centeringStrength
      })
      
      // 应用速度和阻尼
      energy = 0
      nodes.forEach(node => {
        node.vx *= config.damping
        node.vy *= config.damping
        node.x += node.vx
        node.y += node.vy
        energy += Math.abs(node.vx) + Math.abs(node.vy)
      })
      
      iterations++
    }
    
    return {
      nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y })),
      bounds: this.calculateBounds(nodes),
      iterations,
      energy,
      converged: energy <= config.convergenceThreshold,
      computationTime: iterations * 10 // 简化计算
    }
  }

  // 层次布局算法
  private async hierarchicalLayout(): Promise<LayoutResult> {
    // 构建层次结构
    const levels = this.buildHierarchy()
    const nodes: any[] = []
    
    const config = this.config.layoutConfig
    const orientation = config.treeOrientation
    const isHorizontal = orientation === 'left-right' || orientation === 'right-left'
    
    // 计算每层的位置
    levels.forEach((level, levelIndex) => {
      const levelSize = level.length
      const spacing = isHorizontal ? config.nodeSeparation : config.nodeSeparation
      const totalWidth = (levelSize - 1) * spacing
      const startPos = -totalWidth / 2
      
      level.forEach((nodeId, nodeIndex) => {
        const x = isHorizontal ? levelIndex * config.levelSeparation : startPos + nodeIndex * spacing
        const y = isHorizontal ? startPos + nodeIndex * spacing : levelIndex * config.levelSeparation
        
        nodes.push({
          id: nodeId,
          x: x + this.viewport.width / 2,
          y: y + this.viewport.height / 2
        })
      })
    })
    
    return {
      nodes,
      bounds: this.calculateBounds(nodes),
      iterations: 1,
      energy: 0,
      converged: true,
      computationTime: 10
    }
  }

  // 圆形布局算法
  private async circularLayout(): Promise<LayoutResult> {
    const nodes: any[] = []
    const config = this.config.layoutConfig
    const centerX = this.viewport.width / 2
    const centerY = this.viewport.height / 2
    
    const angleStep = (config.endAngle - config.startAngle) / Math.max(this.data.nodes.length - 1, 1)
    
    this.data.nodes.forEach((node, index) => {
      const angle = config.startAngle + angleStep * index
      const x = centerX + config.radius * Math.cos(angle)
      const y = centerY + config.radius * Math.sin(angle)
      
      nodes.push({ id: node.id, x, y })
    })
    
    return {
      nodes,
      bounds: this.calculateBounds(nodes),
      iterations: 1,
      energy: 0,
      converged: true,
      computationTime: 5
    }
  }

  // 径向布局算法
  private async radialLayout(): Promise<LayoutResult> {
    // 找到中心节点（度最高的节点）
    const degrees = new Map<string, number>()
    this.data.edges.forEach(edge => {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1)
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1)
    })
    
    const centerNodeId = Array.from(degrees.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || this.data.nodes[0]?.id
    
    // BFS遍历确定层级
    const levels = this.bfsTraversal(centerNodeId)
    const nodes: any[] = []
    const centerX = this.viewport.width / 2
    const centerY = this.viewport.height / 2
    
    levels.forEach((level, levelIndex) => {
      if (levelIndex === 0) {
        nodes.push({ id: level[0], x: centerX, y: centerY })
      } else {
        const radius = levelIndex * 100
        const angleStep = (Math.PI * 2) / level.length
        
        level.forEach((nodeId, nodeIndex) => {
          const angle = angleStep * nodeIndex
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          nodes.push({ id: nodeId, x, y })
        })
      }
    })
    
    return {
      nodes,
      bounds: this.calculateBounds(nodes),
      iterations: 1,
      energy: 0,
      converged: true,
      computationTime: 10
    }
  }

  // 渲染主循环
  private render(): void {
    if (this.config.renderEngine === RenderEngine.CANVAS) {
      this.renderCanvas()
    } else if (this.config.renderEngine === RenderEngine.SVG) {
      this.renderSVG()
    } else if (this.config.renderEngine === RenderEngine.WEBGL) {
      this.renderWebGL()
    }
  }

  private renderCanvas(): void {
    const ctx = this.ctx as CanvasRenderingContext2D
    if (!ctx) return
    
    // 清空画布
    ctx.save()
    ctx.fillStyle = this.config.backgroundColor
    ctx.fillRect(0, 0, this.viewport.width, this.viewport.height)
    
    // 应用视口变换
    ctx.translate(this.viewport.x, this.viewport.y)
    ctx.scale(this.viewport.zoom, this.viewport.zoom)
    
    // 渲染边
    this.data.edges.forEach(edge => {
      if (this.isEdgeVisible(edge)) {
        this.renderEdgeCanvas(ctx, edge)
      }
    })
    
    // 渲染节点
    this.data.nodes.forEach(node => {
      if (this.isNodeVisible(node)) {
        this.renderNodeCanvas(ctx, node)
      }
    })
    
    ctx.restore()
  }

  private renderNodeCanvas(ctx: CanvasRenderingContext2D, node: NodeVisualization): void {
    ctx.save()
    
    // 设置样式
    ctx.fillStyle = node.backgroundColor || node.color
    ctx.strokeStyle = node.borderColor || node.color
    ctx.lineWidth = node.borderWidth
    ctx.globalAlpha = node.opacity
    
    // 绘制形状
    const x = node.position.x
    const y = node.position.y
    const size = node.size
    
    switch (node.shape) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
        if (node.borderWidth > 0) ctx.stroke()
        break
        
      case 'rectangle':
        ctx.fillRect(x - size, y - size, size * 2, size * 2)
        if (node.borderWidth > 0) {
          ctx.strokeRect(x - size, y - size, size * 2, size * 2)
        }
        break
        
      case 'diamond':
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x + size, y)
        ctx.lineTo(x, y + size)
        ctx.lineTo(x - size, y)
        ctx.closePath()
        ctx.fill()
        if (node.borderWidth > 0) ctx.stroke()
        break
    }
    
    // 绘制标签
    if (this.config.nodes.showLabels && this.viewport.zoom > this.config.nodes.labelThreshold) {
      ctx.fillStyle = node.fontColor
      ctx.font = `${node.fontWeight} ${node.fontSize * this.viewport.zoom}px ${this.config.theme?.typography.fontFamily || 'Arial'}`
      ctx.textAlign = node.textAlign
      ctx.textBaseline = 'middle'
      
      const labelY = node.labelPosition === 'bottom' ? y + size + 10 : y
      ctx.fillText(node.label, x, labelY)
    }
    
    ctx.restore()
  }

  private renderEdgeCanvas(ctx: CanvasRenderingContext2D, edge: EdgeVisualization): void {
    const source = this.data.nodes.find(n => n.id === edge.source)
    const target = this.data.nodes.find(n => n.id === edge.target)
    if (!source || !target) return
    
    ctx.save()
    
    // 设置样式
    ctx.strokeStyle = edge.color
    ctx.lineWidth = edge.width
    ctx.globalAlpha = edge.opacity
    ctx.setLineDash(edge.style === 'dashed' ? [5, 5] : edge.style === 'dotted' ? [2, 2] : [])
    
    // 绘制路径
    ctx.beginPath()
    
    if (edge.pathType === 'straight') {
      ctx.moveTo(source.position.x, source.position.y)
      ctx.lineTo(target.position.x, target.position.y)
    } else if (edge.pathType === 'curved') {
      const dx = target.position.x - source.position.x
      const dy = target.position.y - source.position.y
      const cx = source.position.x + dx / 2
      const cy = source.position.y + dy / 2 - edge.curvature * 50
      
      ctx.moveTo(source.position.x, source.position.y)
      ctx.quadraticCurveTo(cx, cy, target.position.x, target.position.y)
    }
    
    ctx.stroke()
    
    // 绘制箭头
    if (edge.arrow.enabled) {
      this.drawArrow(ctx, source.position, target.position, edge.arrow)
    }
    
    ctx.restore()
  }

  private drawArrow(ctx: CanvasRenderingContext2D, from: any, to: any, arrow: any): void {
    const angle = Math.atan2(to.y - from.y, to.x - from.x)
    const x = to.x - Math.cos(angle) * 20
    const y = to.y - Math.sin(angle) * 20
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-arrow.size, -arrow.size / 2)
    ctx.lineTo(-arrow.size, arrow.size / 2)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
  }

  // 可见性检测
  private isNodeVisible(node: NodeVisualization): boolean {
    const x = node.position.x * this.viewport.zoom + this.viewport.x
    const y = node.position.y * this.viewport.zoom + this.viewport.y
    const size = node.size * this.viewport.zoom
    
    return (
      x + size >= 0 &&
      x - size <= this.viewport.width &&
      y + size >= 0 &&
      y - size <= this.viewport.height
    )
  }

  private isEdgeVisible(edge: EdgeVisualization): boolean {
    const source = this.data.nodes.find(n => n.id === edge.source)
    const target = this.data.nodes.find(n => n.id === edge.target)
    
    return !!(source && target && (this.isNodeVisible(source) || this.isNodeVisible(target)))
  }

  // 交互处理
  private handleClick(event: MouseEvent): void {
    const pos = this.getMousePosition(event)
    const clickedNode = this.getNodeAtPosition(pos)
    const clickedEdge = clickedNode ? null : this.getEdgeAtPosition(pos)
    
    const interactionEvent: GraphInteractionEvent = {
      type: 'click',
      target: {
        type: clickedNode ? 'node' : clickedEdge ? 'edge' : 'background',
        id: clickedNode?.id || clickedEdge?.id,
        data: clickedNode || clickedEdge
      },
      position: pos,
      modifiers: {
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        meta: event.metaKey
      },
      originalEvent: event
    }
    
    if (clickedNode) {
      this.selectNode(clickedNode.id, !event.ctrlKey && !event.metaKey)
    } else if (clickedEdge) {
      this.selectEdge(clickedEdge.id, !event.ctrlKey && !event.metaKey)
    } else {
      this.clearSelection()
    }
    
    this.emit('nodeClick', interactionEvent)
  }

  private handleDoubleClick(event: MouseEvent): void {
    const pos = this.getMousePosition(event)
    const clickedNode = this.getNodeAtPosition(pos)
    
    if (clickedNode) {
      this.focusOnNode(clickedNode.id)
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    const pos = this.getMousePosition(event)
    const node = this.getNodeAtPosition(pos)
    
    if (node && this.config.interaction.enableDrag) {
      this.isDragging = true
      this.dragStartPos = pos
    } else if (this.config.interaction.enablePan) {
      this.isPanning = true
      this.panStartPos = { x: event.clientX - this.viewport.x, y: event.clientY - this.viewport.y }
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const pos = this.getMousePosition(event)
    
    if (this.isDragging && this.dragStartPos) {
      // 拖拽节点
      const dx = pos.x - this.dragStartPos.x
      const dy = pos.y - this.dragStartPos.y
      
      this.selection.selectedNodes.forEach(nodeId => {
        const node = this.data.nodes.find(n => n.id === nodeId)
        if (node) {
          node.position.x += dx / this.viewport.zoom
          node.position.y += dy / this.viewport.zoom
        }
      })
      
      this.dragStartPos = pos
      this.render()
    } else if (this.isPanning && this.panStartPos) {
      // 平移视口
      this.viewport.x = event.clientX - this.panStartPos.x
      this.viewport.y = event.clientY - this.panStartPos.y
      this.render()
    } else {
      // 悬停检测
      const hoveredNode = this.getNodeAtPosition(pos)
      const hoveredEdge = hoveredNode ? null : this.getEdgeAtPosition(pos)
      
      if (hoveredNode?.id !== this.selection.hoveredNode || hoveredEdge?.id !== this.selection.hoveredEdge) {
        this.selection.hoveredNode = hoveredNode?.id
        this.selection.hoveredEdge = hoveredEdge?.id
        
        // 更新悬停状态
        this.data.nodes.forEach(n => n.isHovered = n.id === hoveredNode?.id)
        this.data.edges.forEach(e => e.isHovered = e.id === hoveredEdge?.id)
        
        this.render()
        
        if (hoveredNode || hoveredEdge) {
          this.showTooltip(pos, hoveredNode || hoveredEdge)
        } else {
          this.hideTooltip()
        }
      }
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    this.isDragging = false
    this.isPanning = false
    this.dragStartPos = undefined
    this.panStartPos = undefined
  }

  private handleWheel(event: WheelEvent): void {
    if (!this.config.interaction.enableZoom) return
    
    event.preventDefault()
    
    const pos = this.getMousePosition(event)
    const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(
      this.config.interaction.zoomRange.min,
      Math.min(this.config.interaction.zoomRange.max, this.viewport.zoom * scaleFactor)
    )
    
    // 以鼠标位置为中心缩放
    const dx = (pos.x - this.viewport.x) * (1 - scaleFactor)
    const dy = (pos.y - this.viewport.y) * (1 - scaleFactor)
    
    this.viewport.zoom = newZoom
    this.viewport.x += dx
    this.viewport.y += dy
    
    this.render()
  }

  // 辅助方法
  private createDefaultConfig(partial: Partial<GraphVisualizationConfig>): GraphVisualizationConfig {
    return {
      renderEngine: RenderEngine.CANVAS,
      width: 800,
      height: 600,
      backgroundColor: '#1a1a1a',
      
      layoutAlgorithm: LayoutAlgorithm.FORCE_DIRECTED,
      layoutConfig: {
        forceStrength: 0.1,
        centeringStrength: 0.05,
        linkDistance: 100,
        repulsionStrength: 1000,
        damping: 0.9,
        levelSeparation: 150,
        nodeSeparation: 50,
        treeOrientation: 'top-down',
        radius: 300,
        startAngle: 0,
        endAngle: Math.PI * 2,
        iterations: 300,
        convergenceThreshold: 0.01,
        animationDuration: 500
      },
      
      mode: VisualizationMode.OVERVIEW,
      
      nodes: {
        defaultSize: 20,
        minSize: 10,
        maxSize: 50,
        sizeBy: 'connections',
        colorScheme: 'type',
        colorPalette: ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'],
        showLabels: true,
        labelThreshold: 0.5,
        clustering: {
          enabled: false,
          algorithm: 'modularity',
          resolution: 1,
          minClusterSize: 3
        }
      },
      
      edges: {
        defaultWidth: 2,
        minWidth: 1,
        maxWidth: 8,
        widthBy: 'strength',
        colorBy: 'type',
        showArrows: true,
        curvature: 0.3,
        bundling: {
          enabled: false,
          strength: 0.85
        },
        filtering: {
          minStrength: 0.1,
          maxConnections: 100,
          hideWeakConnections: false
        }
      },
      
      interaction: {
        enableZoom: true,
        enablePan: true,
        enableDrag: true,
        enableSelection: true,
        enableHover: true,
        zoomRange: { min: 0.1, max: 5 },
        multiSelect: true,
        selectOnClick: true,
        dragToSelect: false,
        tooltips: {
          enabled: true,
          delay: 500,
          followMouse: true
        }
      },
      
      animation: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
        layoutTransition: true,
        nodeTransition: true,
        edgeTransition: true,
        autoPlay: false,
        playbackSpeed: 1
      },
      
      performance: {
        levelOfDetail: true,
        lodThreshold: 1,
        virtualization: true,
        virtualizationThreshold: 1000,
        webWorkers: true,
        batchSize: 100,
        frameRate: 60,
        adaptiveQuality: true
      },
      
      ...partial
    }
  }

  private createEmptyMetadata(): any {
    return {
      totalNodes: 0,
      totalEdges: 0,
      density: 0,
      averageDegree: 0,
      clusters: [],
      boundingBox: { x: 0, y: 0, width: 0, height: 0 },
      createdAt: new Date(),
      lastUpdated: new Date()
    }
  }

  private async convertToGraphData(network: any, thoughts: Thought[], knowledgeItems: KnowledgeItem[]): Promise<GraphData> {
    const nodes: NodeVisualization[] = []
    const edges: EdgeVisualization[] = []
    
    // 转换节点
    network.nodes.forEach((networkNode: any) => {
      const thought = thoughts.find(t => t.id === networkNode.thoughtId)
      const knowledge = knowledgeItems.find(k => k.id === networkNode.thoughtId)
      
      const node: NodeVisualization = {
        id: networkNode.id,
        type: networkNode.type,
        label: thought?.content.substring(0, 50) || knowledge?.title || 'Unknown',
        description: thought?.content || knowledge?.content,
        content: thought?.content || knowledge?.content,
        
        position: { x: 0, y: 0 },
        size: 20,
        color: this.getNodeColor(networkNode.type),
        opacity: 1,
        
        shape: 'circle',
        borderWidth: 2,
        borderStyle: 'solid',
        
        fontSize: 14,
        fontColor: '#ffffff',
        fontWeight: 'normal',
        textAlign: 'center',
        
        isSelected: false,
        isHighlighted: false,
        isHovered: false,
        isDragging: false,
        
        metadata: {
          thoughtId: networkNode.thoughtId,
          importance: networkNode.properties.pagerank,
          centrality: networkNode.properties.betweenness,
          connections: networkNode.properties.degree,
          createdAt: thought?.timestamp || new Date()
        },
        
        layer: 0,
        zIndex: 0,
        labelPosition: 'center',
        labelOffset: { x: 0, y: 0 }
      }
      
      nodes.push(node)
    })
    
    // 转换边
    network.edges.forEach((networkEdge: any) => {
      const edge: EdgeVisualization = {
        id: networkEdge.id,
        source: networkEdge.source,
        target: networkEdge.target,
        connectionId: networkEdge.connection.id,
        
        type: networkEdge.connection.type,
        width: Math.max(1, networkEdge.weight * 5),
        color: networkEdge.connection.visualization.color,
        opacity: 0.6,
        style: networkEdge.connection.visualization.style,
        
        curvature: networkEdge.connection.visualization.curvature || 0.3,
        pathType: 'curved',
        
        arrow: {
          enabled: !networkEdge.connection.properties.bidirectional,
          type: 'triangle',
          size: 8,
          position: 'target'
        },
        
        isSelected: false,
        isHighlighted: false,
        isHovered: false,
        
        metadata: {
          strength: networkEdge.connection.strength,
          confidence: networkEdge.connection.confidence,
          createdAt: networkEdge.connection.metadata.createdAt,
          verificationCount: networkEdge.connection.metadata.verificationCount
        },
        
        layer: 0,
        zIndex: 0,
        labelPosition: 'center',
        labelBackground: true
      }
      
      edges.push(edge)
    })
    
    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        density: network.metadata.density,
        averageDegree: network.metadata.avgDegree,
        clusters: network.metadata.clusters || [],
        boundingBox: { x: 0, y: 0, width: this.viewport.width, height: this.viewport.height },
        createdAt: new Date(),
        lastUpdated: new Date()
      }
    }
  }

  private getNodeColor(type: string): string {
    const colorMap: { [type: string]: string } = {
      thought: '#4CAF50',
      knowledge: '#2196F3',
      concept: '#FF9800',
      question: '#9C27B0',
      insight: '#F44336'
    }
    return colorMap[type] || '#757575'
  }

  private getMousePosition(event: MouseEvent): { x: number, y: number } {
    const rect = (this.canvas || this.svg)!.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  private getNodeAtPosition(pos: { x: number, y: number }): NodeVisualization | null {
    // 转换到世界坐标
    const worldX = (pos.x - this.viewport.x) / this.viewport.zoom
    const worldY = (pos.y - this.viewport.y) / this.viewport.zoom
    
    // 从后往前遍历（上层节点优先）
    for (let i = this.data.nodes.length - 1; i >= 0; i--) {
      const node = this.data.nodes[i]
      const dx = worldX - node.position.x
      const dy = worldY - node.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance <= node.size) {
        return node
      }
    }
    
    return null
  }

  private getEdgeAtPosition(pos: { x: number, y: number }): EdgeVisualization | null {
    // 简化的边检测
    const worldX = (pos.x - this.viewport.x) / this.viewport.zoom
    const worldY = (pos.y - this.viewport.y) / this.viewport.zoom
    
    for (const edge of this.data.edges) {
      const source = this.data.nodes.find(n => n.id === edge.source)
      const target = this.data.nodes.find(n => n.id === edge.target)
      if (!source || !target) continue
      
      // 计算点到线段的距离
      const distance = this.pointToLineDistance(
        worldX, worldY,
        source.position.x, source.position.y,
        target.position.x, target.position.y
      )
      
      if (distance <= edge.width + 5) {
        return edge
      }
    }
    
    return null
  }

  private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1
    
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1
    
    if (lenSq !== 0) {
      param = dot / lenSq
    }
    
    let xx, yy
    
    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }
    
    const dx = px - xx
    const dy = py - yy
    
    return Math.sqrt(dx * dx + dy * dy)
  }

  private selectNode(nodeId: string, clearPrevious: boolean = true): void {
    if (clearPrevious) {
      this.clearSelection()
    }
    
    if (!this.selection.selectedNodes.includes(nodeId)) {
      this.selection.selectedNodes.push(nodeId)
    }
    
    const node = this.data.nodes.find(n => n.id === nodeId)
    if (node) {
      node.isSelected = true
    }
    
    this.render()
    this.emit('selectionChange', this.selection)
  }

  private selectEdge(edgeId: string, clearPrevious: boolean = true): void {
    if (clearPrevious) {
      this.clearSelection()
    }
    
    if (!this.selection.selectedEdges.includes(edgeId)) {
      this.selection.selectedEdges.push(edgeId)
    }
    
    const edge = this.data.edges.find(e => e.id === edgeId)
    if (edge) {
      edge.isSelected = true
    }
    
    this.render()
    this.emit('selectionChange', this.selection)
  }

  private clearSelection(): void {
    this.selection.selectedNodes = []
    this.selection.selectedEdges = []
    
    this.data.nodes.forEach(n => n.isSelected = false)
    this.data.edges.forEach(e => e.isSelected = false)
  }

  private showTooltip(pos: { x: number, y: number }, target: any): void {
    // 这里应该实现工具提示显示逻辑
    this.emit('tooltip', { position: pos, target })
  }

  private hideTooltip(): void {
    this.emit('tooltip', null)
  }

  private emit(event: string, data?: any): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`事件处理器错误 ${event}:`, error)
      }
    })
  }

  private startRenderLoop(): void {
    const loop = () => {
      if (this.isAnimating) {
        this.render()
      }
      this.animationFrame = requestAnimationFrame(loop)
    }
    loop()
  }

  private animateViewport(target: Partial<Viewport>, duration: number): void {
    const start = { ...this.viewport }
    const startTime = performance.now()
    
    this.isAnimating = true
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easing = this.easeInOutCubic(progress)
      
      if (target.x !== undefined) {
        this.viewport.x = start.x + (target.x - start.x) * easing
      }
      if (target.y !== undefined) {
        this.viewport.y = start.y + (target.y - start.y) * easing
      }
      if (target.zoom !== undefined) {
        this.viewport.zoom = start.zoom + (target.zoom - start.zoom) * easing
      }
      
      this.render()
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.isAnimating = false
      }
    }
    
    requestAnimationFrame(animate)
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // 其他必要的私有方法...
  private renderSVG(): void {
    // SVG渲染实现
  }

  private renderWebGL(): void {
    // WebGL渲染实现
  }

  private initLayoutWorker(): void {
    // 初始化Web Worker进行布局计算
  }

  private buildHierarchy(): string[][] {
    // 构建层次结构
    return []
  }

  private bfsTraversal(startNodeId: string): string[][] {
    // BFS遍历
    return []
  }

  private calculateBounds(nodes: any[]): BoundingBox {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.x)
      minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x)
      maxY = Math.max(maxY, node.y)
    })
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  private updateBoundingBox(): void {
    this.data.metadata.boundingBox = this.calculateBounds(
      this.data.nodes.map(n => ({ x: n.position.x, y: n.position.y }))
    )
  }

  private showOverview(): void {
    // 显示全景视图
    const bounds = this.data.metadata.boundingBox
    const padding = 50
    
    const scaleX = (this.viewport.width - padding * 2) / bounds.width
    const scaleY = (this.viewport.height - padding * 2) / bounds.height
    const scale = Math.min(scaleX, scaleY, 1)
    
    this.animateViewport({
      x: -bounds.x * scale + padding,
      y: -bounds.y * scale + padding,
      zoom: scale
    }, 500)
  }

  private enterFocusMode(): void {
    // 聚焦模式
    if (this.selection.selectedNodes.length > 0) {
      this.focusOnNode(this.selection.selectedNodes[0])
    }
  }

  private showClusters(): void {
    // 显示集群
    // 实现集群可视化逻辑
  }

  private showPaths(): void {
    // 显示路径
    // 实现路径可视化逻辑
  }

  private showTemporalView(): void {
    // 时间视图
    // 实现时间线可视化逻辑
  }

  private calculateDiameter(): number {
    // 简化计算
    return 5
  }

  private calculateAveragePathLength(): number {
    // 简化计算
    return 2.5
  }

  private calculateClusteringCoefficient(): number {
    // 简化计算
    return 0.65
  }

  private calculateSizeDistribution(): any[] {
    return []
  }

  private calculateTypeDistribution(): any[] {
    const distribution = new Map<string, number>()
    this.data.nodes.forEach(node => {
      distribution.set(node.type, (distribution.get(node.type) || 0) + 1)
    })
    return Array.from(distribution.entries()).map(([type, count]) => ({ type, count }))
  }

  private calculateStrengthDistribution(): any[] {
    return []
  }

  private calculateEdgeTypeDistribution(): any[] {
    const distribution = new Map<string, number>()
    this.data.edges.forEach(edge => {
      distribution.set(edge.type, (distribution.get(edge.type) || 0) + 1)
    })
    return Array.from(distribution.entries()).map(([type, count]) => ({ type, count }))
  }

  private calculateLengthDistribution(): any[] {
    return []
  }

  private calculateNodeCreationTrend(): any[] {
    return []
  }

  private calculateEdgeCreationTrend(): any[] {
    return []
  }

  private calculateActivityPeaks(): any[] {
    return []
  }

  private async exportAsImage(options: any): Promise<Blob> {
    // 实现图片导出
    return new Blob()
  }

  private async exportAsSVG(options: any): Promise<string> {
    // 实现SVG导出
    return ''
  }

  private async exportAsJSON(options: any): Promise<string> {
    // 实现JSON导出
    return JSON.stringify(this.data)
  }

  private handleTouchStart(event: TouchEvent): void {
    // 触摸开始处理
  }

  private handleTouchMove(event: TouchEvent): void {
    // 触摸移动处理
  }

  private handleTouchEnd(event: TouchEvent): void {
    // 触摸结束处理
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // 键盘按下处理
  }

  private handleKeyUp(event: KeyboardEvent): void {
    // 键盘释放处理
  }

  private handleResize(): void {
    // 窗口大小调整处理
    this.viewport.width = this.container.clientWidth
    this.viewport.height = this.container.clientHeight
    
    if (this.canvas) {
      this.canvas.width = this.viewport.width
      this.canvas.height = this.viewport.height
    } else if (this.svg) {
      this.svg.setAttribute('width', String(this.viewport.width))
      this.svg.setAttribute('height', String(this.viewport.height))
    }
    
    this.render()
  }

  // 公共方法用于清理
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    
    this.listeners.clear()
    
    if (this.canvas) {
      this.canvas.remove()
    } else if (this.svg) {
      this.svg.remove()
    }
  }

  // 添加缺失的public方法
  zoomIn(options?: any): void {
    this.currentZoom = Math.min(this.currentZoom * 1.2, 5)
    this.render()
  }

  zoomOut(options?: any): void {
    this.currentZoom = Math.max(this.currentZoom / 1.2, 0.1)
    this.render()
  }

  resetView(options?: any): void {
    this.currentZoom = 1
    this.panX = 0
    this.panY = 0
    this.render()
  }

  getZoom(): number {
    return this.currentZoom || 1
  }

  pauseAnimation(): void {
    this.isAnimating = false
  }

  startAnimation(): void {
    this.isAnimating = true
    this.animationLoop()
  }

  search(query: string): any[] {
    return this.data.nodes.filter(node => 
      node.label?.toLowerCase().includes(query.toLowerCase())
    )
  }

  highlightNodes(nodeIds: string[]): void {
    this.data.nodes.forEach(node => {
      node.highlighted = nodeIds.includes(node.id)
    })
    this.render()
  }

  clearHighlight(): void {
    this.data.nodes.forEach(node => {
      node.highlighted = false
    })
    this.render()
  }

  async getStatistics(): Promise<any> {
    return {
      nodeCount: this.data.nodes.length,
      edgeCount: this.data.edges.length,
      clusterCount: 0,
      density: this.data.nodes.length > 1 ? 
        this.data.edges.length / (this.data.nodes.length * (this.data.nodes.length - 1)) : 0
    }
  }

  exportData(): any {
    return {
      nodes: this.data.nodes,
      edges: this.data.edges,
      config: this.config
    }
  }

  undo(): void {
    // 撤销功能
  }

  redo(): void {
    // 重做功能
  }

  // 添加缺失的私有属性
  private currentZoom = 1
  private panX = 0  
  private panY = 0
  private isAnimating = false
}

// 单例导出
let graphVisualizationEngine: GraphVisualizationEngine | null = null

export function createGraphVisualizationEngine(container: HTMLElement, config?: Partial<GraphVisualizationConfig>): GraphVisualizationEngine {
  graphVisualizationEngine = new GraphVisualizationEngine(container, config)
  return graphVisualizationEngine
}

export function getGraphVisualizationEngine(): GraphVisualizationEngine | null {
  return graphVisualizationEngine
}