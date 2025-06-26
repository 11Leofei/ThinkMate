import { useEffect, useRef } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

interface UseKeyboardShortcutsOptions {
  capture?: () => void
  search?: () => void
  insights?: () => void
  patterns?: () => void
  settings?: () => void
  focusCapture?: () => void
  clearCapture?: () => void
  export?: () => void
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef<KeyboardShortcut[]>([])

  useEffect(() => {
    shortcutsRef.current = [
      // 导航快捷键
      {
        key: '1',
        metaKey: true,
        action: options.capture || (() => {}),
        description: '切换到捕获页面'
      },
      {
        key: '2',
        metaKey: true,
        action: options.search || (() => {}),
        description: '切换到搜索页面'
      },
      {
        key: '3',
        metaKey: true,
        action: options.insights || (() => {}),
        description: '切换到洞察页面'
      },
      {
        key: '4',
        metaKey: true,
        action: options.patterns || (() => {}),
        description: '切换到模式页面'
      },
      {
        key: ',',
        metaKey: true,
        action: options.settings || (() => {}),
        description: '打开设置'
      },
      
      // 搜索快捷键
      {
        key: 'f',
        metaKey: true,
        action: () => {
          options.search?.()
          // 延迟聚焦搜索框
          setTimeout(() => {
            const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement
            searchInput?.focus()
          }, 100)
        },
        description: '快速搜索'
      },
      
      // 捕获快捷键
      {
        key: 'n',
        metaKey: true,
        action: () => {
          options.capture?.()
          options.focusCapture?.()
        },
        description: '新建想法'
      },
      {
        key: 'Escape',
        action: options.clearCapture || (() => {}),
        description: '清除当前输入'
      },
      
      // 数据操作
      {
        key: 'e',
        metaKey: true,
        shiftKey: true,
        action: options.export || (() => {}),
        description: '导出数据'
      },
      
      // 通用快捷键
      {
        key: '/',
        action: () => {
          // 显示快捷键帮助
          showShortcutsHelp()
        },
        description: '显示快捷键帮助'
      }
    ]
  }, [options])

  const showShortcutsHelp = () => {
    const helpModal = document.createElement('div')
    helpModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
    helpModal.onclick = () => helpModal.remove()
    
    helpModal.innerHTML = `
      <div class="bg-card border border-border rounded-lg p-6 max-w-md mx-4" onclick="event.stopPropagation()">
        <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          键盘快捷键
        </h3>
        <div class="space-y-2 text-sm">
          ${shortcutsRef.current.map(shortcut => {
            const keys = []
            if (shortcut.metaKey) keys.push('⌘')
            if (shortcut.ctrlKey) keys.push('Ctrl')
            if (shortcut.shiftKey) keys.push('⇧')
            if (shortcut.altKey) keys.push('⌥')
            keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase())
            
            return `
              <div class="flex justify-between items-center py-1">
                <span class="text-muted-foreground">${shortcut.description}</span>
                <kbd class="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  ${keys.join(' + ')}
                </kbd>
              </div>
            `
          }).join('')}
        </div>
        <div class="mt-4 pt-4 border-t border-border">
          <button 
            onclick="this.closest('.fixed').remove()"
            class="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(helpModal)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 忽略在输入框中的快捷键（除了一些特殊的）
      const target = event.target as HTMLElement
      const isInputFocused = target.tagName === 'INPUT' || 
                           target.tagName === 'TEXTAREA' || 
                           target.contentEditable === 'true'
      
      for (const shortcut of shortcutsRef.current) {
        const keyMatch = event.key === shortcut.key
        const metaMatch = !!shortcut.metaKey === !!event.metaKey
        const ctrlMatch = !!shortcut.ctrlKey === !!event.ctrlKey
        const shiftMatch = !!shortcut.shiftKey === !!event.shiftKey
        const altMatch = !!shortcut.altKey === !!event.altKey
        
        if (keyMatch && metaMatch && ctrlMatch && shiftMatch && altMatch) {
          // 允许某些快捷键在输入框中工作
          const allowInInput = shortcut.metaKey || shortcut.ctrlKey || shortcut.key === 'Escape'
          
          if (!isInputFocused || allowInInput) {
            event.preventDefault()
            shortcut.action()
            break
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    shortcuts: shortcutsRef.current,
    showHelp: showShortcutsHelp
  }
}