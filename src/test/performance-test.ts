// ThinkMate 性能测试

export class PerformanceTest {
  private startTime: number = 0
  private measurements: Map<string, number[]> = new Map()

  start(label: string) {
    this.startTime = performance.now()
    console.log(`[性能测试] 开始: ${label}`)
  }

  end(label: string) {
    const endTime = performance.now()
    const duration = endTime - this.startTime
    
    if (!this.measurements.has(label)) {
      this.measurements.set(label, [])
    }
    this.measurements.get(label)!.push(duration)
    
    console.log(`[性能测试] 完成: ${label} - ${duration.toFixed(2)}ms`)
  }

  measure(fn: () => any, label: string) {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  }

  async measureAsync(fn: () => Promise<any>, label: string) {
    this.start(label)
    const result = await fn()
    this.end(label)
    return result
  }

  getReport() {
    const report: any = {}
    
    this.measurements.forEach((times, label) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      const min = Math.min(...times)
      const max = Math.max(...times)
      
      report[label] = {
        count: times.length,
        average: avg.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        total: times.reduce((a, b) => a + b, 0).toFixed(2)
      }
    })
    
    return report
  }

  printReport() {
    console.log('\n=== 性能测试报告 ===')
    const report = this.getReport()
    
    Object.entries(report).forEach(([label, stats]: [string, any]) => {
      console.log(`\n${label}:`)
      console.log(`  执行次数: ${stats.count}`)
      console.log(`  平均耗时: ${stats.average}ms`)
      console.log(`  最小耗时: ${stats.min}ms`)
      console.log(`  最大耗时: ${stats.max}ms`)
      console.log(`  总耗时: ${stats.total}ms`)
    })
  }
}

// 内存使用监控
export class MemoryMonitor {
  private initialMemory: number = 0
  private measurements: Map<string, number> = new Map()

  start() {
    if ('memory' in performance) {
      this.initialMemory = (performance as any).memory.usedJSHeapSize
    }
  }

  checkpoint(label: string) {
    if ('memory' in performance) {
      const currentMemory = (performance as any).memory.usedJSHeapSize
      const diff = currentMemory - this.initialMemory
      this.measurements.set(label, diff)
      console.log(`[内存] ${label}: ${(diff / 1024 / 1024).toFixed(2)}MB`)
    }
  }

  getReport() {
    const report: any = {}
    this.measurements.forEach((bytes, label) => {
      report[label] = {
        bytes,
        mb: (bytes / 1024 / 1024).toFixed(2)
      }
    })
    return report
  }
}

// 渲染性能监控
export class RenderMonitor {
  private frameCount = 0
  private startTime = 0
  private fps: number[] = []

  start() {
    this.startTime = performance.now()
    this.frameCount = 0
    this.measureFPS()
  }

  private measureFPS() {
    requestAnimationFrame(() => {
      this.frameCount++
      const elapsed = performance.now() - this.startTime
      
      if (elapsed >= 1000) {
        const currentFPS = (this.frameCount * 1000) / elapsed
        this.fps.push(currentFPS)
        console.log(`[FPS] ${currentFPS.toFixed(1)}`)
        
        this.frameCount = 0
        this.startTime = performance.now()
      }
      
      if (this.fps.length < 10) {
        this.measureFPS()
      }
    })
  }

  getAverageFPS() {
    if (this.fps.length === 0) return 0
    return this.fps.reduce((a, b) => a + b, 0) / this.fps.length
  }
}

// 批量数据生成器
export function generateTestData(count: number) {
  const thoughts = []
  const baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30天前

  for (let i = 0; i < count; i++) {
    thoughts.push({
      id: `test-${i}`,
      content: `这是测试思想 ${i}，包含一些随机内容来模拟真实数据。${Math.random() > 0.5 ? '这个思想有更多内容。' : ''}`,
      timestamp: new Date(baseTime + Math.random() * 30 * 24 * 60 * 60 * 1000),
      tags: generateRandomTags(),
      category: ['创意', '反思', '计划', '学习'][Math.floor(Math.random() * 4)],
      aiAnalysis: Math.random() > 0.3 ? {
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
        themes: generateRandomTags(),
        connections: [],
        insights: ['洞察1', '洞察2'],
        pattern: {
          type: 'creative' as any,
          frequency: Math.random() * 10,
          recentTrend: 'stable' as any,
          recommendations: ['建议1']
        }
      } : undefined
    })
  }

  return thoughts
}

function generateRandomTags() {
  const allTags = ['工作', '生活', '学习', '创意', '技术', '思考', '计划', '目标', '反思', '灵感']
  const count = Math.floor(Math.random() * 4) + 1
  const tags: string[] = []
  
  for (let i = 0; i < count; i++) {
    const tag = allTags[Math.floor(Math.random() * allTags.length)]
    if (!tags.includes(tag)) {
      tags.push(tag)
    }
  }
  
  return tags
}

// 导出默认实例
export const performanceTest = new PerformanceTest()
export const memoryMonitor = new MemoryMonitor()
export const renderMonitor = new RenderMonitor()