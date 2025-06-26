import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Sparkles, Brain, Calendar, Settings, Globe } from 'lucide-react'
import { cn } from './lib/utils'
import { Thought } from './types'
import { useTranslation } from './hooks/useTranslation'
import { formatRelativeTime } from './lib/timeFormat'
import { AIThoughtAnalyzer } from './lib/aiAnalyzer'
import { translations } from './lib/i18n'

function App() {
  const { t, currentLanguage, changeLanguage } = useTranslation()
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [currentThought, setCurrentThought] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [liveAnalysis, setLiveAnalysis] = useState<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus the capture input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // 实时分析用户输入
  useEffect(() => {
    if (currentThought.length > 20) {
      const tempThought: Thought = {
        id: 'temp',
        content: currentThought,
        timestamp: new Date(),
        tags: [],
        category: ''
      }
      const analysis = AIThoughtAnalyzer.analyzeThought(tempThought)
      setLiveAnalysis(analysis)
    } else {
      setLiveAnalysis(null)
    }
  }, [currentThought])

  // 生成整体思维洞察
  const overallAnalysis = thoughts.length > 0 ? AIThoughtAnalyzer.analyzeThinkingPatterns(thoughts) : null

  const handleCapture = () => {
    if (!currentThought.trim()) return

    const newThought: Thought = {
      id: Date.now().toString(),
      content: currentThought.trim(),
      timestamp: new Date(),
      tags: [],
      category: t('general')
    }

    // AI分析
    const analysis = AIThoughtAnalyzer.analyzeThought(newThought)
    newThought.aiAnalysis = analysis
    
    // 根据AI分析更新分类
    if (analysis.pattern) {
      const patternTranslationKey = analysis.pattern.type as keyof typeof translations.zh
      newThought.category = t(patternTranslationKey) || t('general')
    }
    
    // 自动生成标签
    if (analysis.themes.length > 0) {
      newThought.tags = analysis.themes.slice(0, 3) // 最多3个标签
    }

    setThoughts(prev => [newThought, ...prev])
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.aside 
          className="w-64 bg-card border-r border-border p-6 flex flex-col"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-8">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold">{t('appName')}</h1>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem icon={PenTool} label={t('capture')} active />
            <NavItem icon={Sparkles} label={t('insights')} />
            <NavItem icon={Calendar} label={t('patterns')} />
            <NavItem icon={Settings} label={t('settings')} />
          </nav>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {thoughts.length} {t('thoughtsCount')}
            </div>
            <button
              onClick={() => changeLanguage(currentLanguage === 'zh' ? 'en' : 'zh')}
              className="p-1 rounded hover:bg-muted transition-colors"
              title="切换语言 / Switch Language"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header 
            className="border-b border-border p-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-2xl font-semibold mb-1">{t('captureTitle')}</h2>
            <p className="text-muted-foreground">{t('captureSubtitle')}</p>
          </motion.header>

          {/* Capture Area */}
          <motion.div 
            className="p-6 flex-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* Quick Capture Input */}
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
            </div>

            {/* 整体思维洞察 */}
            {overallAnalysis && (
              <div className="max-w-2xl mx-auto mt-8">
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
                      {overallAnalysis.deadEndWarnings.map((warning, index) => (
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
                        {overallAnalysis.dominantPatterns.slice(0, 3).map((pattern, index) => (
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
                        {overallAnalysis.insights.map((insight, index) => (
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

            {/* Recent Thoughts */}
            <div className="max-w-2xl mx-auto mt-12">
              <h3 className="text-lg font-medium mb-4">{t('recentThoughts')}</h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {thoughts.slice(0, 5).map((thought, index) => (
                    <motion.div
                      key={thought.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-card hover:bg-card-hover border border-border rounded-lg cursor-pointer transition-colors"
                    >
                      <p className="text-sm leading-relaxed mb-3">{thought.content}</p>
                      
                      {/* AI分析结果 */}
                      {thought.aiAnalysis && (
                        <div className="mb-3 space-y-2">
                          {/* 思维模式指示器 */}
                          {thought.aiAnalysis.pattern && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">思维模式:</span>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                thought.aiAnalysis.sentiment === 'positive' ? "bg-green-500/20 text-green-400" :
                                thought.aiAnalysis.sentiment === 'negative' ? "bg-red-500/20 text-red-400" :
                                "bg-blue-500/20 text-blue-400"
                              )}>
                                {thought.aiAnalysis.pattern.type === 'creative' ? '💡 创意型' :
                                 thought.aiAnalysis.pattern.type === 'analytical' ? '🔍 分析型' :
                                 thought.aiAnalysis.pattern.type === 'problemSolving' ? '⚡ 解决问题' :
                                 thought.aiAnalysis.pattern.type === 'reflective' ? '🪞 反思型' :
                                 thought.aiAnalysis.pattern.type === 'planning' ? '📋 规划型' : '💭 思考'}
                              </span>
                            </div>
                          )}
                          
                          {/* 主题标签 */}
                          {thought.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {thought.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* AI洞察 */}
                          {thought.aiAnalysis.insights.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <div className="font-medium mb-1">AI洞察:</div>
                              {thought.aiAnalysis.insights.slice(0, 2).map((insight, insightIndex) => (
                                <div key={insightIndex} className="mb-1">
                                  {insight}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatRelativeTime(thought.timestamp)}</span>
                        <div className="flex gap-1">
                          {thought.category && (
                            <span className="px-2 py-1 bg-secondary rounded text-xs">
                              {thought.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {thoughts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('emptyTitle')}</p>
                  <p className="text-sm mt-2">{t('emptySubtitle')}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
}

function NavItem({ icon: Icon, label, active = false }: NavItemProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
        active 
          ? "bg-primary text-white" 
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </motion.div>
  )
}

export default App