import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Calendar, Tag, Hash, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Thought } from '@/types'

interface SearchBarProps {
  thoughts: Thought[]
  onSearchResults: (results: Thought[]) => void
  onClearSearch: () => void
}

interface SearchFilters {
  query: string
  category: string
  tags: string[]
  dateRange: 'all' | 'today' | 'week' | 'month'
  sentiment: 'all' | 'positive' | 'negative' | 'neutral'
}

export function SearchBar({ thoughts, onSearchResults, onClearSearch }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    tags: [],
    dateRange: 'all',
    sentiment: 'all'
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  // 提取可用的标签和分类
  useEffect(() => {
    const tags = new Set<string>()
    const categories = new Set<string>()
    
    thoughts.forEach(thought => {
      thought.tags?.forEach(tag => tags.add(tag))
      if (thought.category) categories.add(thought.category)
    })
    
    setAvailableTags(Array.from(tags))
    setAvailableCategories(Array.from(categories))
  }, [thoughts])

  // 实时搜索
  useEffect(() => {
    const results = performSearch()
    if (hasActiveFilters()) {
      onSearchResults(results)
    } else {
      onClearSearch()
    }
  }, [filters, thoughts])

  const hasActiveFilters = (): boolean => {
    return filters.query.trim() !== '' ||
           filters.category !== '' ||
           filters.tags.length > 0 ||
           filters.dateRange !== 'all' ||
           filters.sentiment !== 'all'
  }

  const performSearch = (): Thought[] => {
    let results = [...thoughts]

    // 文本搜索
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase()
      results = results.filter(thought => 
        thought.content.toLowerCase().includes(query) ||
        thought.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        thought.category?.toLowerCase().includes(query) ||
        thought.aiAnalysis?.insights?.some(insight => insight.toLowerCase().includes(query))
      )
    }

    // 分类过滤
    if (filters.category) {
      results = results.filter(thought => thought.category === filters.category)
    }

    // 标签过滤
    if (filters.tags.length > 0) {
      results = results.filter(thought => 
        filters.tags.every(tag => thought.tags?.includes(tag))
      )
    }

    // 时间过滤
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }
      
      results = results.filter(thought => thought.timestamp >= cutoffDate)
    }

    // 情感过滤
    if (filters.sentiment !== 'all') {
      results = results.filter(thought => 
        thought.aiAnalysis?.sentiment === filters.sentiment
      )
    }

    return results
  }

  const clearAllFilters = () => {
    setFilters({
      query: '',
      category: '',
      tags: [],
      dateRange: 'all',
      sentiment: 'all'
    })
    setIsExpanded(false)
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const getResultsText = (): string => {
    const resultsCount = performSearch().length
    if (!hasActiveFilters()) return ''
    return `找到 ${resultsCount} 条想法`
  }

  return (
    <div className="space-y-4">
      {/* 主搜索栏 */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              placeholder="搜索想法内容、标签或洞察..."
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isExpanded ? "bg-primary text-white" : "bg-secondary hover:bg-secondary-hover text-foreground"
            )}
            title="高级筛选"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              title="清除筛选"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 搜索结果提示 */}
        {getResultsText() && (
          <div className="mt-2 text-xs text-muted-foreground">
            {getResultsText()}
          </div>
        )}
      </div>

      {/* 高级筛选面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-card border border-border rounded-lg space-y-4">
              <h3 className="text-sm font-medium mb-3">高级筛选</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 分类筛选 */}
                <div>
                  <label className="block text-xs font-medium mb-2">
                    <Hash className="w-3 h-3 inline mr-1" />
                    分类
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">全部分类</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* 时间范围 */}
                <div>
                  <label className="block text-xs font-medium mb-2">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    时间范围
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">全部时间</option>
                    <option value="today">今天</option>
                    <option value="week">最近一周</option>
                    <option value="month">最近一月</option>
                  </select>
                </div>

                {/* 情感倾向 */}
                <div>
                  <label className="block text-xs font-medium mb-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    情感倾向
                  </label>
                  <select
                    value={filters.sentiment}
                    onChange={(e) => setFilters(prev => ({ ...prev, sentiment: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">全部情感</option>
                    <option value="positive">积极 😊</option>
                    <option value="neutral">中性 😐</option>
                    <option value="negative">消极 😔</option>
                  </select>
                </div>
              </div>

              {/* 标签筛选 */}
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-xs font-medium mb-2">
                    <Tag className="w-3 h-3 inline mr-1" />
                    标签筛选
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium transition-colors",
                          filters.tags.includes(tag)
                            ? "bg-primary text-white"
                            : "bg-secondary hover:bg-secondary-hover text-foreground"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 活跃筛选器显示 */}
              {hasActiveFilters() && (
                <div className="pt-3 border-t border-border">
                  <div className="text-xs font-medium mb-2">活跃筛选器:</div>
                  <div className="flex flex-wrap gap-2">
                    {filters.query && (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                        搜索: "{filters.query}"
                      </span>
                    )}
                    {filters.category && (
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
                        分类: {filters.category}
                      </span>
                    )}
                    {filters.dateRange !== 'all' && (
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs">
                        时间: {filters.dateRange === 'today' ? '今天' : 
                               filters.dateRange === 'week' ? '最近一周' : '最近一月'}
                      </span>
                    )}
                    {filters.sentiment !== 'all' && (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">
                        情感: {filters.sentiment === 'positive' ? '积极' : 
                               filters.sentiment === 'negative' ? '消极' : '中性'}
                      </span>
                    )}
                    {filters.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                        标签: {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}