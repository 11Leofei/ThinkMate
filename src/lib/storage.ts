import { Thought } from '@/types'

const STORAGE_KEY = 'thinkmate-thoughts'
const BACKUP_KEY = 'thinkmate-thoughts-backup'
const VERSION_KEY = 'thinkmate-data-version'
const CURRENT_VERSION = '1.0.0'

export class ThoughtStorage {
  // 保存想法到本地存储
  static saveThoughts(thoughts: Thought[]): void {
    try {
      // 创建备份
      const existing = localStorage.getItem(STORAGE_KEY)
      if (existing) {
        localStorage.setItem(BACKUP_KEY, existing)
      }

      // 保存新数据
      const data = {
        version: CURRENT_VERSION,
        timestamp: Date.now(),
        thoughts: thoughts.map(thought => ({
          ...thought,
          timestamp: thought.timestamp.toISOString() // 序列化日期
        }))
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      
      console.log(`已保存 ${thoughts.length} 条想法到本地存储`)
    } catch (error) {
      console.error('保存想法失败:', error)
      throw new Error('存储空间可能已满，请清理浏览器缓存')
    }
  }

  // 从本地存储加载想法
  static loadThoughts(): Thought[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        return []
      }

      const parsed = JSON.parse(data)
      
      // 版本兼容性检查
      if (parsed.version !== CURRENT_VERSION) {
        console.warn(`数据版本不匹配: ${parsed.version} -> ${CURRENT_VERSION}`)
        return this.migrateData(parsed)
      }

      // 反序列化日期
      const thoughts = parsed.thoughts.map((thought: any) => ({
        ...thought,
        timestamp: new Date(thought.timestamp)
      }))

      console.log(`已加载 ${thoughts.length} 条想法`)
      return thoughts
    } catch (error) {
      console.error('加载想法失败:', error)
      
      // 尝试加载备份
      try {
        const backup = localStorage.getItem(BACKUP_KEY)
        if (backup) {
          console.log('尝试从备份恢复数据')
          const parsed = JSON.parse(backup)
          return parsed.thoughts?.map((thought: any) => ({
            ...thought,
            timestamp: new Date(thought.timestamp)
          })) || []
        }
      } catch (backupError) {
        console.error('备份恢复失败:', backupError)
      }
      
      return []
    }
  }

  // 数据迁移
  private static migrateData(oldData: any): Thought[] {
    try {
      // 处理旧版本数据格式
      if (Array.isArray(oldData)) {
        // 直接是数组格式的旧数据
        return oldData.map((thought: any) => ({
          ...thought,
          timestamp: new Date(thought.timestamp || Date.now()),
          aiAnalysis: thought.aiAnalysis || null
        }))
      }

      if (oldData.thoughts) {
        return oldData.thoughts.map((thought: any) => ({
          ...thought,
          timestamp: new Date(thought.timestamp || Date.now()),
          aiAnalysis: thought.aiAnalysis || null
        }))
      }

      return []
    } catch (error) {
      console.error('数据迁移失败:', error)
      return []
    }
  }

  // 导出数据
  static exportThoughts(thoughts: Thought[]): string {
    const exportData = {
      version: CURRENT_VERSION,
      exportTime: new Date().toISOString(),
      totalThoughts: thoughts.length,
      thoughts: thoughts.map(thought => ({
        ...thought,
        timestamp: thought.timestamp.toISOString()
      }))
    }

    return JSON.stringify(exportData, null, 2)
  }

  // 导入数据
  static importThoughts(jsonData: string): Thought[] {
    try {
      const data = JSON.parse(jsonData)
      
      if (!data.thoughts || !Array.isArray(data.thoughts)) {
        throw new Error('无效的数据格式')
      }

      return data.thoughts.map((thought: any) => ({
        ...thought,
        timestamp: new Date(thought.timestamp),
        id: thought.id || Date.now().toString() + Math.random()
      }))
    } catch (error) {
      console.error('导入数据失败:', error)
      throw new Error('数据格式错误，请检查文件内容')
    }
  }

  // 清空所有数据
  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(BACKUP_KEY)
      localStorage.removeItem(VERSION_KEY)
      console.log('已清空所有本地数据')
    } catch (error) {
      console.error('清空数据失败:', error)
    }
  }

  // 获取存储统计信息
  static getStorageStats(): {
    totalThoughts: number
    storageSize: number
    lastSaved: Date | null
    hasBackup: boolean
  } {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      const backup = localStorage.getItem(BACKUP_KEY)
      
      if (!data) {
        return {
          totalThoughts: 0,
          storageSize: 0,
          lastSaved: null,
          hasBackup: !!backup
        }
      }

      const parsed = JSON.parse(data)
      
      return {
        totalThoughts: parsed.thoughts?.length || 0,
        storageSize: new Blob([data]).size,
        lastSaved: parsed.timestamp ? new Date(parsed.timestamp) : null,
        hasBackup: !!backup
      }
    } catch (error) {
      console.error('获取存储统计失败:', error)
      return {
        totalThoughts: 0,
        storageSize: 0,
        lastSaved: null,
        hasBackup: false
      }
    }
  }

  // 自动保存功能
  static setupAutoSave(thoughts: Thought[], interval: number = 30000): () => void {
    const saveInterval = setInterval(() => {
      if (thoughts.length > 0) {
        this.saveThoughts(thoughts)
      }
    }, interval)

    // 返回清理函数
    return () => clearInterval(saveInterval)
  }

  // 检查存储空间
  static checkStorageSpace(): {
    available: boolean
    usage: number
    quota: number
  } {
    try {
      // 尝试获取存储配额信息
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          console.log('存储空间:', {
            usage: estimate.usage,
            quota: estimate.quota,
            usagePercentage: estimate.usage && estimate.quota ? 
              (estimate.usage / estimate.quota * 100).toFixed(2) + '%' : 'unknown'
          })
        })
      }

      // 简单的空间测试
      const testKey = 'storage-test'
      const testData = new Array(1024).join('x') // 1KB test data
      
      try {
        localStorage.setItem(testKey, testData)
        localStorage.removeItem(testKey)
        return { available: true, usage: 0, quota: 0 }
      } catch (error) {
        return { available: false, usage: 0, quota: 0 }
      }
    } catch (error) {
      console.error('检查存储空间失败:', error)
      return { available: false, usage: 0, quota: 0 }
    }
  }
}