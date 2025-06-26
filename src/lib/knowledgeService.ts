import { 
  KnowledgeItem, 
  KnowledgeConnection, 
  ThoughtKnowledgeLink, 
  KnowledgeGraph,
  KnowledgeInsight,
  KnowledgeCluster,
  EnhancedThought
} from '@/types'

export class KnowledgeService {
  private storageKey = 'thinkmate-knowledge-base'
  private connectionsKey = 'thinkmate-knowledge-connections'
  private linksKey = 'thinkmate-thought-knowledge-links'

  // 知识库管理
  async addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'addedAt'>): Promise<KnowledgeItem> {
    const knowledgeItem: KnowledgeItem = {
      ...item,
      id: this.generateId(),
      addedAt: new Date()
    }

    // 如果有内容，使用AI生成摘要
    if (item.content && item.content.length > 100) {
      knowledgeItem.aiSummary = await this.generateAISummary(item.content, item.title)
    }

    this.saveKnowledgeItem(knowledgeItem)
    return knowledgeItem
  }

  getKnowledgeItems(): KnowledgeItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored).map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
        lastAccessedAt: item.lastAccessedAt ? new Date(item.lastAccessedAt) : undefined,
        publishDate: item.publishDate ? new Date(item.publishDate) : undefined
      })) : []
    } catch (error) {
      console.error('读取知识库失败:', error)
      return []
    }
  }

  updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): void {
    const items = this.getKnowledgeItems()
    const index = items.findIndex(item => item.id === id)
    
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, lastAccessedAt: new Date() }
      this.saveKnowledgeItems(items)
    }
  }

  deleteKnowledgeItem(id: string): void {
    const items = this.getKnowledgeItems().filter(item => item.id !== id)
    this.saveKnowledgeItems(items)
    
    // 删除相关连接
    this.deleteConnectionsByKnowledgeId(id)
    this.deleteLinksByKnowledgeId(id)
  }

  // 知识库连接管理
  addKnowledgeConnection(connection: Omit<KnowledgeConnection, 'id' | 'createdAt'>): KnowledgeConnection {
    const newConnection: KnowledgeConnection = {
      ...connection,
      id: this.generateId(),
      createdAt: new Date()
    }

    const connections = this.getKnowledgeConnections()
    connections.push(newConnection)
    this.saveKnowledgeConnections(connections)
    
    return newConnection
  }

  getKnowledgeConnections(): KnowledgeConnection[] {
    try {
      const stored = localStorage.getItem(this.connectionsKey)
      return stored ? JSON.parse(stored).map((conn: any) => ({
        ...conn,
        createdAt: new Date(conn.createdAt)
      })) : []
    } catch (error) {
      console.error('读取知识连接失败:', error)
      return []
    }
  }

  // 思想-知识库链接管理
  async linkThoughtToKnowledge(
    thoughtId: string, 
    knowledgeId: string, 
    type: ThoughtKnowledgeLink['type'],
    description?: string
  ): Promise<ThoughtKnowledgeLink> {
    // 计算相关性分数
    const relevanceScore = await this.calculateRelevanceScore(thoughtId, knowledgeId)
    
    const link: ThoughtKnowledgeLink = {
      id: this.generateId(),
      thoughtId,
      knowledgeId,
      type,
      relevanceScore,
      description,
      createdAt: new Date(),
      aiGenerated: false
    }

    const links = this.getThoughtKnowledgeLinks()
    links.push(link)
    this.saveThoughtKnowledgeLinks(links)
    
    return link
  }

  getThoughtKnowledgeLinks(): ThoughtKnowledgeLink[] {
    try {
      const stored = localStorage.getItem(this.linksKey)
      return stored ? JSON.parse(stored).map((link: any) => ({
        ...link,
        createdAt: new Date(link.createdAt)
      })) : []
    } catch (error) {
      console.error('读取思想-知识链接失败:', error)
      return []
    }
  }

  // AI自动关联
  async autoLinkThoughts(thoughts: EnhancedThought[]): Promise<ThoughtKnowledgeLink[]> {
    const knowledgeItems = this.getKnowledgeItems()
    const newLinks: ThoughtKnowledgeLink[] = []

    for (const thought of thoughts) {
      for (const knowledge of knowledgeItems) {
        const relevanceScore = await this.calculateRelevanceScore(thought.id, knowledge.id)
        
        if (relevanceScore > 0.7) { // 高相关性阈值
          const link: ThoughtKnowledgeLink = {
            id: this.generateId(),
            thoughtId: thought.id,
            knowledgeId: knowledge.id,
            type: this.determineConnectionType(thought, knowledge),
            relevanceScore,
            description: `AI检测到高相关性 (${Math.round(relevanceScore * 100)}%)`,
            createdAt: new Date(),
            aiGenerated: true
          }
          
          newLinks.push(link)
        }
      }
    }

    // 保存新链接
    const existingLinks = this.getThoughtKnowledgeLinks()
    const allLinks = [...existingLinks, ...newLinks]
    this.saveThoughtKnowledgeLinks(allLinks)

    return newLinks
  }

  // 知识图谱生成
  generateKnowledgeGraph(thoughts?: EnhancedThought[]): KnowledgeGraph {
    const knowledgeItems = this.getKnowledgeItems()
    const connections = this.getKnowledgeConnections()
    const links = this.getThoughtKnowledgeLinks()
    
    const nodes = [
      ...knowledgeItems,
      ...(thoughts || [])
    ]

    const edges = [
      ...connections,
      ...links
    ]

    // 生成知识集群
    const clusters = this.generateKnowledgeClusters(nodes, edges)

    return {
      nodes,
      edges,
      clusters
    }
  }

  // 知识洞察生成
  async generateKnowledgeInsights(): Promise<KnowledgeInsight[]> {
    const knowledgeItems = this.getKnowledgeItems()
    const connections = this.getKnowledgeConnections()
    const insights: KnowledgeInsight[] = []

    // 检测知识缺口
    const gaps = this.detectKnowledgeGaps(knowledgeItems, connections)
    insights.push(...gaps)

    // 检测趋势
    const trends = this.detectKnowledgeTrends(knowledgeItems)
    insights.push(...trends)

    // 检测模式
    const patterns = this.detectKnowledgePatterns(knowledgeItems, connections)
    insights.push(...patterns)

    return insights
  }

  // 搜索和过滤
  searchKnowledge(query: string, filters?: {
    type?: KnowledgeItem['type'][]
    status?: KnowledgeItem['status'][]
    tags?: string[]
  }): KnowledgeItem[] {
    let items = this.getKnowledgeItems()

    // 文本搜索
    if (query.trim()) {
      const queryLower = query.toLowerCase()
      items = items.filter(item => 
        item.title.toLowerCase().includes(queryLower) ||
        item.description?.toLowerCase().includes(queryLower) ||
        item.content?.toLowerCase().includes(queryLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(queryLower))
      )
    }

    // 类型过滤
    if (filters?.type?.length) {
      items = items.filter(item => filters.type!.includes(item.type))
    }

    // 状态过滤
    if (filters?.status?.length) {
      items = items.filter(item => filters.status!.includes(item.status))
    }

    // 标签过滤
    if (filters?.tags?.length) {
      items = items.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      )
    }

    return items
  }

  // 私有方法
  private async generateAISummary(content: string, title: string): Promise<any> {
    // 这里应该调用AI服务生成摘要
    // 现在返回模拟数据
    return {
      keyPoints: [
        '关键点1：主要观点概述',
        '关键点2：核心论据分析',
        '关键点3：重要结论总结'
      ],
      mainTopics: ['主题1', '主题2', '主题3'],
      insights: ['洞察1：深层含义', '洞察2：延伸思考'],
      quotes: ['重要引用1', '重要引用2'],
      connections: [],
      generatedAt: new Date()
    }
  }

  private async calculateRelevanceScore(thoughtId: string, knowledgeId: string): Promise<number> {
    // 这里应该使用AI计算相关性分数
    // 可以基于内容相似度、主题匹配、语义分析等
    return Math.random() * 0.3 + 0.4 // 模拟0.4-0.7的相关性分数
  }

  private determineConnectionType(thought: EnhancedThought, knowledge: KnowledgeItem): ThoughtKnowledgeLink['type'] {
    // 基于内容分析确定连接类型
    const thoughtContent = thought.content.toLowerCase()
    
    if (thoughtContent.includes('问') || thoughtContent.includes('？')) {
      return 'questions'
    } else if (thoughtContent.includes('反对') || thoughtContent.includes('但是')) {
      return 'contradicts'
    } else if (thoughtContent.includes('应用') || thoughtContent.includes('实践')) {
      return 'applies'
    } else if (thoughtContent.includes('扩展') || thoughtContent.includes('进一步')) {
      return 'extends'
    } else {
      return 'inspired_by'
    }
  }

  private generateKnowledgeClusters(nodes: any[], edges: any[]): KnowledgeCluster[] {
    // 简单的聚类算法，基于连接关系
    const clusters: KnowledgeCluster[] = []
    const visited = new Set()
    
    for (const node of nodes) {
      if (visited.has(node.id)) continue
      
      const cluster = this.findConnectedNodes(node.id, nodes, edges, visited)
      if (cluster.length > 1) {
        clusters.push({
          id: this.generateId(),
          name: `知识集群 ${clusters.length + 1}`,
          description: '相关知识和想法的集合',
          items: cluster,
          color: this.getClusterColor(clusters.length),
          centerPoint: { x: Math.random() * 800, y: Math.random() * 600 }
        })
      }
    }
    
    return clusters
  }

  private findConnectedNodes(nodeId: string, nodes: any[], edges: any[], visited: Set<string>): string[] {
    if (visited.has(nodeId)) return []
    
    visited.add(nodeId)
    const connected = [nodeId]
    
    // 找到所有相连的节点
    for (const edge of edges) {
      if (edge.fromKnowledgeId === nodeId || edge.thoughtId === nodeId) {
        const targetId = edge.toKnowledgeId || edge.knowledgeId
        if (targetId && !visited.has(targetId)) {
          connected.push(...this.findConnectedNodes(targetId, nodes, edges, visited))
        }
      }
    }
    
    return connected
  }

  private getClusterColor(index: number): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    return colors[index % colors.length]
  }

  private detectKnowledgeGaps(items: KnowledgeItem[], connections: KnowledgeConnection[]): KnowledgeInsight[] {
    // 检测知识缺口
    const insights: KnowledgeInsight[] = []
    
    // 找到孤立的知识项
    const connectedItems = new Set([
      ...connections.map(c => c.fromKnowledgeId),
      ...connections.map(c => c.toKnowledgeId)
    ])
    
    const isolatedItems = items.filter(item => !connectedItems.has(item.id))
    
    if (isolatedItems.length > 0) {
      insights.push({
        id: this.generateId(),
        type: 'gap',
        title: '发现孤立知识点',
        description: `有${isolatedItems.length}个知识点缺乏与其他内容的关联`,
        involvedItems: isolatedItems.map(item => item.id),
        confidence: 0.8,
        generatedAt: new Date()
      })
    }
    
    return insights
  }

  private detectKnowledgeTrends(items: KnowledgeItem[]): KnowledgeInsight[] {
    // 检测知识趋势
    const insights: KnowledgeInsight[] = []
    
    // 分析最近添加的知识类型
    const recentItems = items
      .filter(item => Date.now() - item.addedAt.getTime() < 30 * 24 * 60 * 60 * 1000) // 最近30天
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
    
    if (recentItems.length > 3) {
      const typeCount = recentItems.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const dominantType = Object.entries(typeCount)
        .sort(([,a], [,b]) => b - a)[0]
      
      if (dominantType[1] > 2) {
        insights.push({
          id: this.generateId(),
          type: 'trend',
          title: '知识获取趋势',
          description: `最近您主要在学习${dominantType[0]}类型的内容`,
          involvedItems: recentItems.filter(item => item.type === dominantType[0]).map(item => item.id),
          confidence: 0.9,
          generatedAt: new Date()
        })
      }
    }
    
    return insights
  }

  private detectKnowledgePatterns(items: KnowledgeItem[], connections: KnowledgeConnection[]): KnowledgeInsight[] {
    // 检测知识模式
    const insights: KnowledgeInsight[] = []
    
    // 检测强连接的知识群组
    const connectionCounts = connections.reduce((acc, conn) => {
      const key = [conn.fromKnowledgeId, conn.toKnowledgeId].sort().join('-')
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const strongConnections = Object.entries(connectionCounts)
      .filter(([,count]) => count > 2)
      .map(([key]) => key.split('-'))
    
    if (strongConnections.length > 0) {
      insights.push({
        id: this.generateId(),
        type: 'pattern',
        title: '发现知识关联模式',
        description: '某些知识点之间存在强关联关系',
        involvedItems: strongConnections.flat(),
        confidence: 0.85,
        generatedAt: new Date()
      })
    }
    
    return insights
  }

  // 存储方法
  private saveKnowledgeItem(item: KnowledgeItem): void {
    const items = this.getKnowledgeItems()
    items.push(item)
    this.saveKnowledgeItems(items)
  }

  private saveKnowledgeItems(items: KnowledgeItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items))
    } catch (error) {
      console.error('保存知识库失败:', error)
    }
  }

  private saveKnowledgeConnections(connections: KnowledgeConnection[]): void {
    try {
      localStorage.setItem(this.connectionsKey, JSON.stringify(connections))
    } catch (error) {
      console.error('保存知识连接失败:', error)
    }
  }

  private saveThoughtKnowledgeLinks(links: ThoughtKnowledgeLink[]): void {
    try {
      localStorage.setItem(this.linksKey, JSON.stringify(links))
    } catch (error) {
      console.error('保存思想-知识链接失败:', error)
    }
  }

  private deleteConnectionsByKnowledgeId(knowledgeId: string): void {
    const connections = this.getKnowledgeConnections()
      .filter(conn => conn.fromKnowledgeId !== knowledgeId && conn.toKnowledgeId !== knowledgeId)
    this.saveKnowledgeConnections(connections)
  }

  private deleteLinksByKnowledgeId(knowledgeId: string): void {
    const links = this.getThoughtKnowledgeLinks()
      .filter(link => link.knowledgeId !== knowledgeId)
    this.saveThoughtKnowledgeLinks(links)
  }

  private generateId(): string {
    return `knowledge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// 单例服务
let knowledgeServiceInstance: KnowledgeService | null = null

export function getKnowledgeService(): KnowledgeService {
  if (!knowledgeServiceInstance) {
    knowledgeServiceInstance = new KnowledgeService()
  }
  return knowledgeServiceInstance
}

export function createKnowledgeService(): KnowledgeService {
  knowledgeServiceInstance = new KnowledgeService()
  return knowledgeServiceInstance
}