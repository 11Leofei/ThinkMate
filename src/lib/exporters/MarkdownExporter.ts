// Markdown导出器 - 将思想和知识转换为Markdown格式
import { Thought } from '../../types'
import { KnowledgeItem } from '../../types/knowledge'

export function convertToMarkdown(data: any): string {
  if (!data) return ''

  let markdown = ''

  // 导出头部信息
  markdown += `# ThinkMate 数据导出\n\n`
  markdown += `导出时间: ${new Date().toISOString()}\n\n`

  // 导出思想
  if (data.thoughts && Array.isArray(data.thoughts)) {
    markdown += `## 思想记录 (${data.thoughts.length})\n\n`
    
    data.thoughts.forEach((thought: Thought, index: number) => {
      markdown += `### ${index + 1}. ${thought.content.substring(0, 50)}...\n\n`
      markdown += `**内容:** ${thought.content}\n\n`
      markdown += `**时间:** ${new Date(thought.timestamp).toLocaleString()}\n\n`
      
      if (thought.tags && thought.tags.length > 0) {
        markdown += `**标签:** ${thought.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`
      }
      
      if (thought.category) {
        markdown += `**类别:** ${thought.category}\n\n`
      }
      
      if (thought.aiAnalysis) {
        markdown += `**AI分析:**\n`
        markdown += `- 情感: ${thought.aiAnalysis.sentiment}\n`
        if (thought.aiAnalysis.themes.length > 0) {
          markdown += `- 主题: ${thought.aiAnalysis.themes.join(', ')}\n`
        }
        if (thought.aiAnalysis.insights.length > 0) {
          markdown += `- 洞察: ${thought.aiAnalysis.insights.join('; ')}\n`
        }
        markdown += '\n'
      }
      
      markdown += '---\n\n'
    })
  }

  // 导出知识库
  if (data.knowledge && Array.isArray(data.knowledge)) {
    markdown += `## 知识库 (${data.knowledge.length})\n\n`
    
    data.knowledge.forEach((item: KnowledgeItem, index: number) => {
      markdown += `### ${index + 1}. ${item.title}\n\n`
      markdown += `**类型:** ${getKnowledgeTypeLabel(item.type)}\n\n`
      markdown += `**状态:** ${getStatusLabel(item.status)}\n\n`
      
      if (item.author) {
        markdown += `**作者:** ${item.author}\n\n`
      }
      
      if (item.description) {
        markdown += `**描述:** ${item.description}\n\n`
      }
      
      if (item.content) {
        markdown += `**内容摘要:**\n${item.content.substring(0, 200)}...\n\n`
      }
      
      if (item.tags && item.tags.length > 0) {
        markdown += `**标签:** ${item.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`
      }
      
      if (item.progress !== undefined) {
        markdown += `**进度:** ${Math.round(item.progress * 100)}%\n\n`
      }
      
      markdown += `**创建时间:** ${new Date(item.createdAt).toLocaleString()}\n\n`
      markdown += `**最后修改:** ${new Date(item.lastModified).toLocaleString()}\n\n`
      
      markdown += '---\n\n'
    })
  }

  // 导出连接关系
  if (data.connections && Array.isArray(data.connections)) {
    markdown += `## 思想连接 (${data.connections.length})\n\n`
    
    data.connections.forEach((connection: any, index: number) => {
      markdown += `### ${index + 1}. 连接关系\n\n`
      markdown += `**类型:** ${connection.type}\n\n`
      markdown += `**强度:** ${connection.strength}\n\n`
      
      if (connection.description) {
        markdown += `**描述:** ${connection.description}\n\n`
      }
      
      markdown += `**创建时间:** ${new Date(connection.createdAt).toLocaleString()}\n\n`
      markdown += '---\n\n'
    })
  }

  // 导出统计信息
  if (data.stats) {
    markdown += `## 统计信息\n\n`
    markdown += `- 总思想数: ${data.stats.totalThoughts || 0}\n`
    markdown += `- 总知识项: ${data.stats.totalKnowledge || 0}\n`
    markdown += `- 总连接数: ${data.stats.totalConnections || 0}\n`
    markdown += `- 导出大小: ${formatFileSize(markdown.length)}\n\n`
  }

  return markdown
}

// 获取知识类型标签
function getKnowledgeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    book: '📚 书籍',
    article: '📄 文章', 
    paper: '📑 论文',
    note: '📝 笔记',
    course: '🎓 课程',
    podcast: '🎧 播客',
    video: '🎬 视频'
  }
  return labels[type] || type
}

// 获取状态标签
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    reading: '📖 阅读中',
    completed: '✅ 已完成',
    paused: '⏸️ 暂停',
    planned: '📅 计划中'
  }
  return labels[status] || status
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成目录
export function generateTableOfContents(data: any): string {
  let toc = '## 目录\n\n'
  
  if (data.thoughts && data.thoughts.length > 0) {
    toc += `- [思想记录](#思想记录-${data.thoughts.length})\n`
  }
  
  if (data.knowledge && data.knowledge.length > 0) {
    toc += `- [知识库](#知识库-${data.knowledge.length})\n`
  }
  
  if (data.connections && data.connections.length > 0) {
    toc += `- [思想连接](#思想连接-${data.connections.length})\n`
  }
  
  if (data.stats) {
    toc += `- [统计信息](#统计信息)\n`
  }
  
  toc += '\n'
  return toc
}

// 高级导出选项
export interface MarkdownExportOptions {
  includeAnalysis?: boolean
  includeConnections?: boolean
  includeMetadata?: boolean
  includeTOC?: boolean
  sortBy?: 'date' | 'category' | 'title'
  filterBy?: {
    category?: string
    tags?: string[]
    dateRange?: { start: Date; end: Date }
  }
}

// 高级Markdown导出
export function exportToMarkdown(data: any, options: MarkdownExportOptions = {}): string {
  const {
    includeAnalysis = true,
    includeConnections = true,
    includeMetadata = true,
    includeTOC = true,
    sortBy = 'date',
    filterBy
  } = options

  // 过滤数据
  let filteredData = { ...data }
  
  if (filterBy) {
    if (filteredData.thoughts) {
      filteredData.thoughts = filteredData.thoughts.filter((thought: Thought) => {
        if (filterBy.category && thought.category !== filterBy.category) return false
        if (filterBy.tags && !filterBy.tags.some(tag => thought.tags?.includes(tag))) return false
        if (filterBy.dateRange) {
          const thoughtDate = new Date(thought.timestamp)
          if (thoughtDate < filterBy.dateRange.start || thoughtDate > filterBy.dateRange.end) return false
        }
        return true
      })
    }
  }

  // 排序数据
  if (filteredData.thoughts) {
    filteredData.thoughts.sort((a: Thought, b: Thought) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'category':
          return (a.category || '').localeCompare(b.category || '')
        case 'title':
          return a.content.localeCompare(b.content)
        default:
          return 0
      }
    })
  }

  // 生成Markdown
  let markdown = `# ThinkMate 导出报告\n\n`
  markdown += `导出时间: ${new Date().toISOString()}\n\n`

  if (includeTOC) {
    markdown += generateTableOfContents(filteredData)
  }

  const baseMarkdown = convertToMarkdown(filteredData)
  markdown += baseMarkdown

  if (includeMetadata) {
    markdown += `\n## 导出元数据\n\n`
    markdown += `- 导出选项: ${JSON.stringify(options, null, 2)}\n`
    markdown += `- 原始数据大小: ${formatFileSize(JSON.stringify(data).length)}\n`
    markdown += `- 导出文件大小: ${formatFileSize(markdown.length)}\n`
  }

  return markdown
}