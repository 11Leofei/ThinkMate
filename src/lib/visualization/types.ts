// 知识图谱可视化类型定义
import { Thought } from '../../types'
import { KnowledgeItem } from '../../types/knowledge'
import { EnhancedConnection } from '../linking/types'

// 图谱渲染引擎类型
export enum RenderEngine {
  SVG = 'svg',
  CANVAS = 'canvas',
  WEBGL = 'webgl'
}

// 布局算法类型
export enum LayoutAlgorithm {
  FORCE_DIRECTED = 'force_directed',    // 力导向布局
  HIERARCHICAL = 'hierarchical',        // 层次布局
  CIRCULAR = 'circular',                // 圆形布局
  GRID = 'grid',                        // 网格布局
  RADIAL = 'radial',                    // 径向布局
  ORGANIC = 'organic',                  // 有机布局
  TIMELINE = 'timeline'                 // 时间线布局
}

// 可视化模式
export enum VisualizationMode {
  OVERVIEW = 'overview',                // 全景模式
  FOCUS = 'focus',                      // 聚焦模式
  CLUSTER = 'cluster',                  // 集群模式
  PATH = 'path',                        // 路径模式
  COMPARISON = 'comparison',            // 对比模式
  TEMPORAL = 'temporal'                 // 时间模式
}

// 节点可视化属性
export interface NodeVisualization {
  id: string
  type: 'thought' | 'knowledge' | 'concept' | 'cluster'
  
  // 基础属性
  label: string
  description?: string
  content?: string
  
  // 位置和尺寸
  position: { x: number, y: number, z?: number }
  size: number
  radius?: number
  
  // 外观样式
  color: string
  borderColor?: string
  backgroundColor?: string
  opacity: number
  
  // 形状和样式
  shape: 'circle' | 'rectangle' | 'ellipse' | 'diamond' | 'star' | 'custom'
  borderWidth: number
  borderStyle: 'solid' | 'dashed' | 'dotted'
  
  // 文本样式
  fontSize: number
  fontColor: string
  fontWeight: 'normal' | 'bold'
  textAlign: 'center' | 'left' | 'right'
  
  // 交互状态
  isSelected: boolean
  isHighlighted: boolean
  isHovered: boolean
  isDragging: boolean
  
  // 动画属性
  animation?: {
    type: 'pulse' | 'glow' | 'rotate' | 'bounce'
    duration: number
    loop: boolean
  }
  
  // 数据属性
  metadata: {
    thoughtId?: string
    knowledgeId?: string
    clusterId?: string
    importance: number
    centrality: number
    connections: number
    createdAt: Date
    lastModified?: Date
  }
  
  // 可视化层级
  layer: number
  zIndex: number
  
  // 标签位置
  labelPosition: 'center' | 'top' | 'bottom' | 'left' | 'right'
  labelOffset: { x: number, y: number }
}

// 边可视化属性
export interface EdgeVisualization {
  id: string
  source: string
  target: string
  connectionId: string
  
  // 基础属性
  label?: string
  type: string
  
  // 路径样式
  width: number
  color: string
  opacity: number
  style: 'solid' | 'dashed' | 'dotted'
  
  // 路径形状
  curvature: number
  pathType: 'straight' | 'curved' | 'bezier' | 'arc'
  
  // 箭头
  arrow: {
    enabled: boolean
    type: 'triangle' | 'circle' | 'diamond'
    size: number
    position: 'target' | 'source' | 'both'
  }
  
  // 交互状态
  isSelected: boolean
  isHighlighted: boolean
  isHovered: boolean
  
  // 动画属性
  animation?: {
    type: 'flow' | 'pulse' | 'dash'
    speed: number
    direction: 'forward' | 'backward' | 'both'
  }
  
  // 数据属性
  metadata: {
    strength: number
    confidence: number
    createdAt: Date
    verificationCount: number
    userFeedback?: 'positive' | 'negative' | 'neutral'
  }
  
  // 可视化层级
  layer: number
  zIndex: number
  
  // 标签位置
  labelPosition: 'center' | 'source' | 'target'
  labelBackground: boolean
}

// 图谱配置
export interface GraphVisualizationConfig {
  // 渲染设置
  renderEngine: RenderEngine
  width: number
  height: number
  backgroundColor: string
  
  // 布局设置
  layoutAlgorithm: LayoutAlgorithm
  layoutConfig: {
    // 力导向布局参数
    forceStrength: number
    centeringStrength: number
    linkDistance: number
    repulsionStrength: number
    damping: number
    
    // 层次布局参数
    levelSeparation: number
    nodeSeparation: number
    treeOrientation: 'top-down' | 'bottom-up' | 'left-right' | 'right-left'
    
    // 圆形布局参数
    radius: number
    startAngle: number
    endAngle: number
    
    // 通用参数
    iterations: number
    convergenceThreshold: number
    animationDuration: number
  }
  
  // 可视化模式
  mode: VisualizationMode
  
  // 节点设置
  nodes: {
    defaultSize: number
    minSize: number
    maxSize: number
    sizeBy: 'connections' | 'importance' | 'centrality' | 'fixed'
    
    colorScheme: 'default' | 'type' | 'cluster' | 'importance' | 'temporal'
    colorPalette: string[]
    
    showLabels: boolean
    labelThreshold: number
    
    clustering: {
      enabled: boolean
      algorithm: 'modularity' | 'leiden' | 'louvain'
      resolution: number
      minClusterSize: number
    }
  }
  
  // 边设置
  edges: {
    defaultWidth: number
    minWidth: number
    maxWidth: number
    widthBy: 'strength' | 'confidence' | 'fixed'
    
    colorBy: 'type' | 'strength' | 'source' | 'target' | 'fixed'
    showArrows: boolean
    
    curvature: number
    bundling: {
      enabled: boolean
      strength: number
    }
    
    filtering: {
      minStrength: number
      maxConnections: number
      hideWeakConnections: boolean
    }
  }
  
  // 交互设置
  interaction: {
    enableZoom: boolean
    enablePan: boolean
    enableDrag: boolean
    enableSelection: boolean
    enableHover: boolean
    
    zoomRange: { min: number, max: number }
    panBounds?: { x: [number, number], y: [number, number] }
    
    multiSelect: boolean
    selectOnClick: boolean
    dragToSelect: boolean
    
    tooltips: {
      enabled: boolean
      delay: number
      followMouse: boolean
    }
  }
  
  // 动画设置
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
    
    layoutTransition: boolean
    nodeTransition: boolean
    edgeTransition: boolean
    
    autoPlay: boolean
    playbackSpeed: number
  }
  
  // 性能设置
  performance: {
    levelOfDetail: boolean
    lodThreshold: number
    
    virtualization: boolean
    virtualizationThreshold: number
    
    webWorkers: boolean
    batchSize: number
    
    frameRate: number
    adaptiveQuality: boolean
  }
}

// 图谱数据
export interface GraphData {
  nodes: NodeVisualization[]
  edges: EdgeVisualization[]
  metadata: {
    totalNodes: number
    totalEdges: number
    density: number
    averageDegree: number
    clusters: ClusterInfo[]
    boundingBox: BoundingBox
    createdAt: Date
    lastUpdated: Date
  }
}

// 集群信息
export interface ClusterInfo {
  id: string
  name: string
  color: string
  nodes: string[]
  centroid: { x: number, y: number }
  boundingBox: BoundingBox
  cohesion: number
  separation: number
}

// 边界框
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// 视口信息
export interface Viewport {
  x: number
  y: number
  width: number
  height: number
  zoom: number
  rotation: number
}

// 选择状态
export interface SelectionState {
  selectedNodes: string[]
  selectedEdges: string[]
  hoveredNode?: string
  hoveredEdge?: string
  focusNode?: string
  selectionBox?: BoundingBox
}

// 交互事件
export interface GraphInteractionEvent {
  type: 'click' | 'doubleclick' | 'hover' | 'drag' | 'zoom' | 'pan' | 'select'
  target: {
    type: 'node' | 'edge' | 'background'
    id?: string
    data?: any
  }
  position: { x: number, y: number }
  modifiers: {
    shift: boolean
    ctrl: boolean
    alt: boolean
    meta: boolean
  }
  originalEvent: Event
}

// 过滤器
export interface GraphFilter {
  id: string
  name: string
  type: 'node' | 'edge' | 'global'
  enabled: boolean
  
  conditions: FilterCondition[]
  operator: 'and' | 'or'
  
  visualization: {
    hideFiltered: boolean
    dimFiltered: boolean
    highlightMatched: boolean
  }
}

// 过滤条件
export interface FilterCondition {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between'
  value: any
  caseSensitive?: boolean
}

// 搜索结果
export interface SearchResult {
  query: string
  matches: {
    nodes: {
      id: string
      score: number
      highlights: string[]
    }[]
    edges: {
      id: string
      score: number
      highlights: string[]
    }[]
  }
  facets: {
    [field: string]: {
      value: any
      count: number
    }[]
  }
}

// 导出选项
export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'json' | 'graphml' | 'gexf'
  quality: number
  width?: number
  height?: number
  backgroundColor?: string
  includeMetadata: boolean
  compression?: boolean
}

// 图谱统计
export interface GraphStatistics {
  overview: {
    nodeCount: number
    edgeCount: number
    density: number
    diameter: number
    averagePathLength: number
    clusteringCoefficient: number
  }
  
  nodes: {
    centralityDistribution: { [nodeId: string]: number }
    degreeDistribution: { degree: number, count: number }[]
    sizeDistribution: { size: number, count: number }[]
    typeDistribution: { type: string, count: number }[]
  }
  
  edges: {
    strengthDistribution: { strength: number, count: number }[]
    typeDistribution: { type: string, count: number }[]
    lengthDistribution: { length: number, count: number }[]
  }
  
  clusters: {
    count: number
    sizes: number[]
    modularity: number
    silhouette: number
  }
  
  temporal: {
    nodeCreationTrend: { date: string, count: number }[]
    edgeCreationTrend: { date: string, count: number }[]
    activityPeaks: { date: string, activity: number }[]
  }
}

// 布局计算结果
export interface LayoutResult {
  nodes: { id: string, x: number, y: number, z?: number }[]
  bounds: BoundingBox
  iterations: number
  energy: number
  converged: boolean
  computationTime: number
}

// 动画帧
export interface AnimationFrame {
  timestamp: number
  nodes: { id: string, x: number, y: number, opacity?: number }[]
  edges: { id: string, opacity?: number, width?: number }[]
  viewport: Partial<Viewport>
}

// 工具提示内容
export interface TooltipContent {
  title: string
  content: Array<{
    label: string
    value: string | number
    format?: 'text' | 'number' | 'percentage' | 'date'
  }>
  actions?: Array<{
    label: string
    action: string
    icon?: string
  }>
}

// 图谱主题
export interface GraphTheme {
  name: string
  colors: {
    background: string
    nodes: {
      default: string
      selected: string
      highlighted: string
      hover: string
    }
    edges: {
      default: string
      selected: string
      highlighted: string
      hover: string
    }
    text: {
      primary: string
      secondary: string
      muted: string
    }
    ui: {
      panel: string
      border: string
      shadow: string
    }
  }
  typography: {
    fontFamily: string
    fontSizes: {
      small: number
      medium: number
      large: number
    }
  }
}

// 快照状态
export interface GraphSnapshot {
  id: string
  name: string
  description?: string
  timestamp: Date
  
  data: GraphData
  config: GraphVisualizationConfig
  viewport: Viewport
  selection: SelectionState
  filters: GraphFilter[]
  
  thumbnail?: string
  metadata: {
    nodeCount: number
    edgeCount: number
    createdBy: string
    tags: string[]
  }
}