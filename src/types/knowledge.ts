export interface KnowledgeItem {
  id: string
  title: string
  type: 'book' | 'article' | 'paper' | 'note' | 'course' | 'podcast' | 'video'
  content?: string
  description?: string
  author?: string
  publishDate?: Date
  tags: string[]
  category: string
  source?: string // URL, file path, etc.
  status: 'reading' | 'completed' | 'paused' | 'planned'
  progress?: number // 0-100
  addedAt: Date
  lastAccessedAt?: Date
  metadata?: KnowledgeMetadata
  aiSummary?: KnowledgeSummary
}

export interface KnowledgeMetadata {
  isbn?: string
  doi?: string
  pageCount?: number
  wordCount?: number
  readingTime?: number // minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  language?: string
}

export interface KnowledgeSummary {
  keyPoints: string[]
  mainTopics: string[]
  insights: string[]
  quotes: string[]
  connections: string[] // 与其他知识项的关联
  generatedAt: Date
}

export interface KnowledgeConnection {
  id: string
  fromKnowledgeId: string
  toKnowledgeId: string
  type: 'cites' | 'contradicts' | 'builds_on' | 'relates_to' | 'inspired_by'
  strength: number // 1-5
  description?: string
  notes?: string
  createdAt: Date
}

export interface ThoughtKnowledgeLink {
  id: string
  thoughtId: string
  knowledgeId: string
  type: 'inspired_by' | 'questions' | 'applies' | 'contradicts' | 'extends'
  relevanceScore: number // 0-1
  description?: string
  specificPage?: number
  specificQuote?: string
  createdAt: Date
  aiGenerated: boolean
}

export interface KnowledgeGraph {
  nodes: (KnowledgeItem | any)[]
  edges: (KnowledgeConnection | ThoughtKnowledgeLink)[]
  clusters?: KnowledgeCluster[]
}

export interface KnowledgeCluster {
  id: string
  name: string
  description: string
  items: string[] // IDs of knowledge items or thoughts
  centerPoint?: { x: number; y: number }
  color: string
}

export interface KnowledgeInsight {
  id: string
  type: 'pattern' | 'gap' | 'opportunity' | 'trend'
  title: string
  description: string
  involvedItems: string[]
  confidence: number
  generatedAt: Date
}