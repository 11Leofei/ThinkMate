import { useMemo, useCallback } from 'react'
import { Thought } from '@/types'

interface SearchFilters {
  query: string
  category: string
  tags: string[]
  dateRange: 'all' | 'today' | 'week' | 'month'
  sentiment: 'all' | 'positive' | 'negative' | 'neutral'
}

// 创建搜索索引以提高性能
interface SearchIndex {
  contentWords: Map<string, Set<string>> // 单词 -> 想法ID集合
  tags: Map<string, Set<string>>
  categories: Map<string, Set<string>>
  sentiments: Map<string, Set<string>>
}

export function useOptimizedSearch(thoughts: Thought[]) {
  // 构建搜索索引
  const searchIndex = useMemo<SearchIndex>(() => {
    const index: SearchIndex = {
      contentWords: new Map(),
      tags: new Map(),
      categories: new Map(),
      sentiments: new Map()
    }

    thoughts.forEach(thought => {
      const thoughtId = thought.id

      // 索引内容单词
      const words = thought.content
        .toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1)

      words.forEach(word => {
        if (!index.contentWords.has(word)) {
          index.contentWords.set(word, new Set())
        }
        index.contentWords.get(word)!.add(thoughtId)
      })

      // 索引标签
      thought.tags?.forEach(tag => {
        const normalizedTag = tag.toLowerCase()
        if (!index.tags.has(normalizedTag)) {
          index.tags.set(normalizedTag, new Set())
        }
        index.tags.get(normalizedTag)!.add(thoughtId)
      })

      // 索引分类
      if (thought.category) {
        const normalizedCategory = thought.category.toLowerCase()
        if (!index.categories.has(normalizedCategory)) {
          index.categories.set(normalizedCategory, new Set())
        }
        index.categories.get(normalizedCategory)!.add(thoughtId)
      }

      // 索引情感
      if (thought.aiAnalysis?.sentiment) {
        const sentiment = thought.aiAnalysis.sentiment
        if (!index.sentiments.has(sentiment)) {
          index.sentiments.set(sentiment, new Set())
        }
        index.sentiments.get(sentiment)!.add(thoughtId)
      }
    })

    return index
  }, [thoughts])

  // 创建想法映射以快速查找
  const thoughtsMap = useMemo(() => {
    return new Map(thoughts.map(thought => [thought.id, thought]))
  }, [thoughts])

  // 优化的搜索函数
  const performSearch = useCallback((filters: SearchFilters): Thought[] => {
    let candidateIds: Set<string> | null = null

    // 文本搜索 - 使用索引快速查找
    if (filters.query.trim()) {
      const queryWords = filters.query
        .toLowerCase()
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1)

      if (queryWords.length > 0) {
        // 查找包含所有查询词的想法
        const wordMatches = queryWords.map(word => {
          const matchingIds = new Set<string>()
          
          // 精确匹配
          if (searchIndex.contentWords.has(word)) {
            searchIndex.contentWords.get(word)!.forEach(id => matchingIds.add(id))
          }
          
          // 模糊匹配（前缀）
          searchIndex.contentWords.forEach((ids, indexedWord) => {
            if (indexedWord.includes(word)) {
              ids.forEach(id => matchingIds.add(id))
            }
          })
          
          // 标签匹配
          searchIndex.tags.forEach((ids, tag) => {
            if (tag.includes(word)) {
              ids.forEach(id => matchingIds.add(id))
            }
          })
          
          return matchingIds
        })

        // 取交集 - 必须包含所有查询词
        candidateIds = wordMatches.reduce((intersection, current) => {
          if (intersection === null) return new Set(current)
          return new Set([...intersection].filter(id => current.has(id)))
        }, null as Set<string> | null) || new Set()
      }
    }

    // 如果没有文本查询，从所有想法开始
    if (candidateIds === null) {
      candidateIds = new Set(thoughts.map(t => t.id))
    }

    // 应用其他过滤器
    const results: Thought[] = []
    
    candidateIds.forEach(thoughtId => {
      const thought = thoughtsMap.get(thoughtId)
      if (!thought) return

      // 分类过滤
      if (filters.category && thought.category !== filters.category) {
        return
      }

      // 标签过滤
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => 
          thought.tags?.some(thoughtTag => 
            thoughtTag.toLowerCase() === tag.toLowerCase()
          )
        )
        if (!hasAllTags) return
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
        
        if (thought.timestamp < cutoffDate) return
      }

      // 情感过滤
      if (filters.sentiment !== 'all') {
        if (thought.aiAnalysis?.sentiment !== filters.sentiment) {
          return
        }
      }

      results.push(thought)
    })

    // 按时间倒序排列
    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [searchIndex, thoughtsMap, thoughts])

  // 获取搜索建议
  const getSearchSuggestions = useCallback((query: string): string[] => {
    if (!query.trim()) return []
    
    const queryLower = query.toLowerCase()
    const suggestions = new Set<string>()
    
    // 从内容词汇中找建议
    searchIndex.contentWords.forEach((_, word) => {
      if (word.includes(queryLower) && word !== queryLower) {
        suggestions.add(word)
      }
    })
    
    // 从标签中找建议
    searchIndex.tags.forEach((_, tag) => {
      if (tag.includes(queryLower) && tag !== queryLower) {
        suggestions.add(tag)
      }
    })
    
    return Array.from(suggestions).slice(0, 5)
  }, [searchIndex])

  // 获取统计信息
  const getSearchStats = useCallback(() => {
    return {
      totalThoughts: thoughts.length,
      indexedWords: searchIndex.contentWords.size,
      uniqueTags: searchIndex.tags.size,
      categories: searchIndex.categories.size
    }
  }, [thoughts.length, searchIndex])

  return {
    performSearch,
    getSearchSuggestions,
    getSearchStats
  }
}