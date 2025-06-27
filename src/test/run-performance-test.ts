// 运行性能测试

import { performanceTest, memoryMonitor, generateTestData } from './performance-test'
import { ThoughtStorage } from '../lib/storage'
import { thoughtLinkingEngine } from '../lib/linking'
import { getAIService } from '../services/ai'

export async function runPerformanceTests() {
  console.log('=== ThinkMate 性能测试开始 ===\n')

  // 1. 测试数据生成
  console.log('1. 生成测试数据...')
  const smallDataset = performanceTest.measure(() => generateTestData(100), '生成100条数据')
  const mediumDataset = performanceTest.measure(() => generateTestData(1000), '生成1000条数据')
  const largeDataset = performanceTest.measure(() => generateTestData(5000), '生成5000条数据')

  // 2. 测试存储性能
  console.log('\n2. 测试存储性能...')
  memoryMonitor.start()
  
  await performanceTest.measureAsync(async () => {
    ThoughtStorage.saveThoughts(smallDataset)
  }, '保存100条数据')
  
  memoryMonitor.checkpoint('保存100条后')
  
  await performanceTest.measureAsync(async () => {
    ThoughtStorage.saveThoughts(mediumDataset)
  }, '保存1000条数据')
  
  memoryMonitor.checkpoint('保存1000条后')

  // 3. 测试读取性能
  console.log('\n3. 测试读取性能...')
  performanceTest.measure(() => {
    ThoughtStorage.loadThoughts()
  }, '读取所有数据')

  // 4. 测试搜索性能
  console.log('\n4. 测试搜索性能...')
  const searchTerms = ['测试', '创意', '思想', '计划', '学习']
  
  searchTerms.forEach(term => {
    performanceTest.measure(() => {
      ThoughtStorage.searchThoughts(term, mediumDataset)
    }, `搜索"${term}"`)
  })

  // 5. 测试思维链接引擎
  console.log('\n5. 测试思维链接引擎...')
  
  await performanceTest.measureAsync(async () => {
    await thoughtLinkingEngine.discoverConnections(smallDataset.slice(0, 50))
  }, '发现50条数据的连接')
  
  await performanceTest.measureAsync(async () => {
    await thoughtLinkingEngine.buildKnowledgeGraph(smallDataset)
  }, '构建100条数据的知识图谱')

  // 6. 测试AI分析（如果配置了）
  const aiService = getAIService()
  if (aiService) {
    console.log('\n6. 测试AI分析性能...')
    
    const sampleThought = smallDataset[0]
    await performanceTest.measureAsync(async () => {
      await aiService.analyzeThought(sampleThought, smallDataset.slice(1, 10))
    }, 'AI分析单个思想')
    
    await performanceTest.measureAsync(async () => {
      await aiService.analyzeThinkingPatterns(smallDataset.slice(0, 20))
    }, 'AI分析思维模式(20条)')
  }

  // 7. 测试数据导出
  console.log('\n7. 测试数据导出性能...')
  const { convertToMarkdown } = await import('../lib/exporters/MarkdownExporter')
  const { convertToCSV } = await import('../lib/exporters/CSVExporter')
  
  performanceTest.measure(() => {
    convertToMarkdown({ thoughts: mediumDataset })
  }, '导出1000条为Markdown')
  
  performanceTest.measure(() => {
    convertToCSV({ thoughts: mediumDataset })
  }, '导出1000条为CSV')

  // 8. 测试过滤和排序
  console.log('\n8. 测试过滤和排序性能...')
  
  performanceTest.measure(() => {
    mediumDataset.filter(t => t.tags.includes('创意'))
  }, '过滤标签(1000条)')
  
  performanceTest.measure(() => {
    [...mediumDataset].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, '时间排序(1000条)')

  // 打印报告
  performanceTest.printReport()
  
  console.log('\n=== 内存使用报告 ===')
  console.log(memoryMonitor.getReport())
  
  console.log('\n=== 性能优化建议 ===')
  const report = performanceTest.getReport()
  
  // 分析并提供建议
  if (parseFloat(report['保存1000条数据']?.average || '0') > 100) {
    console.log('⚠️  存储性能较慢，建议:')
    console.log('   - 使用批量写入')
    console.log('   - 考虑使用 IndexedDB')
    console.log('   - 实现数据分片')
  }
  
  if (parseFloat(report['搜索"测试"']?.average || '0') > 50) {
    console.log('⚠️  搜索性能需要优化，建议:')
    console.log('   - 实现搜索索引')
    console.log('   - 使用 Web Worker 进行搜索')
    console.log('   - 实现搜索结果缓存')
  }
  
  if (parseFloat(report['构建100条数据的知识图谱']?.average || '0') > 500) {
    console.log('⚠️  知识图谱构建较慢，建议:')
    console.log('   - 使用增量更新')
    console.log('   - 实现图谱缓存')
    console.log('   - 优化连接算法')
  }
  
  console.log('\n✅ 性能测试完成！')
}

// 如果直接运行此文件
if (import.meta.url === new URL(import.meta.url).href) {
  runPerformanceTests().catch(console.error)
}