// CSV导出器 - 将数据转换为CSV格式
import { Thought } from '../../types'
import { KnowledgeItem } from '../../types/knowledge'

// 转义CSV字段中的特殊字符
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) return ''
  
  const str = String(field)
  // 如果包含逗号、引号或换行符，需要用引号包围并转义内部引号
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// 将数组转换为CSV行
function arrayToCSVRow(array: any[]): string {
  return array.map(escapeCSVField).join(',')
}

// 导出思想为CSV
export function convertThoughtsToCSV(thoughts: Thought[]): string {
  if (!thoughts || thoughts.length === 0) return ''

  const headers = [
    'ID',
    '内容',
    '时间戳',
    '类别',
    '标签',
    '是否收藏',
    'AI情感分析',
    'AI主题',
    'AI洞察',
    '思维模式类型',
    '思维模式频率',
    '创建日期',
    '最后修改'
  ]

  const rows = thoughts.map(thought => [
    thought.id,
    thought.content,
    thought.timestamp.toISOString(),
    thought.category || '',
    (thought.tags || []).join('; '),
    thought.isFavorite ? '是' : '否',
    thought.aiAnalysis?.sentiment || '',
    (thought.aiAnalysis?.themes || []).join('; '),
    (thought.aiAnalysis?.insights || []).join('; '),
    thought.aiAnalysis?.pattern?.type || '',
    thought.aiAnalysis?.pattern?.frequency || '',
    thought.timestamp.toLocaleDateString(),
    thought.lastModified ? new Date(thought.lastModified).toLocaleDateString() : ''
  ])

  const csvContent = [
    arrayToCSVRow(headers),
    ...rows.map(arrayToCSVRow)
  ].join('\n')

  return csvContent
}

// 导出知识库为CSV
export function convertKnowledgeToCSV(knowledge: KnowledgeItem[]): string {
  if (!knowledge || knowledge.length === 0) return ''

  const headers = [
    'ID',
    '标题',
    '类型',
    '状态',
    '作者',
    '描述',
    '标签',
    '进度',
    '评分',
    'URL',
    '创建时间',
    '最后修改',
    '内容摘要'
  ]

  const rows = knowledge.map(item => [
    item.id,
    item.title,
    item.type,
    item.status,
    item.author || '',
    item.description || '',
    (item.tags || []).join('; '),
    item.progress ? Math.round(item.progress * 100) + '%' : '',
    item.rating || '',
    item.url || '',
    new Date(item.createdAt).toLocaleDateString(),
    new Date(item.lastModified).toLocaleDateString(),
    item.content ? item.content.substring(0, 100) + '...' : ''
  ])

  const csvContent = [
    arrayToCSVRow(headers),
    ...rows.map(arrayToCSVRow)
  ].join('\n')

  return csvContent
}

// 导出连接关系为CSV
export function convertConnectionsToCSV(connections: any[]): string {
  if (!connections || connections.length === 0) return ''

  const headers = [
    'ID',
    '从思想ID',
    '到思想ID',
    '连接类型',
    '强度',
    '置信度',
    '描述',
    '创建时间',
    '验证次数'
  ]

  const rows = connections.map(conn => [
    conn.id,
    conn.fromThoughtId || '',
    conn.toThoughtId || '',
    conn.type,
    conn.strength || '',
    conn.confidence || '',
    conn.description || '',
    conn.createdAt ? new Date(conn.createdAt).toLocaleDateString() : '',
    conn.verificationCount || ''
  ])

  const csvContent = [
    arrayToCSVRow(headers),
    ...rows.map(arrayToCSVRow)
  ].join('\n')

  return csvContent
}

// 主要导出函数
export function convertToCSV(data: any): string {
  if (!data) return ''

  let csvContent = ''

  // 如果数据包含多个部分，创建多个CSV表
  if (data.thoughts && Array.isArray(data.thoughts)) {
    csvContent += '# 思想记录\n'
    csvContent += convertThoughtsToCSV(data.thoughts)
    csvContent += '\n\n'
  }

  if (data.knowledge && Array.isArray(data.knowledge)) {
    csvContent += '# 知识库\n'
    csvContent += convertKnowledgeToCSV(data.knowledge)
    csvContent += '\n\n'
  }

  if (data.connections && Array.isArray(data.connections)) {
    csvContent += '# 思想连接\n'
    csvContent += convertConnectionsToCSV(data.connections)
    csvContent += '\n\n'
  }

  // 如果数据直接是数组，尝试识别类型
  if (Array.isArray(data)) {
    if (data.length > 0) {
      const firstItem = data[0]
      if (firstItem.content && firstItem.timestamp) {
        // 看起来是思想数组
        csvContent = convertThoughtsToCSV(data as Thought[])
      } else if (firstItem.title && firstItem.type) {
        // 看起来是知识库数组
        csvContent = convertKnowledgeToCSV(data as KnowledgeItem[])
      } else if (firstItem.fromThoughtId && firstItem.toThoughtId) {
        // 看起来是连接数组
        csvContent = convertConnectionsToCSV(data)
      }
    }
  }

  return csvContent
}

// CSV导出选项
export interface CSVExportOptions {
  includeHeaders?: boolean
  delimiter?: string
  encoding?: string
  includeMetadata?: boolean
  flattenArrays?: boolean
  dateFormat?: 'iso' | 'local' | 'timestamp'
}

// 高级CSV导出
export function exportToCSV(data: any, options: CSVExportOptions = {}): string {
  const {
    includeHeaders = true,
    delimiter = ',',
    encoding = 'utf-8',
    includeMetadata = false,
    flattenArrays = true,
    dateFormat = 'local'
  } = options

  // 如果使用自定义分隔符，替换默认逗号
  let csvContent = convertToCSV(data)
  
  if (delimiter !== ',') {
    csvContent = csvContent.replace(/,/g, delimiter)
  }

  // 添加BOM用于Excel兼容性
  if (encoding === 'utf-8') {
    csvContent = '\uFEFF' + csvContent
  }

  // 添加元数据
  if (includeMetadata) {
    const metadata = [
      `# 导出时间: ${new Date().toISOString()}`,
      `# 编码: ${encoding}`,
      `# 分隔符: ${delimiter}`,
      `# 记录数: ${Array.isArray(data) ? data.length : Object.keys(data).length}`,
      ''
    ].join('\n')
    
    csvContent = metadata + csvContent
  }

  return csvContent
}

// 统计分析导出
export function exportStatisticsToCSV(data: any): string {
  if (!data) return ''

  const stats = calculateStatistics(data)
  
  const headers = ['指标', '数值', '描述']
  const rows = [
    ['思想总数', stats.totalThoughts, '记录的思想总数量'],
    ['知识项总数', stats.totalKnowledge, '知识库中的项目总数'],
    ['连接总数', stats.totalConnections, '思想之间的连接总数'],
    ['平均思想长度', stats.avgThoughtLength, '思想内容的平均字符数'],
    ['最活跃日期', stats.mostActiveDate, '记录思想最多的日期'],
    ['最常用标签', stats.mostCommonTag, '使用频率最高的标签'],
    ['积极情感比例', stats.positiveRatio + '%', 'AI分析为积极情感的思想比例'],
    ['创意思维比例', stats.creativeRatio + '%', 'AI分析为创意思维的比例']
  ]

  return [
    arrayToCSVRow(headers),
    ...rows.map(arrayToCSVRow)
  ].join('\n')
}

// 计算统计信息
function calculateStatistics(data: any): any {
  const stats: any = {
    totalThoughts: 0,
    totalKnowledge: 0,
    totalConnections: 0,
    avgThoughtLength: 0,
    mostActiveDate: '',
    mostCommonTag: '',
    positiveRatio: 0,
    creativeRatio: 0
  }

  if (data.thoughts && Array.isArray(data.thoughts)) {
    stats.totalThoughts = data.thoughts.length
    
    if (data.thoughts.length > 0) {
      const totalLength = data.thoughts.reduce((sum: number, thought: Thought) => sum + thought.content.length, 0)
      stats.avgThoughtLength = Math.round(totalLength / data.thoughts.length)
      
      // 分析日期分布
      const dateCount: Record<string, number> = {}
      data.thoughts.forEach((thought: Thought) => {
        const date = new Date(thought.timestamp).toDateString()
        dateCount[date] = (dateCount[date] || 0) + 1
      })
      
      stats.mostActiveDate = Object.entries(dateCount)
        .reduce((max, [date, count]) => count > max[1] ? [date, count] : max, ['', 0])[0]
      
      // 分析标签
      const tagCount: Record<string, number> = {}
      data.thoughts.forEach((thought: Thought) => {
        thought.tags?.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      })
      
      stats.mostCommonTag = Object.entries(tagCount)
        .reduce((max, [tag, count]) => count > max[1] ? [tag, count] : max, ['', 0])[0]
      
      // 情感分析
      const positiveThoughts = data.thoughts.filter((thought: Thought) => 
        thought.aiAnalysis?.sentiment === 'positive'
      ).length
      stats.positiveRatio = Math.round((positiveThoughts / data.thoughts.length) * 100)
      
      // 创意思维分析
      const creativeThoughts = data.thoughts.filter((thought: Thought) => 
        thought.aiAnalysis?.pattern?.type === 'creative'
      ).length
      stats.creativeRatio = Math.round((creativeThoughts / data.thoughts.length) * 100)
    }
  }

  if (data.knowledge && Array.isArray(data.knowledge)) {
    stats.totalKnowledge = data.knowledge.length
  }

  if (data.connections && Array.isArray(data.connections)) {
    stats.totalConnections = data.connections.length
  }

  return stats
}