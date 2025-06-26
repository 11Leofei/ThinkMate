import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  BarChart3,
  PieChart,
  Brain,
  Heart,
  Lightbulb,
  Target,
  Clock,
  Award,
  ArrowLeft,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Thought } from '@/types'

interface DayStats {
  date: Date
  thoughtCount: number
  totalWords: number
  dominantMood: 'positive' | 'negative' | 'neutral'
  moodDistribution: { positive: number; negative: number; neutral: number }
  topPatterns: Array<{ type: string; count: number }>
  topThemes: Array<{ theme: string; count: number }>
  insights: string[]
  productivity: number // 1-10
  creativity: number // 1-10
  reflection: number // 1-10
}

interface DailySummaryProps {
  thoughts: Thought[]
}

export function DailySummary({ thoughts }: DailySummaryProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')

  // 计算日期范围内的统计数据
  const computeStats = useMemo(() => {
    const stats = new Map<string, DayStats>()
    
    // 按日期分组想法
    const thoughtsByDate = new Map<string, Thought[]>()
    thoughts.forEach(thought => {
      const dateKey = thought.timestamp.toDateString()
      if (!thoughtsByDate.has(dateKey)) {
        thoughtsByDate.set(dateKey, [])
      }
      thoughtsByDate.get(dateKey)!.push(thought)
    })

    // 计算每日统计
    thoughtsByDate.forEach((dayThoughts, dateKey) => {
      const date = new Date(dateKey)
      
      // 基础统计
      const thoughtCount = dayThoughts.length
      const totalWords = dayThoughts.reduce((sum, t) => sum + t.content.split(' ').length, 0)
      
      // 情感分析
      const sentiments = dayThoughts
        .filter(t => t.aiAnalysis?.sentiment)
        .map(t => t.aiAnalysis!.sentiment)
      
      const moodDistribution = {
        positive: sentiments.filter(s => s === 'positive').length,
        negative: sentiments.filter(s => s === 'negative').length,
        neutral: sentiments.filter(s => s === 'neutral').length
      }
      
      const dominantMood = Object.entries(moodDistribution)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as 'positive' | 'negative' | 'neutral' || 'neutral'

      // 思维模式统计
      const patterns = dayThoughts
        .filter(t => t.aiAnalysis?.pattern?.type)
        .map(t => t.aiAnalysis!.pattern!.type)
      
      const patternCounts = patterns.reduce((acc, pattern) => {
        acc[pattern] = (acc[pattern] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const topPatterns = Object.entries(patternCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type, count]) => ({ type, count }))

      // 主题统计
      const themes = dayThoughts.flatMap(t => t.tags || [])
      const themeCounts = themes.reduce((acc, theme) => {
        acc[theme] = (acc[theme] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const topThemes = Object.entries(themeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([theme, count]) => ({ theme, count }))

      // 生成洞察
      const insights = generateDailyInsights(dayThoughts, {
        thoughtCount,
        totalWords,
        dominantMood,
        topPatterns,
        topThemes
      })

      // 计算评分
      const productivity = Math.min(10, Math.max(1, Math.round(thoughtCount * 2 + totalWords / 50)))
      const creativity = topPatterns.find(p => p.type === 'creative')?.count || 0
      const reflection = topPatterns.find(p => p.type === 'reflective')?.count || 0

      stats.set(dateKey, {
        date,
        thoughtCount,
        totalWords,
        dominantMood,
        moodDistribution,
        topPatterns,
        topThemes,
        insights,
        productivity: Math.min(10, productivity),
        creativity: Math.min(10, creativity * 2),
        reflection: Math.min(10, reflection * 2)
      })
    })

    return stats
  }, [thoughts])

  // 生成每日洞察
  const generateDailyInsights = (
    _dayThoughts: Thought[], 
    stats: { thoughtCount: number; totalWords: number; dominantMood: string; topPatterns: any[]; topThemes: any[] }
  ): string[] => {
    const insights: string[] = []

    // 活跃度洞察
    if (stats.thoughtCount >= 10) {
      insights.push(`🔥 今天思维非常活跃，记录了${stats.thoughtCount}个想法！`)
    } else if (stats.thoughtCount >= 5) {
      insights.push(`💭 今天有${stats.thoughtCount}个想法，保持了良好的思维记录习惯`)
    } else if (stats.thoughtCount > 0) {
      insights.push(`🌱 今天记录了${stats.thoughtCount}个想法，每一个想法都很珍贵`)
    }

    // 情感洞察
    if (stats.dominantMood === 'positive') {
      insights.push(`😊 今天的想法以积极情绪为主，心情不错！`)
    } else if (stats.dominantMood === 'negative') {
      insights.push(`💙 今天的想法偏向消极，记得关注自己的心理健康`)
    }

    // 思维模式洞察
    if (stats.topPatterns.length > 0) {
      const topPattern = stats.topPatterns[0]
      const patternNames = {
        creative: '创意思维',
        analytical: '分析思维',
        problemSolving: '解决问题',
        reflective: '反思思维',
        planning: '规划思维'
      }
      insights.push(`🧠 今天主要使用${patternNames[topPattern.type as keyof typeof patternNames]}，思维模式很集中`)
    }

    // 主题洞察
    if (stats.topThemes.length > 0) {
      const topTheme = stats.topThemes[0]
      insights.push(`🎯 今天最关注的主题是"${topTheme.theme}"，出现了${topTheme.count}次`)
    }

    // 深度洞察
    const avgWordsPerThought = Math.round(stats.totalWords / stats.thoughtCount)
    if (avgWordsPerThought > 50) {
      insights.push(`📚 今天的想法平均${avgWordsPerThought}个字，思考很深入`)
    } else if (avgWordsPerThought < 20) {
      insights.push(`⚡ 今天的想法比较简洁，平均${avgWordsPerThought}个字`)
    }

    return insights
  }

  // 获取当前查看的统计数据
  const currentStats = useMemo(() => {
    const dateKey = selectedDate.toDateString()
    return computeStats.get(dateKey)
  }, [selectedDate, computeStats])

  // 导航日期
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setSelectedDate(newDate)
  }

  // 导出报告
  const exportReport = () => {
    if (!currentStats) return

    const report = {
      date: currentStats.date.toISOString(),
      summary: {
        thoughtCount: currentStats.thoughtCount,
        totalWords: currentStats.totalWords,
        productivity: currentStats.productivity,
        creativity: currentStats.creativity,
        reflection: currentStats.reflection
      },
      mood: {
        dominant: currentStats.dominantMood,
        distribution: currentStats.moodDistribution
      },
      patterns: currentStats.topPatterns,
      themes: currentStats.topThemes,
      insights: currentStats.insights
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thinkmate-daily-${currentStats.date.toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 分享报告
  const shareReport = async () => {
    if (!currentStats) return

    const summary = `ThinkMate 每日总结 ${currentStats.date.toLocaleDateString()}

📊 今日统计:
• ${currentStats.thoughtCount} 个想法
• ${currentStats.totalWords} 个字
• 生产力: ${currentStats.productivity}/10

🎯 主要洞察:
${currentStats.insights.join('\n')}

#ThinkMate #思维记录`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ThinkMate 每日总结',
          text: summary
        })
      } catch (err) {
        console.error('分享失败:', err)
      }
    } else {
      await navigator.clipboard.writeText(summary)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="space-y-6">
      {/* 头部控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            每日总结
          </h2>
          
          {/* 视图模式切换 */}
          <div className="flex bg-secondary rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === mode
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === 'day' ? '日' : mode === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => shareReport()}
            className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            title="分享报告"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={exportReport}
            className="p-2 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            title="导出报告"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 日期导航 */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        <div className="text-center">
          <div className="text-lg font-medium">{formatDate(selectedDate)}</div>
          {currentStats && (
            <div className="text-sm text-muted-foreground">
              {currentStats.thoughtCount} 个想法 • {currentStats.totalWords} 个字
            </div>
          )}
        </div>
        
        <button
          onClick={() => navigateDate('next')}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {currentStats ? (
        <div className="space-y-6">
          {/* 核心指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">生产力</div>
                  <div className="text-xs text-muted-foreground">思维活跃度</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {currentStats.productivity}/10
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentStats.productivity * 10}%` }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">创意度</div>
                  <div className="text-xs text-muted-foreground">创新思维</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-500">
                {currentStats.creativity}/10
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentStats.creativity * 10}%` }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">反思度</div>
                  <div className="text-xs text-muted-foreground">深度思考</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-500">
                {currentStats.reflection}/10
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentStats.reflection * 10}%` }}
                />
              </div>
            </motion.div>
          </div>

          {/* 情感分布 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              情感分布
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(currentStats.moodDistribution).map(([mood, count]) => {
                const total = Object.values(currentStats.moodDistribution).reduce((sum, val) => sum + val, 0)
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                const colors = {
                  positive: 'text-green-500 bg-green-500/10',
                  negative: 'text-red-500 bg-red-500/10',
                  neutral: 'text-blue-500 bg-blue-500/10'
                }
                const labels = {
                  positive: '积极 😊',
                  negative: '消极 😔',
                  neutral: '中性 😐'
                }
                
                return (
                  <div key={mood} className={cn("p-4 rounded-lg", colors[mood as keyof typeof colors])}>
                    <div className="text-sm font-medium mb-1">
                      {labels[mood as keyof typeof labels]}
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs opacity-70">{percentage}%</div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* 洞察和建议 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              今日洞察
            </h3>
            <div className="space-y-3">
              {currentStats.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-3 bg-accent/10 rounded-lg border border-accent/20"
                >
                  <p className="text-sm">{insight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 主题和模式统计 */}
          {(currentStats.topThemes.length > 0 || currentStats.topPatterns.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 热门主题 */}
              {currentStats.topThemes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-500" />
                    热门主题
                  </h3>
                  <div className="space-y-3">
                    {currentStats.topThemes.map((theme) => (
                      <div key={theme.theme} className="flex items-center justify-between">
                        <span className="text-sm">{theme.theme}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(theme.count / currentStats.topThemes[0].count) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-6">{theme.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 思维模式 */}
              {currentStats.topPatterns.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    思维模式
                  </h3>
                  <div className="space-y-3">
                    {currentStats.topPatterns.map((pattern) => {
                      const patternNames = {
                        creative: '💡 创意型',
                        analytical: '🔍 分析型',
                        problemSolving: '⚡ 解决问题',
                        reflective: '🪞 反思型',
                        planning: '📋 规划型'
                      }
                      
                      return (
                        <div key={pattern.type} className="flex items-center justify-between">
                          <span className="text-sm">
                            {patternNames[pattern.type as keyof typeof patternNames] || pattern.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(pattern.count / currentStats.topPatterns[0].count) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-6">{pattern.count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">这一天还没有想法记录</h3>
          <p className="text-muted-foreground">
            在{formatDate(selectedDate)}记录你的第一个想法吧！
          </p>
        </motion.div>
      )}
    </div>
  )
}