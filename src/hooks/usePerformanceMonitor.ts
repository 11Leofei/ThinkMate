import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage?: number
  thoughtsProcessed: number
  searchLatency: number
  aiResponseTime: number
}

interface PerformanceThresholds {
  renderTime: number
  searchLatency: number
  aiResponseTime: number
  memoryUsage: number
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  renderTime: 16, // 60fps = 16.67ms per frame
  searchLatency: 100, // 搜索应在100ms内完成
  aiResponseTime: 5000, // AI响应应在5秒内
  memoryUsage: 50 * 1024 * 1024 // 50MB内存限制
}

export function usePerformanceMonitor(enabled: boolean = true) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    thoughtsProcessed: 0,
    searchLatency: 0,
    aiResponseTime: 0
  })
  
  const thresholdsRef = useRef<PerformanceThresholds>(DEFAULT_THRESHOLDS)
  const observerRef = useRef<PerformanceObserver | null>(null)

  // 监控渲染性能
  const measureRenderTime = useCallback((componentName: string, fn: () => void) => {
    if (!enabled) {
      fn()
      return
    }

    const startTime = performance.now()
    fn()
    const endTime = performance.now()
    const renderTime = endTime - startTime

    metricsRef.current.renderTime = renderTime

    if (renderTime > thresholdsRef.current.renderTime) {
      console.warn(`⚡ ThinkMate性能警告: ${componentName} 渲染耗时 ${renderTime.toFixed(2)}ms (阈值: ${thresholdsRef.current.renderTime}ms)`)
    }
  }, [enabled])

  // 监控搜索性能
  const measureSearchTime = useCallback(async <T>(searchFn: () => Promise<T> | T): Promise<T> => {
    const startTime = performance.now()
    const result = await searchFn()
    const endTime = performance.now()
    const searchTime = endTime - startTime

    metricsRef.current.searchLatency = searchTime

    if (searchTime > thresholdsRef.current.searchLatency) {
      console.warn(`🔍 ThinkMate搜索性能警告: 搜索耗时 ${searchTime.toFixed(2)}ms (阈值: ${thresholdsRef.current.searchLatency}ms)`)
    }

    return result
  }, [])

  // 监控AI响应性能
  const measureAIResponseTime = useCallback(async <T>(aiFn: () => Promise<T>): Promise<T> => {
    const startTime = performance.now()
    const result = await aiFn()
    const endTime = performance.now()
    const responseTime = endTime - startTime

    metricsRef.current.aiResponseTime = responseTime

    if (responseTime > thresholdsRef.current.aiResponseTime) {
      console.warn(`🤖 ThinkMate AI性能警告: AI响应耗时 ${responseTime.toFixed(2)}ms (阈值: ${thresholdsRef.current.aiResponseTime}ms)`)
    }

    return result
  }, [])

  // 监控内存使用
  const checkMemoryUsage = useCallback(() => {
    if (!enabled || !('memory' in performance)) return

    const memory = (performance as any).memory
    if (memory) {
      const usedBytes = memory.usedJSHeapSize
      metricsRef.current.memoryUsage = usedBytes

      if (usedBytes > thresholdsRef.current.memoryUsage) {
        console.warn(`💾 ThinkMate内存警告: 内存使用 ${(usedBytes / 1024 / 1024).toFixed(2)}MB (阈值: ${(thresholdsRef.current.memoryUsage / 1024 / 1024).toFixed(2)}MB)`)
      }
    }
  }, [enabled])

  // 优化建议
  const getOptimizationSuggestions = useCallback((): string[] => {
    const suggestions: string[] = []
    const metrics = metricsRef.current

    if (metrics.renderTime > thresholdsRef.current.renderTime) {
      suggestions.push('考虑使用 React.memo() 或 useMemo() 优化组件渲染')
      suggestions.push('检查是否有不必要的重新渲染')
      suggestions.push('考虑虚拟化长列表')
    }

    if (metrics.searchLatency > thresholdsRef.current.searchLatency) {
      suggestions.push('优化搜索算法，考虑使用索引')
      suggestions.push('实现搜索防抖（debouncing）')
      suggestions.push('考虑分页或限制搜索结果数量')
    }

    if (metrics.aiResponseTime > thresholdsRef.current.aiResponseTime) {
      suggestions.push('检查AI API响应时间')
      suggestions.push('考虑实现响应缓存')
      suggestions.push('优化网络请求配置')
    }

    if (metrics.memoryUsage && metrics.memoryUsage > thresholdsRef.current.memoryUsage) {
      suggestions.push('检查内存泄漏')
      suggestions.push('考虑实现数据分页加载')
      suggestions.push('清理无用的引用和事件监听器')
    }

    return suggestions
  }, [])

  // 生成性能报告
  const generatePerformanceReport = useCallback(() => {
    const metrics = metricsRef.current
    const suggestions = getOptimizationSuggestions()
    
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {
        ...metrics,
        memoryUsageMB: metrics.memoryUsage ? (metrics.memoryUsage / 1024 / 1024).toFixed(2) : 'N/A'
      },
      thresholds: thresholdsRef.current,
      suggestions,
      overallHealth: suggestions.length === 0 ? 'excellent' : 
                    suggestions.length <= 2 ? 'good' : 
                    suggestions.length <= 4 ? 'fair' : 'poor'
    }

    console.table(report.metrics)
    if (suggestions.length > 0) {
      console.group('🚀 ThinkMate性能优化建议:')
      suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`)
      })
      console.groupEnd()
    }

    return report
  }, [getOptimizationSuggestions])

  useEffect(() => {
    if (!enabled) return

    // 监控长任务
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // 长于50ms的任务
            console.warn(`⏱️ ThinkMate长任务警告: ${entry.name || 'Unknown task'} 耗时 ${entry.duration.toFixed(2)}ms`)
          }
        }
      })

      try {
        observerRef.current.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // 某些浏览器可能不支持 longtask
      }
    }

    // 定期检查内存使用
    const memoryCheckInterval = setInterval(checkMemoryUsage, 30000) // 每30秒检查一次

    // 在页面卸载时生成报告
    const handleBeforeUnload = () => {
      if (enabled) {
        generatePerformanceReport()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      observerRef.current?.disconnect()
      clearInterval(memoryCheckInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, checkMemoryUsage, generatePerformanceReport])

  return {
    measureRenderTime,
    measureSearchTime,
    measureAIResponseTime,
    checkMemoryUsage,
    generatePerformanceReport,
    getMetrics: () => ({ ...metricsRef.current }),
    setThresholds: (newThresholds: Partial<PerformanceThresholds>) => {
      thresholdsRef.current = { ...thresholdsRef.current, ...newThresholds }
    }
  }
}