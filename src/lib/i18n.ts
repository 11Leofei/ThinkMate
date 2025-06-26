export const translations = {
  zh: {
    // App name
    appName: 'ThinkMate',
    tagline: '你的AI思维伙伴',
    
    // Navigation
    capture: '记录',
    insights: '洞察',
    patterns: '模式',
    settings: '设置',
    
    // Capture page
    captureTitle: '记录你的想法',
    captureSubtitle: '此刻你在想什么？',
    placeholder: '开始输入你的想法...（⌘+回车保存）',
    captureButton: '记录',
    
    // Recent thoughts
    recentThoughts: '最近的想法',
    thoughtsCount: '条想法已记录',
    
    // Empty state
    emptyTitle: '你的想法将显示在这里',
    emptySubtitle: '在上方输入框开始记录你的第一个想法',
    
    // AI suggestions
    aiSuggests: 'AI建议添加：',
    aiTagSuggestion: '根据你的思维模式，可以考虑标记为"哲学"或"反思"',
    
    // Time formats
    justNow: '刚刚',
    minutesAgo: '分钟前',
    hoursAgo: '小时前',
    daysAgo: '天前',
    
    // Categories
    general: '日常',
    philosophy: '哲学',
    reflection: '反思',
    idea: '想法',
    learningCategory: '学习',
    
    // Insights
    dailyInsights: '今日洞察',
    thinkingPatterns: '思维模式',
    mentalState: '思维状态',
    recommendations: '建议',
    
    // Mental states
    productive: '高效',
    scattered: '分散',
    focused: '专注',
    blocked: '阻塞',
    
    // Pattern types
    creative: '创意型',
    analytical: '分析型',
    problemSolving: '解决问题',
    reflective: '反思型',
    planningPattern: '规划型',
    
    // AI Analysis
    thinkingPattern: '思维模式',
    aiInsights: 'AI洞察',
    suggestions: '建议',
  },
  
  en: {
    // App name
    appName: 'ThinkMate',
    tagline: 'Your AI Thinking Partner',
    
    // Navigation
    capture: 'Capture',
    insights: 'Insights',
    patterns: 'Patterns',
    settings: 'Settings',
    
    // Capture page
    captureTitle: 'Capture Your Thoughts',
    captureSubtitle: "What's on your mind right now?",
    placeholder: 'Start typing your thought... (⌘+Enter to save)',
    captureButton: 'Capture',
    
    // Recent thoughts
    recentThoughts: 'Recent Thoughts',
    thoughtsCount: 'thoughts captured',
    
    // Empty state
    emptyTitle: 'Your thoughts will appear here as you capture them',
    emptySubtitle: 'Start typing in the box above to begin',
    
    // AI suggestions
    aiSuggests: 'AI suggests adding:',
    aiTagSuggestion: 'Consider tagging this as "philosophy" or "reflection" based on your thinking pattern.',
    
    // Time formats
    justNow: 'just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago', 
    daysAgo: 'days ago',
    
    // Categories
    general: 'General',
    philosophy: 'Philosophy',
    reflection: 'Reflection',
    idea: 'Idea',
    learningCategory: 'Learning',
    
    // Insights
    dailyInsights: 'Daily Insights',
    thinkingPatterns: 'Thinking Patterns',
    mentalState: 'Mental State',
    recommendations: 'Recommendations',
    
    // Mental states
    productive: 'Productive',
    scattered: 'Scattered',
    focused: 'Focused',
    blocked: 'Blocked',
    
    // Pattern types
    creative: 'Creative',
    analytical: 'Analytical',
    problemSolving: 'Problem Solving',
    reflective: 'Reflective',
    planningPattern: 'Planning',
    
    // AI Analysis
    thinkingPattern: 'Thinking Pattern',
    aiInsights: 'AI Insights',
    suggestions: 'Suggestions',
  }
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.zh


export function setLanguage(lang: Language) {
  localStorage.setItem('thinkmate-language', lang)
}

export function getCurrentLanguage(): Language {
  const saved = localStorage.getItem('thinkmate-language') as Language
  return saved || 'zh'
}

export function t(key: TranslationKey): string {
  const lang = getCurrentLanguage()
  return translations[lang][key] || translations.zh[key] || key
}

// 初始化语言
// 语言设置通过localStorage管理，无需全局变量