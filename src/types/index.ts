export interface Thought {
  id: string
  content: string
  timestamp: Date
  tags: string[]
  category?: string
  aiAnalysis?: ThoughtAnalysis
  isFavorite?: boolean
  connections?: string[] // IDs of connected thoughts
  lastModified?: Date
}

export interface ThoughtAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  themes: string[]
  connections: string[]
  insights: string[]
  pattern?: ThinkingPattern
}

export interface ThinkingPattern {
  type: 'creative' | 'analytical' | 'problemSolving' | 'reflective' | 'planning'
  frequency: number
  recentTrend: 'increasing' | 'decreasing' | 'stable'
  recommendations: string[]
}

export interface AIPersonality {
  name: string
  tone: 'supportive' | 'challenging' | 'neutral' | 'curious'
  interactionStyle: 'proactive' | 'reactive' | 'balanced'
  focusAreas: string[]
}

export interface DailyInsight {
  date: Date
  thoughtCount: number
  dominantPatterns: ThinkingPattern[]
  keyInsights: string[]
  recommendations: string[]
  mentalState: 'productive' | 'scattered' | 'focused' | 'blocked'
}

export interface CaptureMethod {
  type: 'text' | 'voice'
  quickCapture: boolean
  autoSave: boolean
}

export interface Connection {
  id: string
  fromThoughtId: string
  toThoughtId: string
  type: 'related' | 'opposite' | 'builds_on' | 'inspired_by' | 'question_answer'
  strength: number // 1-5
  description?: string
  createdAt: Date
}

export interface ThoughtTemplate {
  id: string
  name: string
  description: string
  prompt: string
  category: string
  icon: string
}

export interface ExportFormat {
  type: 'json' | 'markdown' | 'pdf' | 'csv'
  includeAnalysis: boolean
  includeMeta: boolean
  dateRange?: { start: Date; end: Date }
}

// Re-export all types from modules
export * from './media'
export * from './knowledge'
export * from './mcp'