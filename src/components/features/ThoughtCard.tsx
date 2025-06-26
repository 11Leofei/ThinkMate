import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Edit3, 
  Trash2, 
  Star, 
  StarOff, 
  Link2, 
  Calendar,
  Tag,
  MoreHorizontal,
  X,
  Copy,
  Download,
  Share2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Thought } from '@/types'
import { formatRelativeTime } from '@/lib/timeFormat'

interface ThoughtCardProps {
  thought: Thought
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onAddConnection: (id: string) => void
  onUpdateTags: (id: string, tags: string[]) => void
  showConnections?: boolean
  isCompact?: boolean
}

export function ThoughtCard({
  thought,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddConnection,
  onUpdateTags,
  showConnections = true,
  isCompact = false
}: ThoughtCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(thought.content)
  const [showMenu, setShowMenu] = useState(false)
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const editRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // 自动调整文本框高度
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus()
      editRef.current.style.height = 'auto'
      editRef.current.style.height = editRef.current.scrollHeight + 'px'
    }
  }, [isEditing])

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== thought.content) {
      onEdit(thought.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(thought.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !thought.tags?.includes(newTag.trim())) {
      const updatedTags = [...(thought.tags || []), newTag.trim()]
      onUpdateTags(thought.id, updatedTags)
      setNewTag('')
    }
    setIsAddingTag(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = thought.tags?.filter(tag => tag !== tagToRemove) || []
    onUpdateTags(thought.id, updatedTags)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(thought.content)
      // 可以添加toast通知
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const exportThought = () => {
    const exportData = {
      content: thought.content,
      timestamp: thought.timestamp.toISOString(),
      tags: thought.tags,
      category: thought.category,
      aiAnalysis: thought.aiAnalysis
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thought-${thought.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareThought = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ThinkMate 想法分享',
          text: thought.content,
          url: window.location.href
        })
      } catch (err) {
        console.error('分享失败:', err)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "group relative bg-card hover:bg-card-hover border border-border rounded-lg transition-all duration-200",
        isCompact ? "p-3" : "p-4",
        thought.isFavorite && "ring-2 ring-yellow-500/20",
        isEditing && "ring-2 ring-primary/50"
      )}
    >
      {/* 收藏标记 */}
      {thought.isFavorite && (
        <div className="absolute -top-2 -right-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <Star className="w-2 h-2 text-white fill-current" />
          </div>
        </div>
      )}

      {/* 主要内容区 */}
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={editRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-input border border-border rounded-md p-3 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="编辑你的想法..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-xs rounded-md disabled:opacity-50 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 想法内容 */}
            <p className={cn(
              "leading-relaxed",
              isCompact ? "text-sm" : "text-base"
            )}>
              {thought.content}
            </p>

            {/* AI分析结果 */}
            {thought.aiAnalysis && !isCompact && (
              <div className="space-y-2">
                {/* 思维模式 */}
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

                {/* AI洞察 */}
                {thought.aiAnalysis.insights && thought.aiAnalysis.insights.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium mb-1">AI洞察:</div>
                    {thought.aiAnalysis.insights.slice(0, 2).map((insight, index) => (
                      <div key={index} className="mb-1">
                        {insight}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 标签区域 */}
            <div className="flex flex-wrap gap-1 items-center">
              {thought.tags?.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group/tag px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full flex items-center gap-1 hover:bg-accent/30 transition-colors"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="opacity-0 group-hover/tag:opacity-100 hover:text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
              
              {isAddingTag ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag()
                      if (e.key === 'Escape') setIsAddingTag(false)
                    }}
                    onBlur={handleAddTag}
                    className="w-20 px-2 py-0.5 text-xs bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="标签"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingTag(true)}
                  className="px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary rounded-full transition-colors"
                >
                  + 标签
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部元信息和操作 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatRelativeTime(thought.timestamp)}</span>
          </div>
          {thought.category && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span className="px-2 py-0.5 bg-secondary rounded text-xs">
                {thought.category}
              </span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          {/* 快速操作 */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(thought.id)}
              className={cn(
                "p-1 rounded-md transition-colors",
                thought.isFavorite 
                  ? "text-yellow-500 hover:text-yellow-600" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={thought.isFavorite ? "取消收藏" : "收藏"}
            >
              {thought.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </button>
            
            {showConnections && (
              <button
                onClick={() => onAddConnection(thought.id)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                title="添加关联"
              >
                <Link2 className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              title="编辑"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* 更多操作菜单 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-8 w-40 bg-card border border-border rounded-lg shadow-lg z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        copyToClipboard()
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      复制内容
                    </button>
                    <button
                      onClick={() => {
                        shareThought()
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      分享想法
                    </button>
                    <button
                      onClick={() => {
                        exportThought()
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      导出想法
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        onDelete(thought.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除想法
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}