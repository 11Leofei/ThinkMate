import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, Calendar } from 'lucide-react'
import { cn } from './lib/utils'
import { Thought, Connection, MediaFile, ContentSegment, KnowledgeItem } from './types'
import { useTranslation } from './hooks/useTranslation'
import { createAIService, getAIService } from './lib/aiService'
import { translations } from './lib/i18n'
import { AIConfigModal } from './components/features/AIConfigModal'
import { EnhancedSettingsModal } from './components/features/EnhancedSettingsModal'
import { SearchBar } from './components/features/SearchBar'
import { ThoughtCard } from './components/features/ThoughtCard'
import { ThoughtConnections } from './components/features/ThoughtConnections'
import { DailySummary } from './components/features/DailySummary'
import { FileUpload } from './components/features/FileUpload'
import { KnowledgeBase } from './components/features/KnowledgeBase'
import { KnowledgeGraph } from './components/features/KnowledgeGraph'
import { MCPIntegration } from './components/features/MCPIntegration'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { EnhancedSidebar } from './components/layout/EnhancedSidebar'
import { ThoughtStorage } from './lib/storage'
import { getMediaService } from './lib/mediaService'
import { getKnowledgeService } from './lib/knowledgeService'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
// 动态导入扩展系统，避免循环依赖
// import { initializeThinkMateExtensions, getPluginRegistry } from './lib/architecture/PluginRegistry'

function App() {
  const { t, currentLanguage, changeLanguage } = useTranslation()
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [currentThought, setCurrentThought] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [liveAnalysis, setLiveAnalysis] = useState<any>(null)
  const [showAIConfig, setShowAIConfig] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [aiConfigured, setAIConfigured] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [searchResults, setSearchResults] = useState<Thought[] | null>(null)
  const [currentView, setCurrentView] = useState<'capture' | 'search' | 'insights' | 'patterns' | 'daily' | 'connections' | 'upload' | 'knowledge' | 'graph' | 'mcp'>('capture')
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedThoughtId, setSelectedThoughtId] = useState<string>('')
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [selectedKnowledgeItem, setSelectedKnowledgeItem] = useState<string>('')
  const [enhancedThoughts, setEnhancedThoughts] = useState<Thought[]>([])
  const [, setExtensionsInitialized] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaService = getMediaService()
  const knowledgeService = getKnowledgeService()

  // 加载本地存储的想法
  useEffect(() => {
    const savedThoughts = ThoughtStorage.loadThoughts()
    setThoughts(savedThoughts)
    
    // 获取最后保存时间
    const stats = ThoughtStorage.getStorageStats()
    setLastSaved(stats.lastSaved)
  }, [])

  // 加载媒体文件和知识库
  useEffect(() => {
    const loadedMediaFiles = mediaService.getStoredMediaFiles()
    setMediaFiles(loadedMediaFiles)
    
    const loadedKnowledgeItems = knowledgeService.getKnowledgeItems()
    setKnowledgeItems(loadedKnowledgeItems)
  }, [])

  // 同步thoughts到enhancedThoughts
  useEffect(() => {
    setEnhancedThoughts(thoughts)
  }, [thoughts])

  // Auto-focus the capture input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // 初始化扩展系统 - 使用完全动态导入避免循环依赖
  useEffect(() => {
    const initializeExtensions = async () => {
      try {
        // 延迟初始化，确保应用已完全加载
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 检查必要服务是否已初始化
        const aiService = getAIService()
        if (!aiService) {
          console.warn('AI服务未初始化，跳过扩展系统初始化')
          return
        }
        
        console.log('开始动态加载扩展系统...')
        
        // 动态导入扩展系统
        const { initializeThinkMateExtensions, getPluginRegistry } = await import('./lib/architecture/PluginRegistry')
        
        await initializeThinkMateExtensions()
        setExtensionsInitialized(true)
        console.log('扩展系统初始化完成')
        
        // 获取系统信息
        const registry = getPluginRegistry()
        const systemInfo = registry.getSystemInfo()
        console.log('系统信息:', systemInfo)
      } catch (error) {
        console.error('扩展系统初始化失败:', error)
        // 不让扩展系统的失败影响主应用
        setExtensionsInitialized(false)
      }
    }
    
    // 只在AI配置后初始化扩展
    if (aiConfigured) {
      initializeExtensions()
    }
  }, [aiConfigured])

  // 初始化AI服务
  useEffect(() => {
    const savedConfig = localStorage.getItem('thinkmate-ai-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        createAIService({
          primary: config,
          enablePersonalization: true,
          cacheResults: true
        })
        setAIConfigured(true)
      } catch (error) {
        console.error('AI配置加载失败:', error)
      }
    }
  }, [])

  // 实时分析用户输入 - 修复循环依赖问题  
  useEffect(() => {
    // 防抖处理，避免频繁触发
    const timer = setTimeout(() => {
    if (currentThought.length > 20) {
      if (aiConfigured) {
        const aiService = getAIService()
        if (aiService) {
          const tempThought: Thought = {
            id: 'temp',
            content: currentThought,
            timestamp: new Date(),
            tags: [],
            category: ''
          }
          
          // 设置分析超时，使用静态的thoughts引用避免循环依赖
          const currentThoughts = thoughts.slice() // 创建副本
          const analysisPromise = aiService.analyzeThought(tempThought, currentThoughts)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AI分析超时')), 5000) // 5秒超时
          })
          
          Promise.race([analysisPromise, timeoutPromise])
            .then(analysis => {
              setLiveAnalysis(analysis)
            })
            .catch(error => {
              console.error('实时分析失败:', error)
              // 使用本地分析作为备选
              setLiveAnalysis({
                sentiment: 'neutral',
                themes: ['思考'],
                connections: [],
                insights: ['AI分析暂时不可用，使用本地分析'],
                pattern: {
                  type: 'reflective',
                  frequency: 1,
                  recentTrend: 'stable',
                  recommendations: ['继续记录你的想法']
                }
              })
            })
        }
      } else {
        // 未配置AI时使用简单的本地分析
        setLiveAnalysis({
          sentiment: 'neutral',
          themes: ['思考'],
          connections: [],
          insights: ['📌 点击侧边栏"设置"配置AI分析功能'],
          pattern: {
            type: 'reflective',
            frequency: 1,
            recentTrend: 'stable',
            recommendations: ['配置AI后可获得智能分析']
          }
        })
      }
    } else {
      setLiveAnalysis(null)
    }
    }, 500) // 500ms防抖

    return () => clearTimeout(timer)
  }, [currentThought, aiConfigured]) // 移除thoughts依赖，避免循环

  // 生成整体思维洞察
  const [overallAnalysis, setOverallAnalysis] = useState<any>(null)
  
  useEffect(() => {
    if (thoughts.length > 0 && aiConfigured) {
      const aiService = getAIService()
      if (aiService) {
        aiService.analyzeThinkingPatterns(thoughts).then(analysis => {
          setOverallAnalysis(analysis)
        }).catch(error => {
          console.error('整体分析失败:', error)
        })
      }
    }
  }, [thoughts, aiConfigured])

  const handleCapture = async () => {
    if (!currentThought.trim()) return

    const newThought: Thought = {
      id: Date.now().toString(),
      content: currentThought.trim(),
      timestamp: new Date(),
      tags: [],
      category: t('general')
    }

    // AI分析 (异步，不阻塞保存)
    if (aiConfigured) {
      const aiService = getAIService()
      if (aiService) {
        // 先保存想法，再异步分析
        const analysisPromise = aiService.analyzeThought(newThought, thoughts)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AI分析超时')), 15000) // 15秒超时
        })
        
        Promise.race([analysisPromise, timeoutPromise])
          .then((analysis: any) => {
            // 分析完成后更新想法
            setThoughts(prevThoughts => {
              const updatedThoughts = prevThoughts.map(thought => {
                if (thought.id === newThought.id) {
                  const updatedThought = { ...thought }
                  updatedThought.aiAnalysis = analysis as any
                  
                  // 根据AI分析更新分类
                  if (analysis.pattern) {
                    const patternTranslationKey = analysis.pattern.type as keyof typeof translations.zh
                    updatedThought.category = t(patternTranslationKey) || t('general')
                  }
                  
                  // 自动生成标签
                  if (analysis.themes && analysis.themes.length > 0) {
                    updatedThought.tags = analysis.themes.slice(0, 3)
                  }
                  
                  return updatedThought
                }
                return thought
              })
              
              // 重新保存更新后的数据
              try {
                ThoughtStorage.saveThoughts(updatedThoughts)
                setLastSaved(new Date())
              } catch (error) {
                console.error('保存AI分析结果失败:', error)
              }
              
              return updatedThoughts
            })
          })
          .catch(error => {
            console.error('AI分析失败:', error)
            // 为失败的想法添加基础分析
            setThoughts(prevThoughts => {
              const updatedThoughts = prevThoughts.map(thought => {
                if (thought.id === newThought.id && !thought.aiAnalysis) {
                  return {
                    ...thought,
                    aiAnalysis: {
                      sentiment: 'neutral' as const,
                      themes: ['思考'],
                      connections: [],
                      insights: ['AI分析失败，可稍后重试'],
                      pattern: {
                        type: 'reflective' as const,
                        frequency: 1,
                        recentTrend: 'stable' as const,
                        recommendations: ['继续记录你的想法']
                      }
                    }
                  }
                }
                return thought
              })
              
              try {
                ThoughtStorage.saveThoughts(updatedThoughts)
                setLastSaved(new Date())
              } catch (error) {
                console.error('保存失败分析结果失败:', error)
              }
              
              return updatedThoughts
            })
          })
      }
    } else {
      // 未配置AI时使用本地分析
      newThought.aiAnalysis = {
        sentiment: 'neutral' as const,
        themes: ['思考'],
        connections: [],
        insights: ['点击设置配置AI分析'],
        pattern: {
          type: 'reflective' as const,
          frequency: 1,
          recentTrend: 'stable' as const,
          recommendations: ['配置AI后可获得智能分析']
        }
      }
    }

    const updatedThoughts = [newThought, ...thoughts]
    setThoughts(updatedThoughts)
    
    // 自动保存到本地存储
    try {
      ThoughtStorage.saveThoughts(updatedThoughts)
      setLastSaved(new Date())
    } catch (error) {
      console.error('自动保存失败:', error)
      // 可以在这里添加用户提示
    }
    
    setCurrentThought('')
    setIsCapturing(false)
    
    // Brief haptic feedback simulation
    setTimeout(() => setIsCapturing(true), 50)
    setTimeout(() => setIsCapturing(false), 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleCapture()
    }
  }

  const handleAIConfig = (config: any) => {
    try {
      localStorage.setItem('thinkmate-ai-config', JSON.stringify(config))
      createAIService({
        primary: config,
        enablePersonalization: true,
        cacheResults: true
      })
      setAIConfigured(true)
      console.log('AI配置已保存:', config.provider)
    } catch (error) {
      console.error('AI配置保存失败:', error)
    }
  }

  const handleSearchResults = (results: Thought[]) => {
    setSearchResults(results)
  }

  const handleClearSearch = () => {
    setSearchResults(null)
  }

  const handleViewChange = (view: 'capture' | 'search' | 'insights' | 'patterns' | 'daily' | 'connections' | 'upload' | 'knowledge' | 'graph' | 'mcp') => {
    setCurrentView(view)
    if (view !== 'search') {
      setSearchResults(null)
    }
  }

  // 处理文件上传
  const handleFileProcessed = async (file: MediaFile, segments: ContentSegment[]) => {
    try {
      // 更新媒体文件列表
      setMediaFiles(prev => [...prev, file])
      
      // 为每个片段创建想法
      for (const segment of segments) {
        const newThought: Thought = {
          id: Date.now().toString() + Math.random(),
          content: segment.content,
          timestamp: new Date(),
          tags: [segment.type],
          category: segment.type
        }

        // AI分析新想法
        if (aiConfigured) {
          const aiService = getAIService()
          if (aiService) {
            try {
              const analysis = await aiService.analyzeThought(newThought, thoughts)
              ;(newThought as any).aiAnalysis = analysis
            } catch (error) {
              console.error('AI分析失败:', error)
            }
          }
        }

        // 添加到思想列表
        setThoughts(prev => [newThought, ...prev])
      }

      // 自动切换到捕获视图查看新添加的内容
      setCurrentView('capture')
    } catch (error) {
      console.error('处理上传文件失败:', error)
    }
  }

  // 处理上传错误
  const handleUploadError = (error: string) => {
    console.error('文件上传错误:', error)
    // 这里可以添加用户通知
  }

  // 处理知识库项选择
  const handleKnowledgeItemSelect = (item: KnowledgeItem) => {
    setSelectedKnowledgeItem(item.id)
    // 自动建立与当前选中思想的连接
    if (selectedThoughtId) {
      knowledgeService.linkThoughtToKnowledge(
        selectedThoughtId,
        item.id,
        'inspired_by',
        '手动关联'
      )
    }
  }

  // 自动关联思想和知识库
  const handleAutoLink = async () => {
    try {
      const newLinks = await knowledgeService.autoLinkThoughts(thoughts)
      console.log(`自动创建了 ${newLinks.length} 个关联`)
    } catch (error) {
      console.error('自动关联失败:', error)
    }
  }

  // 获取要显示的想法列表
  const getDisplayedThoughts = (): Thought[] => {
    if (currentView === 'search' && searchResults) {
      return searchResults
    }
    return thoughts
  }

  // 清除输入
  const clearCurrentInput = () => {
    setCurrentThought('')
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // 导出数据
  const exportData = () => {
    try {
      const exportData = ThoughtStorage.exportThoughts(thoughts)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `thinkmate-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  // 想法管理功能
  const handleEditThought = (id: string, newContent: string) => {
    setThoughts(prevThoughts => {
      const updatedThoughts = prevThoughts.map(thought => 
        thought.id === id 
          ? { ...thought, content: newContent, lastModified: new Date() }
          : thought
      )
      ThoughtStorage.saveThoughts(updatedThoughts)
      return updatedThoughts
    })
  }

  const handleDeleteThought = (id: string) => {
    setThoughts(prevThoughts => {
      const updatedThoughts = prevThoughts.filter(thought => thought.id !== id)
      ThoughtStorage.saveThoughts(updatedThoughts)
      return updatedThoughts
    })
    
    // 删除相关连接
    setConnections(prevConnections => 
      prevConnections.filter(conn => 
        conn.fromThoughtId !== id && conn.toThoughtId !== id
      )
    )
  }

  const handleToggleFavorite = (id: string) => {
    setThoughts(prevThoughts => {
      const updatedThoughts = prevThoughts.map(thought => 
        thought.id === id 
          ? { ...thought, isFavorite: !thought.isFavorite }
          : thought
      )
      ThoughtStorage.saveThoughts(updatedThoughts)
      return updatedThoughts
    })
  }

  const handleUpdateTags = (id: string, tags: string[]) => {
    setThoughts(prevThoughts => {
      const updatedThoughts = prevThoughts.map(thought => 
        thought.id === id 
          ? { ...thought, tags, lastModified: new Date() }
          : thought
      )
      ThoughtStorage.saveThoughts(updatedThoughts)
      return updatedThoughts
    })
  }

  // 连接管理
  const handleAddConnection = (connection: Omit<Connection, 'id' | 'createdAt'>) => {
    const newConnection: Connection = {
      ...connection,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setConnections(prev => [...prev, newConnection])
  }

  const handleRemoveConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  const handleSelectThought = (thoughtId: string) => {
    setSelectedThoughtId(thoughtId)
    if (currentView !== 'connections') {
      setCurrentView('connections')
    }
  }

  // 键盘快捷键
  useKeyboardShortcuts({
    capture: () => handleViewChange('capture'),
    search: () => handleViewChange('search'),
    insights: () => handleViewChange('insights'),
    patterns: () => handleViewChange('patterns'),
    settings: () => setShowAIConfig(true),
    focusCapture: () => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    },
    clearCapture: clearCurrentInput,
    export: exportData
  })

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Enhanced Sidebar */}
        <EnhancedSidebar
          currentView={currentView}
          onViewChange={(view: string) => handleViewChange(view as any)}
          thoughtsCount={thoughts.length}
          aiConfigured={aiConfigured}
          lastSaved={lastSaved}
          onShowAIConfig={() => setShowSettings(true)}
          onLanguageChange={() => changeLanguage(currentLanguage === 'zh' ? 'en' : 'zh')}
          currentLanguage={currentLanguage}
          onExport={exportData}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header 
            className="border-b border-border p-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {currentView === 'capture' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">{t('captureTitle')}</h2>
                <p className="text-muted-foreground">{t('captureSubtitle')}</p>
              </>
            )}
            {currentView === 'search' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">搜索想法</h2>
                <p className="text-muted-foreground">快速查找和筛选你的想法记录</p>
              </>
            )}
            {currentView === 'insights' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">智能洞察</h2>
                <p className="text-muted-foreground">基于AI分析的思维模式和趋势</p>
              </>
            )}
            {currentView === 'patterns' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">思维模式</h2>
                <p className="text-muted-foreground">深度分析你的思维习惯和变化</p>
              </>
            )}
            {currentView === 'daily' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">每日总结</h2>
                <p className="text-muted-foreground">回顾每日思维活动和成长轨迹</p>
              </>
            )}
            {currentView === 'connections' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">思维连接</h2>
                <p className="text-muted-foreground">探索想法之间的关系和联系</p>
              </>
            )}
            {currentView === 'upload' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">文件上传</h2>
                <p className="text-muted-foreground">上传图片、音频、文档，AI自动提取和分析内容</p>
              </>
            )}
            {currentView === 'knowledge' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">知识库</h2>
                <p className="text-muted-foreground">管理你的学习资源，建立知识体系</p>
              </>
            )}
            {currentView === 'graph' && (
              <>
                <h2 className="text-2xl font-semibold mb-1">知识图谱</h2>
                <p className="text-muted-foreground">可视化思想与知识的关联网络</p>
              </>
            )}
          </motion.header>

          {/* Main Content Area */}
          <motion.div 
            className="p-6 flex-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* Search View */}
            {currentView === 'search' && (
              <div className="max-w-4xl mx-auto">
                <SearchBar
                  thoughts={thoughts}
                  onSearchResults={handleSearchResults}
                  onClearSearch={handleClearSearch}
                />
              </div>
            )}

            {/* Capture View */}
            {currentView === 'capture' && (
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={currentThought}
                    onChange={(e) => setCurrentThought(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('placeholder')}
                    className={cn(
                      "w-full min-h-[120px] p-4 bg-input border border-border rounded-lg",
                      "resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      "text-base leading-relaxed placeholder:text-muted-foreground",
                      "transition-all duration-200",
                      isCapturing && "bg-primary/5 border-primary/30"
                    )}
                  />
                  
                  {/* Capture Button */}
                  <motion.button
                    onClick={handleCapture}
                    disabled={!currentThought.trim()}
                    className={cn(
                      "absolute bottom-4 right-4 px-4 py-2 rounded-md font-medium",
                      "bg-primary hover:bg-primary-hover text-white",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('captureButton')}
                  </motion.button>
                </div>

                {/* AI实时分析建议 */}
                <AnimatePresence>
                  {liveAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-md"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-foreground space-y-2">
                          <div className="font-medium">AI实时分析:</div>
                          
                          {/* 思维模式提示 */}
                          {liveAnalysis.pattern && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">检测到:</span>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                liveAnalysis.sentiment === 'positive' ? "bg-green-500/20 text-green-400" :
                                liveAnalysis.sentiment === 'negative' ? "bg-red-500/20 text-red-400" :
                                "bg-blue-500/20 text-blue-400"
                              )}>
                                {liveAnalysis.pattern.type === 'creative' ? '💡 创意思维' :
                                 liveAnalysis.pattern.type === 'analytical' ? '🔍 分析思维' :
                                 liveAnalysis.pattern.type === 'problemSolving' ? '⚡ 问题解决' :
                                 liveAnalysis.pattern.type === 'reflective' ? '🪞 深度反思' :
                                 liveAnalysis.pattern.type === 'planning' ? '📋 规划思维' : '💭 思考模式'}
                              </span>
                            </div>
                          )}
                          
                          {/* 主题预测 */}
                          {liveAnalysis.themes.length > 0 && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">建议标签: </span>
                              {liveAnalysis.themes.slice(0, 2).join('、')}
                            </div>
                          )}
                          
                          {/* 实时洞察 */}
                          {liveAnalysis.insights.length > 0 && (
                            <div className="text-muted-foreground">
                              {liveAnalysis.insights[0]}
                            </div>
                          )}
                          
                          {/* 思维建议 */}
                          {liveAnalysis.pattern?.recommendations.length > 0 && (
                            <div className="text-muted-foreground">
                              <span className="font-medium">建议: </span>
                              {liveAnalysis.pattern.recommendations[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 整体思维洞察 */}
                {overallAnalysis && (
                  <div className="mt-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-lg p-4 mb-6"
                    >
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        思维洞察总览
                      </h3>
                      
                      {/* 思维死胡同警告 */}
                      {overallAnalysis.deadEndWarnings.length > 0 && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                          <div className="text-sm text-red-400 font-medium mb-2">⚠️ 思维模式警告</div>
                          {overallAnalysis.deadEndWarnings.map((warning: string, index: number) => (
                            <div key={index} className="text-sm text-red-300 mb-1">
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* 主导思维模式 */}
                      {overallAnalysis.dominantPatterns.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2">主导思维模式:</div>
                          <div className="flex flex-wrap gap-2">
                            {overallAnalysis.dominantPatterns.slice(0, 3).map((pattern: any, index: number) => (
                              <span key={index} className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                                {pattern.type === 'creative' ? '💡 创意型' :
                                 pattern.type === 'analytical' ? '🔍 分析型' :
                                 pattern.type === 'problemSolving' ? '⚡ 解决问题' :
                                 pattern.type === 'reflective' ? '🪞 反思型' :
                                 pattern.type === 'planning' ? '📋 规划型' : '💭 思考'} ({pattern.frequency})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 整体洞察 */}
                      {overallAnalysis.insights.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">智能洞察:</div>
                          <div className="space-y-1">
                            {overallAnalysis.insights.map((insight: string, index: number) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                {insight}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>
            )}

            {/* Insights View */}
            {currentView === 'insights' && (
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 思维活跃度 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-500" />
                      思维活跃度
                    </h3>
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      {thoughts.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      总想法数量
                    </p>
                  </motion.div>

                  {/* 情感分析 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-500" />
                      情感倾向
                    </h3>
                    <div className="space-y-2">
                      {(() => {
                        const sentiments = thoughts
                          .filter(t => t.aiAnalysis?.sentiment)
                          .map(t => t.aiAnalysis!.sentiment)
                        
                        const positive = sentiments.filter(s => s === 'positive').length
                        const neutral = sentiments.filter(s => s === 'neutral').length
                        const negative = sentiments.filter(s => s === 'negative').length
                        const total = sentiments.length || 1

                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">积极 😊</span>
                              <span className="text-green-500 font-medium">
                                {Math.round((positive / total) * 100)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">中性 😐</span>
                              <span className="text-blue-500 font-medium">
                                {Math.round((neutral / total) * 100)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">消极 😔</span>
                              <span className="text-red-500 font-medium">
                                {Math.round((negative / total) * 100)}%
                              </span>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </motion.div>

                  {/* 主要主题 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      热门主题
                    </h3>
                    <div className="space-y-2">
                      {(() => {
                        const allTags = thoughts.flatMap(t => t.tags || [])
                        const tagCount = allTags.reduce((acc, tag) => {
                          acc[tag] = (acc[tag] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                        
                        return Object.entries(tagCount)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([tag, count]) => (
                            <div key={tag} className="flex justify-between items-center">
                              <span className="text-sm">{tag}</span>
                              <span className="text-purple-500 font-medium">{count}</span>
                            </div>
                          ))
                      })()}
                    </div>
                  </motion.div>
                </div>

                {/* 整体分析 */}
                {overallAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 bg-card border border-border rounded-lg p-6"
                  >
                    <h3 className="text-lg font-medium mb-4">深度洞察</h3>
                    {overallAnalysis.insights.map((insight: string, index: number) => (
                      <div key={index} className="mb-3 p-3 bg-accent/10 rounded-md">
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {/* Patterns View */}
            {currentView === 'patterns' && (
              <div className="max-w-4xl mx-auto">
                {overallAnalysis?.dominantPatterns && overallAnalysis.dominantPatterns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {overallAnalysis.dominantPatterns.map((pattern: any, index: number) => (
                      <motion.div
                        key={pattern.type}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card border border-border rounded-lg p-6"
                      >
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <span className="text-2xl">
                            {pattern.type === 'creative' ? '💡' :
                             pattern.type === 'analytical' ? '🔍' :
                             pattern.type === 'problemSolving' ? '⚡' :
                             pattern.type === 'reflective' ? '🪞' :
                             pattern.type === 'planning' ? '📋' : '💭'}
                          </span>
                          {pattern.type === 'creative' ? '创意思维' :
                           pattern.type === 'analytical' ? '分析思维' :
                           pattern.type === 'problemSolving' ? '解决问题' :
                           pattern.type === 'reflective' ? '反思思维' :
                           pattern.type === 'planning' ? '规划思维' : '一般思维'}
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">频率</span>
                            <span className="font-medium">{pattern.frequency} 次</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">趋势</span>
                            <span className="font-medium text-blue-500">
                              {pattern.recentTrend === 'stable' ? '稳定' :
                               pattern.recentTrend === 'increasing' ? '上升' : '下降'}
                            </span>
                          </div>
                          
                          {pattern.recommendations && pattern.recommendations.length > 0 && (
                            <div className="mt-4 p-3 bg-accent/10 rounded-md">
                              <div className="text-xs font-medium mb-2">建议</div>
                              <div className="text-xs text-muted-foreground">
                                {pattern.recommendations[0]}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">还没有足够的数据</h3>
                    <p className="text-muted-foreground">继续记录想法，我们将分析你的思维模式</p>
                  </div>
                )}
              </div>
            )}

            {/* Daily Summary View */}
            {currentView === 'daily' && (
              <DailySummary thoughts={thoughts} />
            )}

            {/* Connections View */}
            {currentView === 'connections' && (
              <div className="max-w-6xl mx-auto">
                <ThoughtConnections
                  thoughts={thoughts}
                  connections={connections}
                  onAddConnection={handleAddConnection}
                  onRemoveConnection={handleRemoveConnection}
                  selectedThoughtId={selectedThoughtId}
                />
              </div>
            )}

            {/* File Upload View */}
            {currentView === 'upload' && (
              <div className="max-w-4xl mx-auto">
                <FileUpload
                  onFileProcessed={handleFileProcessed}
                  onError={handleUploadError}
                  maxFiles={5}
                />
                
                {/* 已上传文件列表 */}
                {mediaFiles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">已上传文件 ({mediaFiles.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mediaFiles.map((file) => (
                        <div key={file.id} className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {file.type} • {(file.size / 1024 / 1024).toFixed(1)} MB
                          </div>
                          {file.extractedContent && (
                            <div className="text-xs text-muted-foreground line-clamp-3">
                              {file.extractedContent.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Knowledge Base View */}
            {currentView === 'knowledge' && (
              <div className="max-w-7xl mx-auto">
                <KnowledgeBase
                  onItemSelect={handleKnowledgeItemSelect}
                  selectedItemId={selectedKnowledgeItem}
                />
                
                {/* 快速操作 */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleAutoLink}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    自动关联思想和知识库
                  </button>
                </div>
              </div>
            )}

            {/* Knowledge Graph View */}
            {currentView === 'graph' && (
              <div className="h-[calc(100vh-200px)]">
                <KnowledgeGraph
                  thoughts={enhancedThoughts}
                  knowledgeItems={knowledgeItems}
                  onNodeClick={(node) => {
                    if ('content' in node) {
                      setSelectedThoughtId((node as any).id)
                    } else {
                      setSelectedKnowledgeItem((node as any).id)
                    }
                  }}
                />
              </div>
            )}

            {/* MCP Integration View */}
            {currentView === 'mcp' && (
              <div className="max-w-6xl mx-auto">
                <MCPIntegration
                  onToolSelect={(tool) => {
                    console.log('Selected MCP tool:', tool)
                  }}
                  onResourceSelect={(resource) => {
                    console.log('Selected MCP resource:', resource)
                  }}
                />
              </div>
            )}

            {/* Thoughts List - Shared across search and capture views */}
            {(currentView === 'capture' || currentView === 'search') && (
              <div className={cn("mx-auto mt-12", currentView === 'search' ? "max-w-4xl" : "max-w-2xl")}>
                <h3 className="text-lg font-medium mb-4">
                  {currentView === 'search' && searchResults 
                    ? `搜索结果 (${searchResults.length} 条)` 
                    : t('recentThoughts')
                  }
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {getDisplayedThoughts().slice(0, currentView === 'search' ? 20 : 5).map((thought) => (
                      <ThoughtCard
                        key={thought.id}
                        thought={thought}
                        onEdit={handleEditThought}
                        onDelete={handleDeleteThought}
                        onToggleFavorite={handleToggleFavorite}
                        onAddConnection={handleSelectThought}
                        onUpdateTags={handleUpdateTags}
                        isCompact={currentView === 'search'}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                
                {getDisplayedThoughts().length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {currentView === 'search' 
                        ? '没有找到匹配的想法' 
                        : t('emptyTitle')
                      }
                    </p>
                    <p className="text-sm mt-2">
                      {currentView === 'search' 
                        ? '尝试调整搜索条件或筛选器' 
                        : t('emptySubtitle')
                      }
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* AI配置模态框 */}
      <AIConfigModal
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
        onSave={handleAIConfig}
        currentConfig={aiConfigured ? JSON.parse(localStorage.getItem('thinkmate-ai-config') || '{}') : undefined}
      />

      {/* 增强设置模态框 */}
      <EnhancedSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(config) => {
          // 处理设置保存
          console.log('设置已保存:', config)
          if (config.aiProvider && config.aiApiKey) {
            handleAIConfig({
              provider: config.aiProvider,
              apiKey: config.aiApiKey,
              model: config.aiModel || 'gpt-4',
              temperature: config.aiTemperature || 0.7,
              maxTokens: config.aiMaxTokens || 2000
            })
          }
        }}
        currentConfig={{
          ...JSON.parse(localStorage.getItem('thinkmate-settings') || '{}'),
          ...(aiConfigured ? JSON.parse(localStorage.getItem('thinkmate-ai-config') || '{}') : {})
        }}
      />
    </div>
    </ErrorBoundary>
  )
}

export default App