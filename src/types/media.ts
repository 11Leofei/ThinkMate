export interface MediaFile {
  id: string
  name: string
  type: 'image' | 'audio' | 'document' | 'video'
  mimeType: string
  size: number
  url: string // blob URL or base64
  uploadedAt: Date
  extractedContent?: string // AI提取的文本内容
  metadata?: MediaMetadata
}

export interface MediaMetadata {
  // 图片元数据
  dimensions?: {
    width: number
    height: number
  }
  // 音频元数据
  duration?: number
  // 文档元数据
  pageCount?: number
  language?: string
}

export interface MediaUploadConfig {
  maxFileSize: number // MB
  allowedTypes: string[]
  enableAIProcessing: boolean
  enableCloudStorage: boolean
}

export interface AIExtractionResult {
  content: string
  confidence: number
  language?: string
  processingTime: number
  segments?: ContentSegment[]
}

export interface ContentSegment {
  id: string
  content: string
  type: 'thought' | 'note' | 'idea' | 'question' | 'plan'
  confidence: number
  startIndex?: number
  endIndex?: number
  timestamp?: number // for audio
}

// 扩展现有的Thought接口
export interface EnhancedThought extends Thought {
  sourceFiles?: MediaFile[]
  extractionMethod?: 'manual' | 'ai-ocr' | 'ai-speech' | 'ai-document'
  sourceSegment?: ContentSegment
}