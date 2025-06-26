import { MediaFile, MediaUploadConfig, AIExtractionResult, ContentSegment } from '@/types'

export class MediaService {
  private config: MediaUploadConfig = {
    maxFileSize: 10, // 10MB
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    enableAIProcessing: true,
    enableCloudStorage: false
  }

  constructor(config?: Partial<MediaUploadConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  // 文件上传和处理
  async uploadFile(file: File): Promise<MediaFile> {
    // 验证文件
    this.validateFile(file)

    // 创建MediaFile对象
    const mediaFile: MediaFile = {
      id: this.generateId(),
      name: file.name,
      type: this.getFileType(file.type),
      mimeType: file.type,
      size: file.size,
      url: '', // 将在下面设置
      uploadedAt: new Date()
    }

    try {
      // 转换为可存储的格式
      if (this.shouldConvertToBase64(file)) {
        mediaFile.url = await this.fileToBase64(file)
      } else {
        mediaFile.url = URL.createObjectURL(file)
      }

      // 提取元数据
      mediaFile.metadata = await this.extractMetadata(file)

      // AI处理
      if (this.config.enableAIProcessing) {
        const extraction = await this.processWithAI(file, mediaFile.type)
        mediaFile.extractedContent = extraction.content
      }

      // 保存到本地存储
      this.saveMediaFile(mediaFile)

      return mediaFile
    } catch (error) {
      console.error('文件上传失败:', error)
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // AI内容提取
  private async processWithAI(file: File, type: MediaFile['type']): Promise<AIExtractionResult> {
    try {
      switch (type) {
        case 'image':
          return await this.extractTextFromImage(file)
        case 'audio':
          return await this.extractTextFromAudio(file)
        case 'document':
          return await this.extractTextFromDocument(file)
        default:
          throw new Error(`不支持的文件类型: ${type}`)
      }
    } catch (error) {
      console.error('AI处理失败:', error)
      return {
        content: '',
        confidence: 0,
        processingTime: 0,
        segments: []
      }
    }
  }

  // OCR文字识别
  private async extractTextFromImage(file: File): Promise<AIExtractionResult> {
    const startTime = Date.now()
    
    try {
      // 使用Web OCR API或者集成的OCR服务
      // 这里使用浏览器的OCR能力或调用外部API
      const result = await this.callOCRService(file)
      
      return {
        content: result.text,
        confidence: result.confidence,
        processingTime: Date.now() - startTime,
        segments: this.segmentContent(result.text)
      }
    } catch (error) {
      console.error('OCR处理失败:', error)
      return {
        content: '',
        confidence: 0,
        processingTime: Date.now() - startTime
      }
    }
  }

  // 语音转文字
  private async extractTextFromAudio(file: File): Promise<AIExtractionResult> {
    const startTime = Date.now()
    
    try {
      // 使用Web Speech API或外部语音识别服务
      const result = await this.callSpeechToTextService(file)
      
      return {
        content: result.text,
        confidence: result.confidence,
        processingTime: Date.now() - startTime,
        segments: this.segmentContent(result.text, result.timestamps)
      }
    } catch (error) {
      console.error('语音识别失败:', error)
      return {
        content: '',
        confidence: 0,
        processingTime: Date.now() - startTime
      }
    }
  }

  // 文档文本提取
  private async extractTextFromDocument(file: File): Promise<AIExtractionResult> {
    const startTime = Date.now()
    
    try {
      let text = ''
      
      if (file.type === 'application/pdf') {
        text = await this.extractTextFromPDF(file)
      } else if (file.type === 'text/plain') {
        text = await file.text()
      } else {
        throw new Error('不支持的文档格式')
      }
      
      return {
        content: text,
        confidence: 0.95,
        processingTime: Date.now() - startTime,
        segments: this.segmentContent(text)
      }
    } catch (error) {
      console.error('文档处理失败:', error)
      return {
        content: '',
        confidence: 0,
        processingTime: Date.now() - startTime
      }
    }
  }

  // 智能内容分割
  private segmentContent(text: string, timestamps?: number[]): ContentSegment[] {
    if (!text.trim()) return []

    // 基于标点符号和换行分割
    const sentences = text.split(/[。！？\n\r]+/).filter(s => s.trim().length > 10)
    
    return sentences.map((sentence, index) => ({
      id: `segment-${Date.now()}-${index}`,
      content: sentence.trim(),
      type: this.classifySegmentType(sentence.trim()),
      confidence: 0.8,
      startIndex: text.indexOf(sentence),
      endIndex: text.indexOf(sentence) + sentence.length,
      timestamp: timestamps?.[index]
    }))
  }

  // 分类内容片段类型
  private classifySegmentType(content: string): ContentSegment['type'] {
    const questionWords = ['什么', '为什么', '如何', '怎么', '?', '？']
    const planWords = ['计划', '安排', '准备', '将要', '打算']
    const ideaWords = ['想法', '创意', '灵感', '点子']
    
    if (questionWords.some(word => content.includes(word))) {
      return 'question'
    } else if (planWords.some(word => content.includes(word))) {
      return 'plan'
    } else if (ideaWords.some(word => content.includes(word))) {
      return 'idea'
    } else if (content.length > 100) {
      return 'note'
    } else {
      return 'thought'
    }
  }

  // 外部服务调用（模拟）
  private async callOCRService(file: File): Promise<{ text: string; confidence: number }> {
    // 这里应该调用真实的OCR服务，如Google Vision API, Azure OCR等
    // 目前返回模拟结果
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `[OCR提取] 这是从图片中识别的文字内容...`,
          confidence: 0.85
        })
      }, 2000)
    })
  }

  private async callSpeechToTextService(file: File): Promise<{ text: string; confidence: number; timestamps?: number[] }> {
    // 这里应该调用真实的语音识别服务
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `[语音识别] 这是从音频中识别的文字内容...`,
          confidence: 0.90,
          timestamps: [0, 5000, 10000] // 毫秒
        })
      }, 3000)
    })
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    // 这里应该使用PDF处理库，如pdf-parse
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('[PDF提取] 这是从PDF文档中提取的文本内容...')
      }, 1000)
    })
  }

  // 工具方法
  private validateFile(file: File): void {
    if (file.size > this.config.maxFileSize * 1024 * 1024) {
      throw new Error(`文件大小超过限制 (${this.config.maxFileSize}MB)`)
    }

    if (!this.config.allowedTypes.includes(file.type)) {
      throw new Error(`不支持的文件类型: ${file.type}`)
    }
  }

  private getFileType(mimeType: string): MediaFile['type'] {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.startsWith('video/')) return 'video'
    return 'document'
  }

  private shouldConvertToBase64(file: File): boolean {
    // 小于1MB的文件转换为base64存储
    return file.size < 1024 * 1024
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private async extractMetadata(file: File): Promise<any> {
    const metadata: any = {}

    if (file.type.startsWith('image/')) {
      // 获取图片尺寸
      const dimensions = await this.getImageDimensions(file)
      metadata.dimensions = dimensions
    }

    return metadata
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  private generateId(): string {
    return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 存储管理
  private saveMediaFile(mediaFile: MediaFile): void {
    try {
      const existingFiles = this.getStoredMediaFiles()
      existingFiles.push(mediaFile)
      localStorage.setItem('thinkmate-media-files', JSON.stringify(existingFiles))
    } catch (error) {
      console.error('保存媒体文件失败:', error)
    }
  }

  getStoredMediaFiles(): MediaFile[] {
    try {
      const stored = localStorage.getItem('thinkmate-media-files')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('读取媒体文件失败:', error)
      return []
    }
  }

  deleteMediaFile(fileId: string): void {
    try {
      const existingFiles = this.getStoredMediaFiles()
      const updatedFiles = existingFiles.filter(file => file.id !== fileId)
      localStorage.setItem('thinkmate-media-files', JSON.stringify(updatedFiles))
    } catch (error) {
      console.error('删除媒体文件失败:', error)
    }
  }
}

// 单例服务
let mediaServiceInstance: MediaService | null = null

export function getMediaService(): MediaService {
  if (!mediaServiceInstance) {
    mediaServiceInstance = new MediaService()
  }
  return mediaServiceInstance
}

export function createMediaService(config?: Partial<MediaUploadConfig>): MediaService {
  mediaServiceInstance = new MediaService(config)
  return mediaServiceInstance
}