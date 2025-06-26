export interface Thought {
  id: string
  content: string
  timestamp: Date
  tags: string[]
  category?: string
  aiAnalysis?: ThoughtAnalysis
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