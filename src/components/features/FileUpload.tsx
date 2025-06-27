import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, Image, Mic, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaFile, ContentSegment } from '@/types'
import { getMediaService } from '@/lib/mediaService'

interface FileUploadProps {
  onFileProcessed: (file: MediaFile, segments: ContentSegment[]) => void
  onError: (error: string) => void
  className?: string
  maxFiles?: number
}

interface UploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  result?: MediaFile
  error?: string
  segments?: ContentSegment[]
}

export function FileUpload({ 
  onFileProcessed, 
  onError, 
  className,
  maxFiles = 5 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaService = getMediaService()

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles)
    
    for (const file of fileArray) {
      // const uploadId = Date.now() + Math.random()
      const initialProgress: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading'
      }
      
      setUploads(prev => [...prev, initialProgress])
      
      try {
        // 模拟上传进度
        for (let i = 10; i <= 50; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200))
          setUploads(prev => prev.map(upload => 
            upload.file === file ? { ...upload, progress: i } : upload
          ))
        }
        
        // 切换到处理状态
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { ...upload, status: 'processing', progress: 60 } 
            : upload
        ))
        
        // 处理文件
        const result = await mediaService.uploadFile(file)
        
        // 生成内容片段
        const segments = result.extractedContent 
          ? await generateSegments(result.extractedContent)
          : []
        
        // 完成上传
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { 
                ...upload, 
                status: 'completed', 
                progress: 100,
                result,
                segments
              } 
            : upload
        ))
        
        // 通知父组件
        onFileProcessed(result, segments)
        
      } catch (error) {
        setUploads(prev => prev.map(upload => 
          upload.file === file 
            ? { 
                ...upload, 
                status: 'error',
                error: error instanceof Error ? error.message : '处理失败'
              } 
            : upload
        ))
        onError(error instanceof Error ? error.message : '文件处理失败')
      }
    }
  }, [maxFiles, onFileProcessed, onError, mediaService])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file))
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />
    if (type.startsWith('audio/')) return <Mic className="w-5 h-5" />
    if (type.includes('pdf') || type.startsWith('text/')) return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = (upload: UploadProgress) => {
    switch (upload.status) {
      case 'uploading':
        return '上传中...'
      case 'processing':
        return 'AI处理中...'
      case 'completed':
        return `已完成 ${upload.segments?.length || 0} 个片段`
      case 'error':
        return upload.error || '处理失败'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 拖拽上传区域 */}
      <motion.div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">上传文件</h3>
        <p className="text-sm text-muted-foreground mb-4">
          拖拽文件到此处，或点击选择文件
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
          <span className="px-2 py-1 bg-muted rounded">📸 图片</span>
          <span className="px-2 py-1 bg-muted rounded">🎵 音频</span>
          <span className="px-2 py-1 bg-muted rounded">📄 文档</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          支持 JPG, PNG, MP3, WAV, PDF, TXT (最大 10MB)
        </p>
      </motion.div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,audio/*,.pdf,.txt,.md,.doc,.docx"
        onChange={(e) => {
          if (e.target.files) {
            handleFileSelect(e.target.files)
          }
        }}
      />

      {/* 上传进度列表 */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium">处理进度</h4>
            {uploads.map((upload, index) => (
              <motion.div
                key={`${upload.file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card border border-border rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getFileIcon(upload.file)}
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {upload.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(upload.file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(upload.status)}
                    <button
                      onClick={() => removeUpload(upload.file)}
                      className="p-1 hover:bg-muted rounded"
                      disabled={upload.status === 'processing'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* 进度条 */}
                {upload.status !== 'error' && (
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${upload.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
                
                {/* 状态文本 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {getStatusText(upload)}
                  </span>
                  {upload.status !== 'error' && (
                    <span className="text-xs text-muted-foreground">
                      {upload.progress}%
                    </span>
                  )}
                </div>
                
                {/* 错误信息 */}
                {upload.status === 'error' && upload.error && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                    {upload.error}
                  </div>
                )}
                
                {/* 处理结果预览 */}
                {upload.status === 'completed' && upload.result?.extractedContent && (
                  <div className="mt-3 p-3 bg-accent/10 border border-accent/20 rounded">
                    <div className="text-xs font-medium mb-2">AI提取内容预览:</div>
                    <div className="text-xs text-muted-foreground line-clamp-3">
                      {upload.result.extractedContent.substring(0, 150)}
                      {upload.result.extractedContent.length > 150 && '...'}
                    </div>
                    {upload.segments && upload.segments.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium mb-1">
                          检测到 {upload.segments.length} 个想法片段
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {upload.segments.slice(0, 3).map((segment, i) => (
                            <span 
                              key={i}
                              className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                            >
                              {segment.type === 'thought' ? '💭' :
                               segment.type === 'idea' ? '💡' :
                               segment.type === 'question' ? '❓' :
                               segment.type === 'plan' ? '📋' : '📝'} 
                              {segment.type}
                            </span>
                          ))}
                          {upload.segments.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{upload.segments.length - 3} 更多
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 辅助函数：生成内容片段（模拟智能分割）
async function generateSegments(content: string): Promise<ContentSegment[]> {
  // 模拟AI智能分割
  const sentences = content.split(/[。！？\n\r]+/).filter(s => s.trim().length > 10)
  
  return sentences.map((sentence, index) => ({
    id: `segment-${Date.now()}-${index}`,
    content: sentence.trim(),
    type: classifySegmentType(sentence.trim()),
    confidence: 0.8 + Math.random() * 0.2,
    startIndex: content.indexOf(sentence),
    endIndex: content.indexOf(sentence) + sentence.length
  }))
}

// 分类内容片段类型
function classifySegmentType(content: string): ContentSegment['type'] {
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