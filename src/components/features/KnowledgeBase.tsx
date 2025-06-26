import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Plus, Search, Filter, Eye, Edit2, Trash2, 
  Star, Clock, Tag, User, Calendar, ExternalLink,
  Book, FileText, Headphones, Video, Globe, GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KnowledgeItem, KnowledgeInsight } from '@/types'
import { getKnowledgeService } from '@/lib/knowledgeService'

interface KnowledgeBaseProps {
  onItemSelect?: (item: KnowledgeItem) => void
  selectedItemId?: string
}

export function KnowledgeBase({ onItemSelect, selectedItemId }: KnowledgeBaseProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [insights, setInsights] = useState<KnowledgeInsight[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const knowledgeService = getKnowledgeService()

  useEffect(() => {
    loadKnowledgeItems()
    loadInsights()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchQuery, selectedType, selectedStatus])

  const loadKnowledgeItems = async () => {
    const loadedItems = knowledgeService.getKnowledgeItems()
    setItems(loadedItems)
  }

  const loadInsights = async () => {
    const generatedInsights = await knowledgeService.generateKnowledgeInsights()
    setInsights(generatedInsights)
  }

  const filterItems = () => {
    let filtered = items

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.author?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 类型过滤
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    // 状态过滤
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus)
    }

    setFilteredItems(filtered)
  }

  const handleAddItem = async (newItem: Omit<KnowledgeItem, 'id' | 'addedAt'>) => {
    try {
      await knowledgeService.addKnowledgeItem(newItem)
      await loadKnowledgeItems()
      setShowAddModal(false)
    } catch (error) {
      console.error('添加知识项失败:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('确定要删除这个知识项吗？')) {
      knowledgeService.deleteKnowledgeItem(id)
      await loadKnowledgeItems()
    }
  }

  const getTypeIcon = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'book': return <Book className="w-4 h-4" />
      case 'article': return <FileText className="w-4 h-4" />
      case 'paper': return <FileText className="w-4 h-4" />
      case 'course': return <GraduationCap className="w-4 h-4" />
      case 'podcast': return <Headphones className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'note': return <FileText className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: KnowledgeItem['status']) => {
    switch (status) {
      case 'reading': return 'text-blue-500 bg-blue-500/10'
      case 'completed': return 'text-green-500 bg-green-500/10'
      case 'paused': return 'text-yellow-500 bg-yellow-500/10'
      case 'planned': return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusText = (status: KnowledgeItem['status']) => {
    switch (status) {
      case 'reading': return '阅读中'
      case 'completed': return '已完成'
      case 'paused': return '暂停'
      case 'planned': return '计划中'
    }
  }

  return (
    <div className="space-y-6">
      {/* 头部控制栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">知识库</h2>
          <p className="text-muted-foreground">管理你的学习资源和知识资产</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加知识项
        </button>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索标题、作者、标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">所有类型</option>
          <option value="book">书籍</option>
          <option value="article">文章</option>
          <option value="paper">论文</option>
          <option value="course">课程</option>
          <option value="podcast">播客</option>
          <option value="video">视频</option>
          <option value="note">笔记</option>
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">所有状态</option>
          <option value="reading">阅读中</option>
          <option value="completed">已完成</option>
          <option value="paused">暂停</option>
          <option value="planned">计划中</option>
        </select>
      </div>

      {/* 知识洞察 */}
      {insights.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            知识洞察
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className="p-3 bg-accent/10 border border-accent/20 rounded-md"
              >
                <div className="text-sm font-medium mb-1">{insight.title}</div>
                <div className="text-xs text-muted-foreground">{insight.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-500">{items.length}</div>
          <div className="text-sm text-muted-foreground">总知识项</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">
            {items.filter(item => item.status === 'completed').length}
          </div>
          <div className="text-sm text-muted-foreground">已完成</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-500">
            {items.filter(item => item.status === 'reading').length}
          </div>
          <div className="text-sm text-muted-foreground">进行中</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-500">
            {[...new Set(items.flatMap(item => item.tags))].length}
          </div>
          <div className="text-sm text-muted-foreground">标签数</div>
        </div>
      </div>

      {/* 知识项列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            知识项 ({filteredItems.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'grid' ? "bg-primary text-white" : "hover:bg-muted"
              )}
            >
              网格
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === 'list' ? "bg-primary text-white" : "hover:bg-muted"
              )}
            >
              列表
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无知识项</h3>
            <p className="text-muted-foreground mb-4">开始添加你的第一个知识项吧</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              添加知识项
            </button>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          )}>
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "bg-card border border-border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                    selectedItemId === item.id && "ring-2 ring-primary",
                    viewMode === 'list' && "flex items-center gap-4"
                  )}
                  onClick={() => onItemSelect?.(item)}
                >
                  <div className={cn("flex items-start gap-3", viewMode === 'list' && "flex-1")}>
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full",
                          getStatusColor(item.status)
                        )}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        {item.author && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.author}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.addedAt.toLocaleDateString()}
                        </div>
                      </div>
                      
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-muted text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{item.tags.length - 3} 更多
                            </span>
                          )}
                        </div>
                      )}
                      
                      {item.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>进度</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: 编辑功能
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {item.source && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(item.source, '_blank')
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteItem(item.id)
                      }}
                      className="p-1 hover:bg-red-500/10 text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 添加知识项模态框 */}
      {showAddModal && (
        <AddKnowledgeModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  )
}

// 添加知识项模态框组件
interface AddKnowledgeModalProps {
  onClose: () => void
  onAdd: (item: Omit<KnowledgeItem, 'id' | 'addedAt'>) => void
}

function AddKnowledgeModal({ onClose, onAdd }: AddKnowledgeModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'book' as KnowledgeItem['type'],
    description: '',
    author: '',
    category: '',
    status: 'planned' as KnowledgeItem['status'],
    tags: '',
    source: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('请输入标题')
      return
    }

    const newItem = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }

    onAdd(newItem)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-medium mb-4">添加知识项</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="输入标题..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as KnowledgeItem['type'] }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="book">书籍</option>
              <option value="article">文章</option>
              <option value="paper">论文</option>
              <option value="course">课程</option>
              <option value="podcast">播客</option>
              <option value="video">视频</option>
              <option value="note">笔记</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="简要描述..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">作者</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="作者姓名..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">标签</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="标签1, 标签2, ..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as KnowledgeItem['status'] }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="planned">计划中</option>
              <option value="reading">阅读中</option>
              <option value="paused">暂停</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">来源链接</label>
            <input
              type="url"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              添加
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