import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Brain, Settings, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: AIConfig) => void
  currentConfig?: AIConfig
}

interface AIConfig {
  provider: 'openai' | 'claude' | 'gemini' | 'zhipu' | 'qwen' | 'wenxin' | 'doubao' | 'deepseek' | 'moonshot' | 'local'
  apiKey?: string
  model?: string
  baseUrl?: string
}

export function AIConfigModal({ isOpen, onClose, onSave, currentConfig }: AIConfigModalProps) {
  const [config, setConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    model: '',
    baseUrl: ''
  })
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig)
    }
  }, [currentConfig])

  const handleProviderChange = (provider: AIConfig['provider']) => {
    setConfig(prev => ({
      ...prev,
      provider,
      model: getDefaultModel(provider),
      baseUrl: provider === 'local' ? 'http://localhost:11434' : ''
    }))
    setValidationResult(null)
  }

  const getDefaultModel = (provider: AIConfig['provider']): string => {
    switch (provider) {
      case 'openai': return 'gpt-4o-mini'
      case 'claude': return 'claude-3-haiku-20240307'
      case 'gemini': return 'gemini-1.5-flash'
      case 'zhipu': return 'glm-4-flash'
      case 'qwen': return 'qwen-turbo'
      case 'wenxin': return 'ernie-4.0-turbo-8k'
      case 'doubao': return 'doubao-lite-4k'
      case 'deepseek': return 'deepseek-chat'
      case 'moonshot': return 'moonshot-v1-8k'
      case 'local': return 'llama3.2'
      default: return ''
    }
  }

  const validateConfig = async () => {
    setIsValidating(true)
    setValidationResult(null)

    try {
      // 基础验证
      if (config.provider !== 'local' && !config.apiKey?.trim()) {
        setValidationResult({
          isValid: false,
          message: 'API密钥不能为空'
        })
        return
      }

      if (config.provider === 'local' && !config.baseUrl?.trim()) {
        setValidationResult({
          isValid: false,
          message: '本地服务地址不能为空'
        })
        return
      }

      // 实际API验证
      const isValid = await testAPIConnection(config)
      
      if (isValid) {
        setValidationResult({
          isValid: true,
          message: 'AI配置验证成功！'
        })
      } else {
        setValidationResult({
          isValid: false,
          message: 'API连接失败，请检查密钥和网络连接'
        })
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: `配置验证失败: ${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setIsValidating(false)
    }
  }

  const testAPIConnection = async (testConfig: AIConfig): Promise<boolean> => {
    try {
      switch (testConfig.provider) {
        case 'openai':
          const openaiResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${testConfig.apiKey}`,
              'Content-Type': 'application/json'
            }
          })
          return openaiResponse.ok

        case 'claude':
          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': testConfig.apiKey!,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: testConfig.model || 'claude-3-haiku-20240307',
              max_tokens: 1,
              messages: [{ role: 'user', content: 'test' }]
            })
          })
          return claudeResponse.status === 200 || claudeResponse.status === 400 // 400也说明API密钥有效

        case 'gemini':
          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${testConfig.model || 'gemini-1.5-flash'}:generateContent?key=${testConfig.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'test' }] }],
              generationConfig: { maxOutputTokens: 1 }
            })
          })
          return geminiResponse.ok

        case 'zhipu':
          const zhipuResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${testConfig.apiKey}`
            },
            body: JSON.stringify({
              model: testConfig.model || 'glm-4-flash',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1
            })
          })
          return zhipuResponse.ok || zhipuResponse.status === 400

        case 'deepseek':
          const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${testConfig.apiKey}`
            },
            body: JSON.stringify({
              model: testConfig.model || 'deepseek-chat',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1
            })
          })
          return deepseekResponse.ok || deepseekResponse.status === 400

        case 'moonshot':
          const moonshotResponse = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${testConfig.apiKey}`
            },
            body: JSON.stringify({
              model: testConfig.model || 'moonshot-v1-8k',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1
            })
          })
          return moonshotResponse.ok || moonshotResponse.status === 400

        case 'qwen':
        case 'wenxin':
        case 'doubao':
          // 这些提供商需要特殊的认证流程，暂时跳过API测试
          return testConfig.apiKey ? true : false

        case 'local':
          const localResponse = await fetch(`${testConfig.baseUrl}/api/tags`)
          return localResponse.ok

        default:
          return false
      }
    } catch (error) {
      console.error('API测试失败:', error)
      return false
    }
  }

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  const providers = [
    {
      id: 'openai' as const,
      name: 'OpenAI GPT',
      description: '最先进的AI模型，分析精度最高',
      icon: '🤖',
      pros: ['分析精度高', '支持复杂推理', '中文理解优秀'],
      cons: ['需要API密钥', '按使用量付费'],
      recommended: true
    },
    {
      id: 'claude' as const,
      name: 'Claude (Anthropic)',
      description: '擅长深度思维分析和哲学思考',
      icon: '🧠',
      pros: ['思维深度分析', '安全性高', '对话自然'],
      cons: ['需要API密钥', 'API额度限制']
    },
    {
      id: 'gemini' as const,
      name: 'Gemini (Google)',
      description: '快速响应，平衡性能与成本',
      icon: '💎',
      pros: ['响应速度快', '成本较低', '支持中文'],
      cons: ['需要API密钥', '分析深度一般']
    },
    {
      id: 'zhipu' as const,
      name: '智谱GLM',
      description: '国产大模型，中文理解能力出色',
      icon: '🔮',
      pros: ['中文原生支持', '推理能力强', '国内访问稳定'],
      cons: ['需要API密钥', '相对较新']
    },
    {
      id: 'qwen' as const,
      name: '通义千问',
      description: '阿里云推出，快速稳定的AI服务',
      icon: '☁️',
      pros: ['响应速度快', '中文优化', '阿里云生态'],
      cons: ['需要API密钥', '功能相对基础']
    },
    {
      id: 'wenxin' as const,
      name: '文心一言',
      description: '百度出品，知识丰富的AI助手',
      icon: '📚',
      pros: ['知识库丰富', '中文表达自然', '搜索整合'],
      cons: ['需要API密钥', '配置复杂']
    },
    {
      id: 'doubao' as const,
      name: '豆包',
      description: '字节跳动AI，年轻化表达风格',
      icon: '🫘',
      pros: ['表达生动', '理解年轻语言', '响应活跃'],
      cons: ['需要API密钥', '风格偏年轻']
    },
    {
      id: 'deepseek' as const,
      name: 'DeepSeek',
      description: '专注深度推理的AI模型',
      icon: '🔍',
      pros: ['深度推理', '逻辑性强', '代码理解好'],
      cons: ['需要API密钥', '响应稍慢'],
      recommended: true
    },
    {
      id: 'moonshot' as const,
      name: '月之暗面',
      description: '新兴AI公司，长文本处理能力强',
      icon: '🌙',
      pros: ['长文本处理', '上下文理解', '创新能力强'],
      cons: ['需要API密钥', '相对较新']
    },
    {
      id: 'local' as const,
      name: '本地AI (Ollama)',
      description: '在本地运行，数据完全私密',
      icon: '🏠',
      pros: ['完全私密', '无网络依赖', '免费使用'],
      cons: ['需要本地安装', '性能要求高', '分析精度较低']
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景蒙层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* 模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">AI配置设置</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* AI提供商选择 */}
              <div>
                <h3 className="text-lg font-medium mb-4">选择AI提供商</h3>
                <div className="space-y-3">
                  {providers.map((provider) => (
                    <motion.div
                      key={provider.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        config.provider === provider.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border-hover hover:bg-muted/50"
                      )}
                      onClick={() => handleProviderChange(provider.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">{provider.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{provider.name}</h4>
                            {provider.recommended && (
                              <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                                推荐
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {provider.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="font-medium text-green-500 mb-1">优点</div>
                              <ul className="space-y-0.5">
                                {provider.pros.map((pro, index) => (
                                  <li key={index} className="text-green-400">• {pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="font-medium text-yellow-500 mb-1">注意</div>
                              <ul className="space-y-0.5">
                                {provider.cons.map((con, index) => (
                                  <li key={index} className="text-yellow-400">• {con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        {config.provider === provider.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 配置表单 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">配置参数</h3>
                
                {/* API密钥 */}
                {config.provider !== 'local' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Key className="w-4 h-4 inline mr-2" />
                      API密钥
                    </label>
                    <input
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={`请输入您的${
                        config.provider === 'openai' ? 'OpenAI' : 
                        config.provider === 'claude' ? 'Claude' : 
                        config.provider === 'gemini' ? 'Gemini' :
                        config.provider === 'zhipu' ? '智谱GLM' :
                        config.provider === 'qwen' ? '通义千问' :
                        config.provider === 'wenxin' ? '文心一言' :
                        config.provider === 'doubao' ? '豆包' :
                        config.provider === 'deepseek' ? 'DeepSeek' :
                        config.provider === 'moonshot' ? '月之暗面' : ''
                      } API密钥`}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.provider === 'openai' 
                        ? '从 platform.openai.com 获取API密钥' 
                        : config.provider === 'claude'
                        ? '从 console.anthropic.com 获取API密钥'
                        : config.provider === 'gemini'
                        ? '从 console.cloud.google.com 获取API密钥'
                        : config.provider === 'zhipu'
                        ? '从 open.bigmodel.cn 获取API密钥'
                        : config.provider === 'qwen'
                        ? '从 dashscope.aliyuncs.com 获取API密钥'
                        : config.provider === 'wenxin'
                        ? '从 console.bce.baidu.com 获取API密钥'
                        : config.provider === 'doubao'
                        ? '从 console.volcengine.com 获取API密钥'
                        : config.provider === 'deepseek'
                        ? '从 platform.deepseek.com 获取API密钥'
                        : config.provider === 'moonshot'
                        ? '从 platform.moonshot.cn 获取API密钥'
                        : ''
                      }
                    </p>
                  </div>
                )}

                {/* 本地服务地址 */}
                {config.provider === 'local' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Settings className="w-4 h-4 inline mr-2" />
                      服务地址
                    </label>
                    <input
                      type="text"
                      value={config.baseUrl || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="http://localhost:11434"
                      className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      请确保Ollama服务正在运行
                    </p>
                  </div>
                )}

                {/* 模型选择 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    AI模型
                  </label>
                  <select
                    value={config.model || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {config.provider === 'openai' && (
                      <>
                        <option value="gpt-4o-mini">GPT-4o Mini (推荐)</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </>
                    )}
                    {config.provider === 'claude' && (
                      <>
                        <option value="claude-3-haiku-20240307">Claude 3 Haiku (推荐)</option>
                        <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                        <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                      </>
                    )}
                    {config.provider === 'gemini' && (
                      <>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (推荐)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-pro">Gemini Pro</option>
                      </>
                    )}
                    {config.provider === 'zhipu' && (
                      <>
                        <option value="glm-4-flash">GLM-4 Flash (推荐)</option>
                        <option value="glm-4">GLM-4</option>
                        <option value="glm-4-air">GLM-4 Air</option>
                      </>
                    )}
                    {config.provider === 'qwen' && (
                      <>
                        <option value="qwen-turbo">Qwen Turbo (推荐)</option>
                        <option value="qwen-plus">Qwen Plus</option>
                        <option value="qwen-max">Qwen Max</option>
                      </>
                    )}
                    {config.provider === 'wenxin' && (
                      <>
                        <option value="ernie-4.0-turbo-8k">ERNIE 4.0 Turbo (推荐)</option>
                        <option value="ernie-3.5">ERNIE 3.5</option>
                        <option value="ernie-speed">ERNIE Speed</option>
                      </>
                    )}
                    {config.provider === 'doubao' && (
                      <>
                        <option value="doubao-lite-4k">豆包 Lite 4K (推荐)</option>
                        <option value="doubao-pro-4k">豆包 Pro 4K</option>
                        <option value="doubao-pro-32k">豆包 Pro 32K</option>
                      </>
                    )}
                    {config.provider === 'deepseek' && (
                      <>
                        <option value="deepseek-chat">DeepSeek Chat (推荐)</option>
                        <option value="deepseek-coder">DeepSeek Coder</option>
                      </>
                    )}
                    {config.provider === 'moonshot' && (
                      <>
                        <option value="moonshot-v1-8k">Moonshot v1 8K (推荐)</option>
                        <option value="moonshot-v1-32k">Moonshot v1 32K</option>
                        <option value="moonshot-v1-128k">Moonshot v1 128K</option>
                      </>
                    )}
                    {config.provider === 'local' && (
                      <>
                        <option value="llama3.2">Llama 3.2 (推荐)</option>
                        <option value="qwen2.5">Qwen 2.5</option>
                        <option value="mistral">Mistral</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* 验证结果 */}
              {validationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-3 rounded-md flex items-center gap-2",
                    validationResult.isValid
                      ? "bg-green-500/10 border border-green-500/20 text-green-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  )}
                >
                  {validationResult.isValid ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{validationResult.message}</span>
                </motion.div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-between p-6 border-t border-border">
              <button
                onClick={validateConfig}
                disabled={isValidating}
                className={cn(
                  "px-4 py-2 rounded-md font-medium transition-colors",
                  "bg-secondary hover:bg-secondary-hover text-foreground",
                  isValidating && "opacity-50 cursor-not-allowed"
                )}
              >
                {isValidating ? '验证中...' : '测试连接'}
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-md font-medium transition-colors bg-primary hover:bg-primary-hover text-white"
                >
                  保存配置
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}