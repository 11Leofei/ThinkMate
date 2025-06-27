// 增强的设置界面 - 重新设计的设置面板
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Settings, Brain, Palette, Shield, 
  Zap, Save
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface EnhancedSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (config: any) => void
  currentConfig?: any
}

interface SettingsSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  items: SettingsItem[]
}

interface SettingsItem {
  id: string
  type: 'toggle' | 'select' | 'input' | 'range' | 'color' | 'button' | 'divider' | 'info'
  label?: string
  description?: string
  value?: any
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
  action?: () => void
  variant?: 'default' | 'danger' | 'success' | 'warning'
  disabled?: boolean
  isPro?: boolean
}

export const EnhancedSettingsModal: React.FC<EnhancedSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig = {}
}) => {
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState<Record<string, any>>({
    // 通用设置
    theme: 'auto',
    language: 'zh',
    compactMode: false,
    soundEnabled: true,
    notifications: true,
    autoSave: true,
    saveInterval: 30,
    
    // AI设置
    aiProvider: 'openai',
    aiModel: 'gpt-4',
    aiApiKey: '',
    aiTemperature: 0.7,
    aiMaxTokens: 2000,
    enableRealTimeAnalysis: true,
    analysisDelay: 500,
    
    // 隐私设置
    dataCollection: false,
    anonymousUsage: true,
    localStorageOnly: true,
    encryptData: false,
    
    // 界面设置
    sidebarWidth: 280,
    fontSize: 14,
    lineHeight: 1.6,
    showLineNumbers: false,
    showMinimap: false,
    enableAnimations: true,
    
    // 高级设置
    debugMode: false,
    experimentalFeatures: false,
    maxThoughts: 10000,
    compressionLevel: 'medium',
    backupFrequency: 'daily',
    
    ...currentConfig
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  // 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('thinkmate-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }
  }, [])

  // 检测变化
  useEffect(() => {
    const currentStr = JSON.stringify(currentConfig)
    const settingsStr = JSON.stringify(settings)
    setHasChanges(currentStr !== settingsStr)
  }, [settings, currentConfig])

  // 定义设置分组
  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      title: '通用设置',
      icon: Settings,
      description: '基础偏好和界面设置',
      items: [
        {
          id: 'theme',
          type: 'select',
          label: '主题模式',
          description: '选择应用的外观主题',
          value: settings.theme,
          options: [
            { label: '自动', value: 'auto' },
            { label: '浅色', value: 'light' },
            { label: '深色', value: 'dark' }
          ]
        },
        {
          id: 'language',
          type: 'select',
          label: '语言',
          description: '界面显示语言',
          value: settings.language,
          options: [
            { label: '中文', value: 'zh' },
            { label: 'English', value: 'en' }
          ]
        },
        {
          id: 'compactMode',
          type: 'toggle',
          label: '紧凑模式',
          description: '使用更紧凑的界面布局',
          value: settings.compactMode
        },
        {
          id: 'soundEnabled',
          type: 'toggle',
          label: '音效',
          description: '启用界面交互音效',
          value: settings.soundEnabled
        },
        {
          id: 'notifications',
          type: 'toggle',
          label: '通知',
          description: '启用系统通知',
          value: settings.notifications
        },
        { id: 'divider1', type: 'divider' },
        {
          id: 'autoSave',
          type: 'toggle',
          label: '自动保存',
          description: '定期自动保存数据',
          value: settings.autoSave
        },
        {
          id: 'saveInterval',
          type: 'range',
          label: '保存间隔 (秒)',
          description: '自动保存的时间间隔',
          value: settings.saveInterval,
          min: 10,
          max: 300,
          step: 10,
          disabled: !settings.autoSave
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI助手',
      icon: Brain,
      description: 'AI分析和智能功能设置',
      items: [
        {
          id: 'aiProvider',
          type: 'select',
          label: 'AI提供商',
          description: '选择AI服务提供商',
          value: settings.aiProvider,
          options: [
            { label: 'OpenAI', value: 'openai' },
            { label: 'Claude', value: 'claude' },
            { label: 'Gemini', value: 'gemini' },
            { label: '智谱GLM', value: 'zhipu' },
            { label: '通义千问', value: 'qwen' },
            { label: '文心一言', value: 'wenxin' },
            { label: '豆包', value: 'doubao' },
            { label: 'DeepSeek', value: 'deepseek' },
            { label: '月之暗面', value: 'moonshot' }
          ]
        },
        {
          id: 'aiApiKey',
          type: 'input',
          label: 'API密钥',
          description: '输入AI服务的API密钥',
          value: settings.aiApiKey
        },
        {
          id: 'aiTemperature',
          type: 'range',
          label: '创造性',
          description: '控制AI回答的创造性程度',
          value: settings.aiTemperature,
          min: 0,
          max: 1,
          step: 0.1
        },
        {
          id: 'aiMaxTokens',
          type: 'range',
          label: '最大长度',
          description: 'AI回答的最大字符数',
          value: settings.aiMaxTokens,
          min: 500,
          max: 4000,
          step: 100
        },
        { id: 'divider2', type: 'divider' },
        {
          id: 'enableRealTimeAnalysis',
          type: 'toggle',
          label: '实时分析',
          description: '在输入时提供实时AI分析',
          value: settings.enableRealTimeAnalysis
        },
        {
          id: 'analysisDelay',
          type: 'range',
          label: '分析延迟 (毫秒)',
          description: '实时分析的触发延迟',
          value: settings.analysisDelay,
          min: 100,
          max: 2000,
          step: 100,
          disabled: !settings.enableRealTimeAnalysis
        }
      ]
    },
    {
      id: 'privacy',
      title: '隐私安全',
      icon: Shield,
      description: '数据安全和隐私保护设置',
      items: [
        {
          id: 'localStorageOnly',
          type: 'toggle',
          label: '仅本地存储',
          description: '所有数据仅保存在本地设备',
          value: settings.localStorageOnly
        },
        {
          id: 'encryptData',
          type: 'toggle',
          label: '数据加密',
          description: '加密本地存储的数据',
          value: settings.encryptData,
          isPro: true
        },
        {
          id: 'dataCollection',
          type: 'toggle',
          label: '数据收集',
          description: '允许收集匿名使用数据',
          value: settings.dataCollection
        },
        {
          id: 'anonymousUsage',
          type: 'toggle',
          label: '匿名统计',
          description: '发送匿名使用统计信息',
          value: settings.anonymousUsage,
          disabled: !settings.dataCollection
        },
        { id: 'divider3', type: 'divider' },
        {
          id: 'clearData',
          type: 'button',
          label: '清除所有数据',
          description: '永久删除所有本地数据',
          variant: 'danger',
          action: () => handleClearData()
        },
        {
          id: 'exportData',
          type: 'button',
          label: '导出数据',
          description: '下载所有数据的备份',
          action: () => handleExportData()
        }
      ]
    },
    {
      id: 'interface',
      title: '界面外观',
      icon: Palette,
      description: '自定义界面外观和布局',
      items: [
        {
          id: 'sidebarWidth',
          type: 'range',
          label: '侧边栏宽度',
          description: '调整侧边栏的宽度',
          value: settings.sidebarWidth,
          min: 200,
          max: 400,
          step: 20
        },
        {
          id: 'fontSize',
          type: 'range',
          label: '字体大小',
          description: '调整文本字体大小',
          value: settings.fontSize,
          min: 12,
          max: 20,
          step: 1
        },
        {
          id: 'lineHeight',
          type: 'range',
          label: '行高',
          description: '调整文本行间距',
          value: settings.lineHeight,
          min: 1.2,
          max: 2.0,
          step: 0.1
        },
        { id: 'divider4', type: 'divider' },
        {
          id: 'enableAnimations',
          type: 'toggle',
          label: '动画效果',
          description: '启用界面动画和过渡效果',
          value: settings.enableAnimations
        },
        {
          id: 'showLineNumbers',
          type: 'toggle',
          label: '行号',
          description: '在编辑器中显示行号',
          value: settings.showLineNumbers
        },
        {
          id: 'showMinimap',
          type: 'toggle',
          label: '缩略图',
          description: '显示文档缩略图',
          value: settings.showMinimap,
          isPro: true
        }
      ]
    },
    {
      id: 'advanced',
      title: '高级设置',
      icon: Zap,
      description: '高级功能和实验性特性',
      items: [
        {
          id: 'debugMode',
          type: 'toggle',
          label: '调试模式',
          description: '启用开发者调试功能',
          value: settings.debugMode
        },
        {
          id: 'experimentalFeatures',
          type: 'toggle',
          label: '实验性功能',
          description: '启用实验性的新功能',
          value: settings.experimentalFeatures
        },
        {
          id: 'maxThoughts',
          type: 'range',
          label: '最大想法数',
          description: '系统保存的最大想法数量',
          value: settings.maxThoughts,
          min: 1000,
          max: 50000,
          step: 1000
        },
        {
          id: 'compressionLevel',
          type: 'select',
          label: '压缩级别',
          description: '数据压缩程度',
          value: settings.compressionLevel,
          options: [
            { label: '无压缩', value: 'none' },
            { label: '低', value: 'low' },
            { label: '中等', value: 'medium' },
            { label: '高', value: 'high' }
          ]
        },
        {
          id: 'backupFrequency',
          type: 'select',
          label: '备份频率',
          description: '自动备份的频率',
          value: settings.backupFrequency,
          options: [
            { label: '从不', value: 'never' },
            { label: '每日', value: 'daily' },
            { label: '每周', value: 'weekly' },
            { label: '每月', value: 'monthly' }
          ]
        },
        { id: 'divider5', type: 'divider' },
        {
          id: 'resetSettings',
          type: 'button',
          label: '重置设置',
          description: '恢复所有设置到默认值',
          variant: 'warning',
          action: () => handleResetSettings()
        }
      ]
    }
  ]

  const handleSettingChange = (id: string, value: any) => {
    setSettings(prev => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem('thinkmate-settings', JSON.stringify(settings))
      if (onSave) {
        onSave(settings)
      }
      setHasChanges(false)
      // 显示保存成功提示
      console.log('设置已保存')
    } catch (error) {
      console.error('保存设置失败:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可撤销。')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const handleExportData = () => {
    try {
      const data = {
        settings,
        thoughts: JSON.parse(localStorage.getItem('thinkmate-thoughts') || '[]'),
        knowledge: JSON.parse(localStorage.getItem('thinkmate-knowledge') || '[]'),
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `thinkmate-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出数据失败:', error)
    }
  }

  const handleResetSettings = () => {
    if (window.confirm('确定要重置所有设置吗？')) {
      localStorage.removeItem('thinkmate-settings')
      window.location.reload()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex overflow-hidden"
        >
          {/* 侧边栏 */}
          <div className="w-80 bg-muted/30 border-r border-border">
            {/* 头部 */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">设置</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 分组列表 */}
            <div className="p-4 space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                      isActive
                        ? "bg-primary text-white"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{section.title}</div>
                      <div className={cn(
                        "text-xs truncate",
                        isActive ? "text-white/70" : "text-muted-foreground"
                      )}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1 flex flex-col">
            {/* 当前分组头部 */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">
                    {settingsSections.find(s => s.id === activeSection)?.title}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {settingsSections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>
                
                {/* 保存按钮 */}
                {hasChanges && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? '保存中...' : '保存更改'}
                  </motion.button>
                )}
              </div>
            </div>

            {/* 设置项列表 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 max-w-2xl">
                {settingsSections
                  .find(s => s.id === activeSection)
                  ?.items.map((item) => (
                    <SettingsItemComponent
                      key={item.id}
                      item={item}
                      value={settings[item.id]}
                      onChange={(value) => handleSettingChange(item.id, value)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 设置项组件
interface SettingsItemComponentProps {
  item: SettingsItem
  value: any
  onChange: (value: any) => void
}

const SettingsItemComponent: React.FC<SettingsItemComponentProps> = ({
  item,
  value,
  onChange
}) => {
  if (item.type === 'divider') {
    return <div className="border-t border-border" />
  }

  if (item.type === 'info') {
    return (
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-400">{item.description}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {item.label && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{item.label}</label>
            {item.isPro && (
              <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-600 rounded">
                Pro
              </span>
            )}
          </div>
          
          {item.type === 'toggle' && (
            <button
              onClick={() => onChange(!value)}
              disabled={item.disabled}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                value ? "bg-primary" : "bg-muted",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                  value ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          )}
        </div>
      )}

      {item.description && (
        <p className="text-xs text-muted-foreground">{item.description}</p>
      )}

      {/* 控件渲染 */}
      {item.type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={item.disabled}
          className="w-full p-2 bg-background border border-border rounded-md"
        >
          {item.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {item.type === 'input' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={item.disabled}
          className="w-full p-2 bg-background border border-border rounded-md"
        />
      )}

      {item.type === 'range' && (
        <div className="space-y-2">
          <input
            type="range"
            min={item.min}
            max={item.max}
            step={item.step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={item.disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{item.min}</span>
            <span className="font-medium">{value}</span>
            <span>{item.max}</span>
          </div>
        </div>
      )}

      {item.type === 'button' && (
        <button
          onClick={item.action}
          disabled={item.disabled}
          className={cn(
            "px-4 py-2 rounded-lg transition-colors",
            item.variant === 'danger' && "bg-red-500 text-white hover:bg-red-600",
            item.variant === 'warning' && "bg-yellow-500 text-white hover:bg-yellow-600",
            item.variant === 'success' && "bg-green-500 text-white hover:bg-green-600",
            (!item.variant || item.variant === 'default') && "bg-primary text-white hover:bg-primary-hover"
          )}
        >
          {item.label}
        </button>
      )}
    </div>
  )
}