// 增强的侧边栏导航组件 - 重新设计的界面
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, PenTool, Search, Sparkles, Calendar, BarChart3, 
  Network, Upload, BookOpen, GitBranch, Server, Settings,
  Globe, ChevronDown, ChevronRight, User, Bell, Help,
  Moon, Sun, Palette, Database, Zap, Target, Shield,
  Activity, TrendingUp, Clock, Tag, Star, Archive,
  Filter, Download, Upload as UploadIcon, Share2,
  Layers, Eye, EyeOff, Volume2, VolumeX, Wifi, WifiOff
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatRelativeTime } from '../../lib/timeFormat'

interface EnhancedSidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  thoughtsCount: number
  aiConfigured: boolean
  lastSaved: Date | null
  onShowAIConfig: () => void
  onLanguageChange: () => void
  currentLanguage: string
  onExport: () => void
}

interface NavSection {
  id: string
  title: string
  items: NavItemData[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}

interface NavItemData {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  view?: string
  badge?: string | number
  hotkey?: string
  color?: string
  action?: () => void
  disabled?: boolean
  isNew?: boolean
  isPro?: boolean
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  currentView,
  onViewChange,
  thoughtsCount,
  aiConfigured,
  lastSaved,
  onShowAIConfig,
  onLanguageChange,
  currentLanguage,
  onExport
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [isCompactMode, setIsCompactMode] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // 读取用户偏好设置
  useEffect(() => {
    const savedPrefs = localStorage.getItem('thinkmate-sidebar-prefs')
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs)
        setIsCompactMode(prefs.compact || false)
        setShowAdvanced(prefs.advanced || false)
        setTheme(prefs.theme || 'auto')
        setNotifications(prefs.notifications !== false)
        setSoundEnabled(prefs.sound !== false)
        setCollapsedSections(new Set(prefs.collapsedSections || []))
      } catch (error) {
        console.error('加载用户偏好失败:', error)
      }
    }
  }, [])

  // 保存用户偏好设置
  const savePreferences = (updates: any) => {
    try {
      const currentPrefs = JSON.parse(localStorage.getItem('thinkmate-sidebar-prefs') || '{}')
      const newPrefs = { ...currentPrefs, ...updates }
      localStorage.setItem('thinkmate-sidebar-prefs', JSON.stringify(newPrefs))
    } catch (error) {
      console.error('保存用户偏好失败:', error)
    }
  }

  // 定义导航结构
  const navigationSections: NavSection[] = [
    {
      id: 'core',
      title: '核心功能',
      items: [
        {
          id: 'capture',
          icon: PenTool,
          label: '思想捕获',
          view: 'capture',
          hotkey: '⌘N',
          color: 'text-blue-500'
        },
        {
          id: 'search',
          icon: Search,
          label: '智能搜索',
          view: 'search',
          hotkey: '⌘F',
          color: 'text-green-500'
        },
        {
          id: 'insights',
          icon: Sparkles,
          label: 'AI洞察',
          view: 'insights',
          hotkey: '⌘I',
          color: 'text-purple-500',
          badge: aiConfigured ? '智能' : '未配置'
        }
      ]
    },
    {
      id: 'analysis',
      title: '分析工具',
      collapsible: true,
      items: [
        {
          id: 'patterns',
          icon: Calendar,
          label: '思维模式',
          view: 'patterns',
          color: 'text-orange-500'
        },
        {
          id: 'daily',
          icon: BarChart3,
          label: '每日总结',
          view: 'daily',
          color: 'text-cyan-500'
        },
        {
          id: 'connections',
          icon: Network,
          label: '思维连接',
          view: 'connections',
          color: 'text-pink-500'
        },
        {
          id: 'graph',
          icon: GitBranch,
          label: '知识图谱',
          view: 'graph',
          color: 'text-indigo-500',
          isNew: true
        }
      ]
    },
    {
      id: 'content',
      title: '内容管理',
      collapsible: true,
      items: [
        {
          id: 'upload',
          icon: Upload,
          label: '文件上传',
          view: 'upload',
          color: 'text-emerald-500'
        },
        {
          id: 'knowledge',
          icon: BookOpen,
          label: '知识库',
          view: 'knowledge',
          color: 'text-amber-500'
        },
        {
          id: 'tags',
          icon: Tag,
          label: '标签管理',
          view: 'tags',
          color: 'text-rose-500'
        },
        {
          id: 'favorites',
          icon: Star,
          label: '收藏夹',
          view: 'favorites',
          color: 'text-yellow-500'
        }
      ]
    },
    {
      id: 'advanced',
      title: '高级功能',
      collapsible: true,
      defaultCollapsed: !showAdvanced,
      items: [
        {
          id: 'mcp',
          icon: Server,
          label: 'MCP集成',
          view: 'mcp',
          color: 'text-slate-500',
          isPro: true
        },
        {
          id: 'automation',
          icon: Zap,
          label: '自动化',
          view: 'automation',
          color: 'text-violet-500',
          isPro: true
        },
        {
          id: 'analytics',
          icon: TrendingUp,
          label: '深度分析',
          view: 'analytics',
          color: 'text-teal-500',
          isPro: true
        }
      ]
    }
  ]

  const handleSectionToggle = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId)
    } else {
      newCollapsed.add(sectionId)
    }
    setCollapsedSections(newCollapsed)
    savePreferences({ collapsedSections: Array.from(newCollapsed) })
  }

  const handleNavItemClick = (item: NavItemData) => {
    if (item.disabled) return
    
    if (item.action) {
      item.action()
    } else if (item.view) {
      onViewChange(item.view)
    }
    
    // 播放点击音效（如果启用）
    if (soundEnabled) {
      // 这里可以添加音效播放逻辑
    }
  }

  const toggleCompactMode = () => {
    const newMode = !isCompactMode
    setIsCompactMode(newMode)
    savePreferences({ compact: newMode })
  }

  const toggleAdvanced = () => {
    const newAdvanced = !showAdvanced
    setShowAdvanced(newAdvanced)
    savePreferences({ advanced: newAdvanced })
    
    // 自动展开/折叠高级功能分组
    const newCollapsed = new Set(collapsedSections)
    if (newAdvanced) {
      newCollapsed.delete('advanced')
    } else {
      newCollapsed.add('advanced')
    }
    setCollapsedSections(newCollapsed)
    savePreferences({ collapsedSections: Array.from(newCollapsed) })
  }

  const getAIStatus = () => {
    if (!aiConfigured) {
      return { status: '未配置', color: 'text-yellow-500', icon: '⚠️' }
    }
    
    try {
      const config = JSON.parse(localStorage.getItem('thinkmate-ai-config') || '{}')
      return { 
        status: '已连接', 
        color: 'text-green-500', 
        icon: '✅',
        provider: config.provider?.toUpperCase(),
        model: config.model
      }
    } catch {
      return { status: '配置异常', color: 'text-red-500', icon: '❌' }
    }
  }

  const aiStatus = getAIStatus()

  return (
    <motion.aside 
      className={cn(
        "bg-card border-r border-border flex flex-col relative",
        isCompactMode ? "w-16" : "w-72"
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 头部 */}
      <div className={cn("p-4 border-b border-border", isCompactMode && "px-2")}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-primary" />
            {!isCompactMode && thoughtsCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center"
              >
                {thoughtsCount > 99 ? '99+' : thoughtsCount}
              </motion.div>
            )}
          </div>
          
          {!isCompactMode && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">ThinkMate</h1>
              <p className="text-xs text-muted-foreground">智能思维伙伴</p>
            </div>
          )}
          
          {/* 紧凑模式切换 */}
          <button
            onClick={toggleCompactMode}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            title={isCompactMode ? "展开侧边栏" : "紧凑模式"}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 主导航区域 */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {navigationSections.map((section) => {
            const isSectionCollapsed = collapsedSections.has(section.id)
            
            return (
              <div key={section.id}>
                {/* 分组标题 */}
                {!isCompactMode && section.collapsible && (
                  <button
                    onClick={() => handleSectionToggle(section.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>{section.title}</span>
                    {isSectionCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
                
                {!isCompactMode && !section.collapsible && (
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      {section.title}
                    </h3>
                  </div>
                )}

                {/* 导航项目 */}
                <AnimatePresence>
                  {(!isSectionCollapsed || isCompactMode) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1"
                    >
                      {section.items.map((item) => (
                        <NavItem
                          key={item.id}
                          item={item}
                          isActive={currentView === item.view}
                          isCompact={isCompactMode}
                          onClick={() => handleNavItemClick(item)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* 底部信息区域 */}
      <div className={cn("border-t border-border p-4 space-y-3", isCompactMode && "px-2")}>
        {/* AI状态 */}
        <div className={cn(isCompactMode && "flex justify-center")}>
          <button
            onClick={onShowAIConfig}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors w-full",
              isCompactMode && "w-auto"
            )}
            title={isCompactMode ? `AI: ${aiStatus.status}` : undefined}
          >
            <div className={cn("flex items-center gap-2", isCompactMode && "justify-center")}>
              <div className={cn("w-2 h-2 rounded-full", aiStatus.color)} />
              {!isCompactMode && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium">AI助手</span>
                    <span className="text-xs">{aiStatus.icon}</span>
                  </div>
                  {aiStatus.provider && (
                    <div className="text-xs text-muted-foreground truncate">
                      {aiStatus.provider} {aiStatus.model}
                    </div>
                  )}
                </div>
              )}
            </div>
          </button>
        </div>

        {/* 存储状态 */}
        {!isCompactMode && (
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>
                {lastSaved ? `已保存 ${formatRelativeTime(lastSaved)}` : '未保存'}
              </span>
            </div>
          </div>
        )}

        {/* 快速操作 */}
        <div className={cn("flex gap-1", isCompactMode ? "flex-col" : "flex-row")}>
          {/* 语言切换 */}
          <button
            onClick={onLanguageChange}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="切换语言"
          >
            <Globe className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* 设置 */}
          <button
            onClick={onShowAIConfig}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="设置"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* 导出 */}
          <button
            onClick={onExport}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="导出数据"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* 高级功能切换 */}
          {!isCompactMode && (
            <button
              onClick={toggleAdvanced}
              className={cn(
                "p-2 rounded-md transition-colors",
                showAdvanced ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}
              title="切换高级功能"
            >
              <Target className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 统计信息 */}
        {!isCompactMode && (
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>想法总数</span>
              <span className="font-medium">{thoughtsCount}</span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}

// 导航项组件
interface NavItemProps {
  item: NavItemData
  isActive: boolean
  isCompact: boolean
  onClick: () => void
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, isCompact, onClick }) => {
  const Icon = item.icon

  return (
    <motion.div
      className={cn(
        "mx-2 relative group",
        isCompact && "mx-1"
      )}
      whileHover={{ x: isCompact ? 0 : 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={onClick}
        disabled={item.disabled}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "text-left relative overflow-hidden",
          isActive 
            ? "bg-primary text-white shadow-lg" 
            : "hover:bg-muted text-muted-foreground hover:text-foreground",
          item.disabled && "opacity-50 cursor-not-allowed",
          isCompact && "justify-center px-2"
        )}
        title={isCompact ? item.label : undefined}
      >
        {/* 图标 */}
        <div className="relative">
          <Icon className={cn("w-4 h-4 flex-shrink-0", item.color && !isActive && item.color)} />
          
          {/* 新功能标识 */}
          {item.isNew && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
          )}
          
          {/* Pro标识 */}
          {item.isPro && !isCompact && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
          )}
        </div>

        {/* 标签和徽章 */}
        {!isCompact && (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{item.label}</span>
                
                {item.isPro && (
                  <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-600 rounded">
                    Pro
                  </span>
                )}
                
                {item.isNew && (
                  <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-600 rounded">
                    新
                  </span>
                )}
              </div>
              
              {/* 快捷键 */}
              {item.hotkey && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.hotkey}
                </div>
              )}
            </div>

            {/* 徽章 */}
            {item.badge && (
              <span className={cn(
                "px-2 py-1 text-xs rounded-full flex-shrink-0",
                typeof item.badge === 'number' 
                  ? "bg-primary text-white" 
                  : "bg-muted text-muted-foreground"
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}

        {/* 悬浮工具提示（紧凑模式） */}
        {isCompact && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {item.label}
            {item.hotkey && (
              <div className="text-muted-foreground">{item.hotkey}</div>
            )}
          </div>
        )}
      </button>
    </motion.div>
  )
}