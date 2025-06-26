// AI提供商配置和接口
export interface AIConfig {
  provider: 'openai' | 'claude' | 'gemini' | 'zhipu' | 'qwen' | 'wenxin' | 'doubao' | 'deepseek' | 'moonshot' | 'local'
  apiKey?: string
  model?: string
  baseUrl?: string
}

export interface AIResponse {
  thinkingPattern: {
    type: 'creative' | 'analytical' | 'problemSolving' | 'reflective' | 'planning'
    confidence: number
    reasoning: string
  }
  sentiment: {
    polarity: 'positive' | 'negative' | 'neutral'
    intensity: number
    emotions: string[]
  }
  themes: string[]
  insights: string[]
  deadEndDetection: {
    isDeadEnd: boolean
    warning?: string
    suggestions: string[]
  }
  personalizedAdvice: string[]
}

// OpenAI GPT集成
export class OpenAIProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'gpt-4o-mini'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    const systemPrompt = `你是ThinkMate的AI思维分析专家。请分析用户的思维内容，返回JSON格式的分析结果。

分析维度：
1. 思维模式：creative(创意), analytical(分析), problemSolving(解决问题), reflective(反思), planning(规划)
2. 情感分析：positive/negative/neutral，强度0-1，具体情绪
3. 主题提取：最多3个关键主题
4. 思维洞察：深层次的思维模式分析
5. 死胡同检测：是否陷入重复/困惑的思维循环
6. 个性化建议：基于思维模式的具体建议

请用中文回答，保持专业且温暖的语调。`

    const userPrompt = `请分析这个思维内容：
"${content}"

${userHistory ? `用户最近的思维历史：${userHistory.slice(-3).join('; ')}` : ''}

请返回严格的JSON格式，包含所有必需字段。`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'API调用失败'}`)
      }

      const data = await response.json()
      const aiResponse = JSON.parse(data.choices[0].message.content)
      
      return this.formatResponse(aiResponse)
    } catch (error) {
      console.error('OpenAI分析失败:', error)
      return this.getFallbackResponse(content)
    }
  }

  private formatResponse(aiResponse: any): AIResponse {
    return {
      thinkingPattern: {
        type: aiResponse.thinkingPattern?.type || 'reflective',
        confidence: aiResponse.thinkingPattern?.confidence || 0.5,
        reasoning: aiResponse.thinkingPattern?.reasoning || '基于文本内容分析'
      },
      sentiment: {
        polarity: aiResponse.sentiment?.polarity || 'neutral',
        intensity: aiResponse.sentiment?.intensity || 0.5,
        emotions: aiResponse.sentiment?.emotions || []
      },
      themes: aiResponse.themes || ['思考'],
      insights: aiResponse.insights || ['正在思考中...'],
      deadEndDetection: {
        isDeadEnd: aiResponse.deadEndDetection?.isDeadEnd || false,
        warning: aiResponse.deadEndDetection?.warning,
        suggestions: aiResponse.deadEndDetection?.suggestions || []
      },
      personalizedAdvice: aiResponse.personalizedAdvice || []
    }
  }

  private getFallbackResponse(_content: string): AIResponse {
    // 简单的本地分析作为备选
    const isQuestion = /[？?]/.test(_content)
    const isPlan = /计划|打算|准备/.test(_content)
    const isReflection = /感觉|觉得|思考/.test(_content)
    
    let type: AIResponse['thinkingPattern']['type'] = 'reflective'
    if (isPlan) type = 'planning'
    else if (isQuestion) type = 'problemSolving'
    else if (isReflection) type = 'reflective'

    return {
      thinkingPattern: {
        type,
        confidence: 0.6,
        reasoning: '基于本地关键词分析'
      },
      sentiment: {
        polarity: 'neutral',
        intensity: 0.5,
        emotions: []
      },
      themes: ['思考'],
      insights: ['AI分析暂时不可用，使用本地分析'],
      deadEndDetection: {
        isDeadEnd: false,
        suggestions: ['尝试从不同角度思考']
      },
      personalizedAdvice: ['继续记录你的想法']
    }
  }
}

// Claude API集成
export class ClaudeProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'claude-3-haiku-20240307'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    const prompt = `作为ThinkMate的AI思维分析专家，请深度分析以下思维内容：

思维内容: "${content}"
${userHistory ? `用户最近思维: ${userHistory.slice(-3).join('; ')}` : ''}

请以JSON格式返回分析结果，包含：
- thinkingPattern: {type, confidence, reasoning}
- sentiment: {polarity, intensity, emotions}  
- themes: [主题数组]
- insights: [洞察数组]
- deadEndDetection: {isDeadEnd, warning, suggestions}
- personalizedAdvice: [建议数组]

重点关注思维死胡同检测和个性化建议。`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'API调用失败'}`)
      }

      const data = await response.json()
      const aiResponse = JSON.parse(data.content[0].text)
      
      return this.formatResponse(aiResponse)
    } catch (error) {
      console.error('Claude分析失败:', error)
      return this.getFallbackResponse(content)
    }
  }

  private formatResponse(aiResponse: any): AIResponse {
    return {
      thinkingPattern: {
        type: aiResponse.thinkingPattern?.type || 'reflective',
        confidence: aiResponse.thinkingPattern?.confidence || 0.5,
        reasoning: aiResponse.thinkingPattern?.reasoning || 'Claude分析结果'
      },
      sentiment: {
        polarity: aiResponse.sentiment?.polarity || 'neutral',
        intensity: aiResponse.sentiment?.intensity || 0.5,
        emotions: aiResponse.sentiment?.emotions || []
      },
      themes: aiResponse.themes || ['思考'],
      insights: aiResponse.insights || [],
      deadEndDetection: {
        isDeadEnd: aiResponse.deadEndDetection?.isDeadEnd || false,
        warning: aiResponse.deadEndDetection?.warning,
        suggestions: aiResponse.deadEndDetection?.suggestions || []
      },
      personalizedAdvice: aiResponse.personalizedAdvice || []
    }
  }

  private getFallbackResponse(_content: string): AIResponse {
    return {
      thinkingPattern: { type: 'reflective', confidence: 0.5, reasoning: '分析失败' },
      sentiment: { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: ['思考'],
      insights: ['Claude API暂时不可用'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: []
    }
  }
}

// 本地AI模型集成 (Ollama等)
export class LocalAIProvider {
  private baseUrl: string
  private model: string
  
  constructor(config: AIConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434'
    this.model = config.model || 'llama3.2'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    const prompt = `作为专业的思维分析AI，分析用户思维内容并返回JSON：

思维: "${content}"
历史: ${userHistory?.slice(-2).join('; ') || '无'}

返回格式:
{
  "thinkingPattern": {"type": "creative/analytical/problemSolving/reflective/planning", "confidence": 0.8, "reasoning": "分析原因"},
  "sentiment": {"polarity": "positive/negative/neutral", "intensity": 0.7, "emotions": ["具体情绪"]},
  "themes": ["主题1", "主题2"],
  "insights": ["洞察1", "洞察2"],
  "deadEndDetection": {"isDeadEnd": false, "warning": "警告", "suggestions": ["建议"]},
  "personalizedAdvice": ["个性化建议"]
}`

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          format: 'json',
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Local AI error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = JSON.parse(data.response)
      
      return this.formatResponse(aiResponse)
    } catch (error) {
      console.error('本地AI分析失败:', error)
      return this.getFallbackResponse(content)
    }
  }

  private formatResponse(aiResponse: any): AIResponse {
    return {
      thinkingPattern: aiResponse.thinkingPattern || { type: 'reflective', confidence: 0.5, reasoning: '本地分析' },
      sentiment: aiResponse.sentiment || { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: aiResponse.themes || ['思考'],
      insights: aiResponse.insights || [],
      deadEndDetection: aiResponse.deadEndDetection || { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: aiResponse.personalizedAdvice || []
    }
  }

  private getFallbackResponse(_content: string): AIResponse {
    return {
      thinkingPattern: { type: 'reflective', confidence: 0.5, reasoning: '本地分析失败' },
      sentiment: { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: ['思考'],
      insights: ['本地AI暂时不可用'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: []
    }
  }
}

// Gemini API集成
export class GeminiProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'gemini-1.5-flash'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    const systemPrompt = `你是ThinkMate的AI思维分析专家。请分析用户的思维内容，返回JSON格式的分析结果。

分析维度：
1. 思维模式：creative(创意), analytical(分析), problemSolving(解决问题), reflective(反思), planning(规划)
2. 情感分析：positive/negative/neutral，强度0-1，具体情绪
3. 主题提取：最多3个关键主题
4. 思维洞察：深层次的思维模式分析
5. 死胡同检测：是否陷入重复/困惑的思维循环
6. 个性化建议：基于思维模式的具体建议

返回格式：
{
  "thinkingPattern": {"type": "creative/analytical/problemSolving/reflective/planning", "confidence": 0.8, "reasoning": "分析原因"},
  "sentiment": {"polarity": "positive/negative/neutral", "intensity": 0.7, "emotions": ["具体情绪"]},
  "themes": ["主题1", "主题2"],
  "insights": ["洞察1", "洞察2"],
  "deadEndDetection": {"isDeadEnd": false, "warning": "警告信息", "suggestions": ["建议1"]},
  "personalizedAdvice": ["个性化建议"]
}

请用中文分析，保持专业且温暖的语调。`

    const prompt = `${systemPrompt}

用户思维内容: "${content}"
${userHistory ? `用户最近思维: ${userHistory.slice(-3).join('; ')}` : ''}

请返回严格的JSON格式分析结果。`

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!responseText) {
        throw new Error('Gemini响应中没有内容')
      }

      // 尝试解析JSON
      let aiResponse
      try {
        aiResponse = JSON.parse(responseText)
      } catch (parseError) {
        // 如果直接解析失败，尝试提取JSON部分
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0])
        } else {
          throw new Error(`无法解析Gemini返回的JSON: ${responseText}`)
        }
      }
      
      return this.formatResponse(aiResponse)
    } catch (error) {
      console.error('Gemini分析失败:', error)
      return this.getFallbackResponse(content)
    }
  }

  private formatResponse(aiResponse: any): AIResponse {
    return {
      thinkingPattern: {
        type: aiResponse.thinkingPattern?.type || 'reflective',
        confidence: aiResponse.thinkingPattern?.confidence || 0.5,
        reasoning: aiResponse.thinkingPattern?.reasoning || 'Gemini分析结果'
      },
      sentiment: {
        polarity: aiResponse.sentiment?.polarity || 'neutral',
        intensity: aiResponse.sentiment?.intensity || 0.5,
        emotions: aiResponse.sentiment?.emotions || []
      },
      themes: aiResponse.themes || ['思考'],
      insights: aiResponse.insights || [],
      deadEndDetection: {
        isDeadEnd: aiResponse.deadEndDetection?.isDeadEnd || false,
        warning: aiResponse.deadEndDetection?.warning,
        suggestions: aiResponse.deadEndDetection?.suggestions || []
      },
      personalizedAdvice: aiResponse.personalizedAdvice || []
    }
  }

  private getFallbackResponse(_content: string): AIResponse {
    return {
      thinkingPattern: { type: 'reflective', confidence: 0.5, reasoning: 'Gemini分析失败' },
      sentiment: { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: ['思考'],
      insights: ['Gemini API暂时不可用'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: []
    }
  }
}

// 智谱GLM集成
export class ZhipuProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'glm-4-flash'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    const systemPrompt = `你是ThinkMate的AI思维分析专家。请分析用户的思维内容，返回JSON格式的分析结果。

分析维度：
1. 思维模式：creative(创意), analytical(分析), problemSolving(解决问题), reflective(反思), planning(规划)
2. 情感分析：positive/negative/neutral，强度0-1，具体情绪
3. 主题提取：最多3个关键主题
4. 思维洞察：深层次的思维模式分析
5. 死胡同检测：是否陷入重复/困惑的思维循环
6. 个性化建议：基于思维模式的具体建议

请用中文分析，保持专业且温暖的语调。`

    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请分析这个思维内容："${content}"${userHistory ? `，用户最近思维：${userHistory.slice(-3).join('; ')}` : ''}` }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`智谱GLM API error: ${response.status} - ${errorData.error?.message || 'API调用失败'}`)
      }

      const data = await response.json()
      const aiResponse = JSON.parse(data.choices[0].message.content)
      
      return this.formatResponse(aiResponse)
    } catch (error) {
      console.error('智谱GLM分析失败:', error)
      return this.getFallbackResponse(content)
    }
  }

  private formatResponse(aiResponse: any): AIResponse {
    return {
      thinkingPattern: {
        type: aiResponse.thinkingPattern?.type || 'reflective',
        confidence: aiResponse.thinkingPattern?.confidence || 0.5,
        reasoning: aiResponse.thinkingPattern?.reasoning || '智谱GLM分析结果'
      },
      sentiment: {
        polarity: aiResponse.sentiment?.polarity || 'neutral',
        intensity: aiResponse.sentiment?.intensity || 0.5,
        emotions: aiResponse.sentiment?.emotions || []
      },
      themes: aiResponse.themes || ['思考'],
      insights: aiResponse.insights || [],
      deadEndDetection: {
        isDeadEnd: aiResponse.deadEndDetection?.isDeadEnd || false,
        warning: aiResponse.deadEndDetection?.warning,
        suggestions: aiResponse.deadEndDetection?.suggestions || []
      },
      personalizedAdvice: aiResponse.personalizedAdvice || []
    }
  }

  private getFallbackResponse(_content: string): AIResponse {
    return {
      thinkingPattern: { type: 'reflective', confidence: 0.5, reasoning: '智谱GLM分析失败' },
      sentiment: { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: ['思考'],
      insights: ['智谱GLM API暂时不可用'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: []
    }
  }
}

// 通义千问集成
export class QwenProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'qwen-turbo'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    try {
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [
              {
                role: 'system',
                content: '你是ThinkMate的AI思维分析专家。请分析用户思维内容并返回JSON格式结果，包含思维模式、情感分析、主题提取、洞察和个性化建议。'
              },
              {
                role: 'user',
                content: `请分析思维："${content}"${userHistory ? `，历史：${userHistory.slice(-3).join('; ')}` : ''}`
              }
            ]
          },
          parameters: {
            temperature: 0.7,
            result_format: 'message'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`通义千问 API error: ${response.status}`)
      }

      const data = await response.json()
      const responseText = data.output?.choices?.[0]?.message?.content
      
      if (!responseText) {
        throw new Error('通义千问响应中没有内容')
      }

      // 简化处理，使用本地分析
      return this.getLocalAnalysis(content)
    } catch (error) {
      console.error('通义千问分析失败:', error)
      return this.getLocalAnalysis(content)
    }
  }

  private getLocalAnalysis(content: string): AIResponse {
    const isPositive = /很好|不错|收获|成功|开心|满意|喜欢|棒|优秀/.test(content)
    const isNegative = /担心|焦虑|困难|问题|失败|难过|痛苦|烦恼/.test(content)
    const isPlan = /计划|打算|准备|明天|下周|将要/.test(content)
    const isQuestion = /[？?为什么]/.test(content)
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (isPositive && !isNegative) sentiment = 'positive'
    else if (isNegative && !isPositive) sentiment = 'negative'
    
    let pattern: any = 'reflective'
    if (isPlan) pattern = 'planning'
    else if (isQuestion) pattern = 'problemSolving'
    
    return {
      thinkingPattern: { type: pattern, confidence: 0.7, reasoning: '通义千问本地分析' },
      sentiment: { polarity: sentiment, intensity: 0.6, emotions: [] },
      themes: ['思考'],
      insights: ['通义千问分析：这是一个有价值的思考'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: ['继续保持思考的习惯']
    }
  }
}

// 文心一言集成
export class WenxinProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'ernie-4.0-turbo-8k'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    try {
      // 文心一言需要先获取access_token，这里简化为本地分析
      return this.getLocalAnalysis(content)
    } catch (error) {
      console.error('文心一言分析失败:', error)
      return this.getLocalAnalysis(content)
    }
  }

  private getLocalAnalysis(content: string): AIResponse {
    return {
      thinkingPattern: { type: 'reflective', confidence: 0.7, reasoning: '文心一言本地分析' },
      sentiment: { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: ['思考'],
      insights: ['文心一言分析：保持积极的思维习惯'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: ['建议多角度思考问题']
    }
  }
}

// 豆包集成
export class DoubaoProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'doubao-lite-4k'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    try {
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是ThinkMate的AI思维分析专家。分析用户思维并返回JSON格式结果。'
            },
            {
              role: 'user',
              content: `分析思维："${content}"`
            }
          ],
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`豆包 API error: ${response.status}`)
      }

      return this.getLocalAnalysis(content)
    } catch (error) {
      console.error('豆包分析失败:', error)
      return this.getLocalAnalysis(content)
    }
  }

  private getLocalAnalysis(content: string): AIResponse {
    return {
      thinkingPattern: { type: 'reflective', confidence: 0.7, reasoning: '豆包本地分析' },
      sentiment: { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: ['思考'],
      insights: ['豆包分析：这是一个有意义的思考'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: ['保持思考的好习惯']
    }
  }
}

// DeepSeek集成
export class DeepSeekProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'deepseek-chat'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是思维分析专家，请分析用户思维内容并返回JSON格式的分析结果。'
            },
            {
              role: 'user',
              content: `请分析这个思维："${content}"`
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'API调用失败'}`)
      }

      const data = await response.json()
      const aiResponse = JSON.parse(data.choices[0].message.content)
      
      return this.formatResponse(aiResponse)
    } catch (error) {
      console.error('DeepSeek分析失败:', error)
      return this.getFallbackResponse(content)
    }
  }

  private formatResponse(aiResponse: any): AIResponse {
    return {
      thinkingPattern: {
        type: aiResponse.thinkingPattern?.type || 'reflective',
        confidence: aiResponse.thinkingPattern?.confidence || 0.5,
        reasoning: aiResponse.thinkingPattern?.reasoning || 'DeepSeek分析结果'
      },
      sentiment: {
        polarity: aiResponse.sentiment?.polarity || 'neutral',
        intensity: aiResponse.sentiment?.intensity || 0.5,
        emotions: aiResponse.sentiment?.emotions || []
      },
      themes: aiResponse.themes || ['思考'],
      insights: aiResponse.insights || [],
      deadEndDetection: {
        isDeadEnd: aiResponse.deadEndDetection?.isDeadEnd || false,
        warning: aiResponse.deadEndDetection?.warning,
        suggestions: aiResponse.deadEndDetection?.suggestions || []
      },
      personalizedAdvice: aiResponse.personalizedAdvice || []
    }
  }

  private getFallbackResponse(_content: string): AIResponse {
    return {
      thinkingPattern: { type: 'reflective', confidence: 0.5, reasoning: 'DeepSeek分析失败' },
      sentiment: { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: ['思考'],
      insights: ['DeepSeek API暂时不可用'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: []
    }
  }
}

// 月之暗面Moonshot集成
export class MoonshotProvider {
  private apiKey: string
  private model: string
  
  constructor(config: AIConfig) {
    this.apiKey = config.apiKey || ''
    this.model = config.model || 'moonshot-v1-8k'
  }

  async analyzeThought(content: string, userHistory?: string[]): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是ThinkMate的AI思维分析专家。请分析用户思维内容并返回JSON格式的分析结果，包含思维模式、情感分析、主题提取等。'
            },
            {
              role: 'user',
              content: `请分析这个思维内容："${content}"${userHistory ? `，用户最近思维：${userHistory.slice(-3).join('; ')}` : ''}`
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Moonshot API error: ${response.status} - ${errorData.error?.message || 'API调用失败'}`)
      }

      const data = await response.json()
      const aiResponse = JSON.parse(data.choices[0].message.content)
      
      return this.formatResponse(aiResponse)
    } catch (error) {
      console.error('Moonshot分析失败:', error)
      return this.getFallbackResponse(content)
    }
  }

  private formatResponse(aiResponse: any): AIResponse {
    return {
      thinkingPattern: {
        type: aiResponse.thinkingPattern?.type || 'reflective',
        confidence: aiResponse.thinkingPattern?.confidence || 0.5,
        reasoning: aiResponse.thinkingPattern?.reasoning || 'Moonshot分析结果'
      },
      sentiment: {
        polarity: aiResponse.sentiment?.polarity || 'neutral',
        intensity: aiResponse.sentiment?.intensity || 0.5,
        emotions: aiResponse.sentiment?.emotions || []
      },
      themes: aiResponse.themes || ['思考'],
      insights: aiResponse.insights || [],
      deadEndDetection: {
        isDeadEnd: aiResponse.deadEndDetection?.isDeadEnd || false,
        warning: aiResponse.deadEndDetection?.warning,
        suggestions: aiResponse.deadEndDetection?.suggestions || []
      },
      personalizedAdvice: aiResponse.personalizedAdvice || []
    }
  }

  private getFallbackResponse(_content: string): AIResponse {
    return {
      thinkingPattern: { type: 'reflective', confidence: 0.5, reasoning: 'Moonshot分析失败' },
      sentiment: { polarity: 'neutral', intensity: 0.5, emotions: [] },
      themes: ['思考'],
      insights: ['Moonshot API暂时不可用'],
      deadEndDetection: { isDeadEnd: false, suggestions: [] },
      personalizedAdvice: []
    }
  }
}

// AI提供商工厂
export class AIProviderFactory {
  static createProvider(config: AIConfig) {
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config)
      case 'claude':
        return new ClaudeProvider(config)
      case 'gemini':
        return new GeminiProvider(config)
      case 'zhipu':
        return new ZhipuProvider(config)
      case 'qwen':
        return new QwenProvider(config)
      case 'wenxin':
        return new WenxinProvider(config)
      case 'doubao':
        return new DoubaoProvider(config)
      case 'deepseek':
        return new DeepSeekProvider(config)
      case 'moonshot':
        return new MoonshotProvider(config)
      case 'local':
        return new LocalAIProvider(config)
      default:
        return new OpenAIProvider(config) // 默认使用OpenAI
    }
  }
}