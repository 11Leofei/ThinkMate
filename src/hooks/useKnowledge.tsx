// 知识库管理 Hook
import { useState, useEffect, useCallback } from 'react'
import { KnowledgeItem } from '../types/knowledge'

interface UseKnowledgeReturn {
  items: KnowledgeItem[]
  loading: boolean
  error: string | null
  addItem: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'lastModified'>) => Promise<KnowledgeItem>
  updateItem: (id: string, updates: Partial<KnowledgeItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  getItem: (id: string) => KnowledgeItem | undefined
  searchItems: (query: string) => KnowledgeItem[]
  filterByType: (type: KnowledgeItem['type']) => KnowledgeItem[]
  filterByStatus: (status: KnowledgeItem['status']) => KnowledgeItem[]
}

export function useKnowledge(): UseKnowledgeReturn {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 从本地存储加载知识库项目
  useEffect(() => {
    const loadItems = () => {
      try {
        const stored = localStorage.getItem('thinkmate:knowledge')
        if (stored) {
          const parsed = JSON.parse(stored)
          setItems(parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            lastModified: new Date(item.lastModified)
          })))
        }
        setLoading(false)
      } catch (err) {
        console.error('加载知识库失败:', err)
        setError('加载知识库失败')
        setLoading(false)
      }
    }

    loadItems()
  }, [])

  // 保存到本地存储
  const saveItems = useCallback((newItems: KnowledgeItem[]) => {
    try {
      localStorage.setItem('thinkmate:knowledge', JSON.stringify(newItems))
    } catch (err) {
      console.error('保存知识库失败:', err)
      setError('保存知识库失败')
    }
  }, [])

  // 添加知识库项目
  const addItem = useCallback(async (itemData: Omit<KnowledgeItem, 'id' | 'createdAt' | 'lastModified'>): Promise<KnowledgeItem> => {
    const newItem: KnowledgeItem = {
      ...itemData,
      id: `knowledge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      lastModified: new Date()
    }

    const newItems = [...items, newItem]
    setItems(newItems)
    saveItems(newItems)

    return newItem
  }, [items, saveItems])

  // 更新知识库项目
  const updateItem = useCallback(async (id: string, updates: Partial<KnowledgeItem>): Promise<void> => {
    const newItems = items.map(item => 
      item.id === id 
        ? { ...item, ...updates, lastModified: new Date() }
        : item
    )
    setItems(newItems)
    saveItems(newItems)
  }, [items, saveItems])

  // 删除知识库项目
  const deleteItem = useCallback(async (id: string): Promise<void> => {
    const newItems = items.filter(item => item.id !== id)
    setItems(newItems)
    saveItems(newItems)
  }, [items, saveItems])

  // 获取单个项目
  const getItem = useCallback((id: string): KnowledgeItem | undefined => {
    return items.find(item => item.id === id)
  }, [items])

  // 搜索项目
  const searchItems = useCallback((query: string): KnowledgeItem[] => {
    if (!query.trim()) return items

    const lowerQuery = query.toLowerCase()
    return items.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.content?.toLowerCase().includes(lowerQuery) ||
      item.author?.toLowerCase().includes(lowerQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }, [items])

  // 按类型过滤
  const filterByType = useCallback((type: KnowledgeItem['type']): KnowledgeItem[] => {
    return items.filter(item => item.type === type)
  }, [items])

  // 按状态过滤
  const filterByStatus = useCallback((status: KnowledgeItem['status']): KnowledgeItem[] => {
    return items.filter(item => item.status === status)
  }, [items])

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    searchItems,
    filterByType,
    filterByStatus
  }
}

// 便捷 Hook：获取特定类型的知识库项目
export function useKnowledgeByType(type: KnowledgeItem['type']) {
  const { items, loading, error } = useKnowledge()
  const filteredItems = items.filter(item => item.type === type)
  
  return {
    items: filteredItems,
    loading,
    error
  }
}

// 便捷 Hook：获取最近的知识库项目
export function useRecentKnowledge(limit = 10) {
  const { items, loading, error } = useKnowledge()
  const recentItems = items
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, limit)
  
  return {
    items: recentItems,
    loading,
    error
  }
}

// 便捷 Hook：获取正在阅读的项目
export function useCurrentReading() {
  const { items, loading, error } = useKnowledge()
  const readingItems = items.filter(item => item.status === 'reading')
  
  return {
    items: readingItems,
    loading,
    error
  }
}