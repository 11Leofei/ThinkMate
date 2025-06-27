// AI智能编排核心引擎 - 系统指挥中心
import { 
  AIScenario, 
  ThinkingContext, 
  OrchestrationTask,
  OrchestrationResult,
  AIWorkStatus,
  ProcessingStep,
  SynthesizedInsight,
  TaskPerformance,
  AITaskResult
} from './types'
import { Thought } from '../../types'
import { scenarioDetector } from './ScenarioDetector'
import { aiSelector } from './AISelector'
import { AIProviderFactory, AIConfig } from '../aiProviders'

export class AIOrchestrator {
  private currentTasks = new Map<string, OrchestrationTask>()
  private taskResults = new Map<string, OrchestrationResult>()
  private workStatuses = new Map<string, AIWorkStatus>()
  private listeners = new Set<(status: AIWorkStatus) => void>()

  // 主要编排方法 - 处理单个思想
  async processThought(
    thought: Thought, 
    context?: Partial<ThinkingContext>,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<OrchestrationResult> {
    
    const taskId = this.generateTaskId()
    const fullContext = this.buildFullContext(thought, context)
    
    try {
      // 1. 场景检测
      const scenario = await this.detectScenario(thought, fullContext)
      
      // 2. 创建编排任务
      const task = this.createTask(taskId, scenario, thought, fullContext, priority)
      this.currentTasks.set(taskId, task)
      
      // 3. 选择最优AI
      const selectedAIs = this.selectAIs(scenario, fullContext)
      
      // 4. 初始化工作状态
      const workStatus = this.initializeWorkStatus(taskId, scenario, selectedAIs)
      this.workStatuses.set(taskId, workStatus)
      this.notifyListeners(workStatus)
      
      // 5. 执行任务
      const results = await this.executeTasks(task, selectedAIs, workStatus)
      
      // 6. 合成结果
      const synthesizedResult = await this.synthesizeResults(results, scenario)
      
      // 7. 生成最终结果
      const orchestrationResult = this.createOrchestrationResult(
        task, selectedAIs, results, synthesizedResult
      )
      
      // 8. 清理和记录
      this.cleanup(taskId)
      this.recordResult(orchestrationResult)
      
      return orchestrationResult
      
    } catch (error) {
      console.error('编排处理失败:', error)
      return this.createErrorResult(taskId, error as Error)
    }
  }

  // 快速分析 - 用于实时场景
  async quickAnalysis(content: string): Promise<{ scenario: AIScenario, provider: string, confidence: number }> {
    try {
      // 快速场景检测
      const scenario = scenarioDetector.detectQuick(content)
      
      // 快速AI选择
      const provider = aiSelector.selectQuick(scenario)
      
      // 估算置信度
      const confidence = this.estimateQuickConfidence(content, scenario)
      
      return { scenario, provider, confidence }
    } catch (error) {
      console.error('快速分析失败:', error)
      return { 
        scenario: AIScenario.GENERAL_THINKING, 
        provider: 'gemini', 
        confidence: 0.5 
      }
    }
  }

  // 批量处理
  async processBatch(
    thoughts: Thought[], 
    context?: Partial<ThinkingContext>
  ): Promise<Map<string, OrchestrationResult>> {
    const results = new Map<string, OrchestrationResult>()
    
    // 并行处理多个思想
    const promises = thoughts.map(async (thought) => {
      try {
        const result = await this.processThought(thought, context)
        results.set(thought.id, result)
      } catch (error) {
        console.error(`处理思想 ${thought.id} 失败:`, error)
        results.set(thought.id, this.createErrorResult(thought.id, error as Error))
      }
    })
    
    await Promise.all(promises)
    return results
  }

  // 获取工作状态
  getWorkStatus(taskId: string): AIWorkStatus | undefined {
    return this.workStatuses.get(taskId)
  }

  // 获取所有活跃任务
  getActiveTasks(): OrchestrationTask[] {
    return Array.from(this.currentTasks.values())
  }

  // 取消任务
  cancelTask(taskId: string): boolean {
    if (this.currentTasks.has(taskId)) {
      this.currentTasks.delete(taskId)
      this.workStatuses.delete(taskId)
      return true
    }
    return false
  }

  // 监听工作状态
  addStatusListener(listener: (status: AIWorkStatus) => void): void {
    this.listeners.add(listener)
  }

  removeStatusListener(listener: (status: AIWorkStatus) => void): void {
    this.listeners.delete(listener)
  }

  // 获取性能统计
  getPerformanceStats(): {
    totalTasks: number
    averageTime: number
    successRate: number
    scenarioDistribution: { [scenario: string]: number }
    aiUsageStats: { [provider: string]: number }
  } {
    const results = Array.from(this.taskResults.values())
    
    if (results.length === 0) {
      return {
        totalTasks: 0,
        averageTime: 0,
        successRate: 0,
        scenarioDistribution: {},
        aiUsageStats: {}
      }
    }
    
    const scenarioDistribution: { [scenario: string]: number } = {}
    const aiUsageStats: { [provider: string]: number } = {}
    let totalTime = 0
    let successCount = 0
    
    results.forEach(result => {
      // 场景分布
      scenarioDistribution[result.scenario] = (scenarioDistribution[result.scenario] || 0) + 1
      
      // AI使用统计
      result.selectedAIs.forEach(ai => {
        aiUsageStats[ai] = (aiUsageStats[ai] || 0) + 1
      })
      
      // 性能统计
      totalTime += result.performance.totalTime
      if (result.performance.successRate > 0.8) {
        successCount++
      }
    })
    
    return {
      totalTasks: results.length,
      averageTime: totalTime / results.length,
      successRate: successCount / results.length,
      scenarioDistribution,
      aiUsageStats
    }
  }

  // 私有方法
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private buildFullContext(thought: Thought, partialContext?: Partial<ThinkingContext>): ThinkingContext {
    const now = new Date()
    const hour = now.getHours()
    
    return {
      currentThought: thought,
      recentThoughts: this.getRecentThoughts(),
      userPreferences: this.getUserPreferences(),
      sessionHistory: this.getSessionHistory(),
      timeOfDay: hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night',
      ...partialContext
    }
  }

  private async detectScenario(thought: Thought, context: ThinkingContext): Promise<AIScenario> {
    return await scenarioDetector.detect(thought, context)
  }

  private createTask(
    taskId: string,
    scenario: AIScenario,
    thought: Thought,
    context: ThinkingContext,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ): OrchestrationTask {
    return {
      id: taskId,
      scenario,
      content: thought.content,
      context,
      priority,
      requiredCapabilities: this.getRequiredCapabilities(scenario)
    }
  }

  private selectAIs(scenario: AIScenario, context: ThinkingContext) {
    return aiSelector.selectOptimalAI(scenario, context)
  }

  private initializeWorkStatus(
    taskId: string,
    scenario: AIScenario,
    selectedAIs: any[]
  ): AIWorkStatus {
    const steps = this.generateProcessingSteps(scenario, selectedAIs)
    
    return {
      scenario,
      selectedAIs: selectedAIs.map(ai => ai.provider),
      currentStep: steps[0]?.name || 'Initializing',
      processingSteps: steps,
      estimatedTime: this.estimateProcessingTime(scenario, selectedAIs),
      confidence: 0.8,
      startTime: new Date()
    }
  }

  private async executeTasks(
    task: OrchestrationTask,
    selectedAIs: any[],
    workStatus: AIWorkStatus
  ): Promise<AITaskResult[]> {
    const results: AITaskResult[] = []
    
    for (let i = 0; i < selectedAIs.length; i++) {
      const ai = selectedAIs[i]
      const step = workStatus.processingSteps[i]
      
      try {
        // 更新状态
        step.status = 'running'
        step.startTime = new Date()
        workStatus.currentStep = step.name
        this.notifyListeners(workStatus)
        
        // 执行AI分析
        const startTime = Date.now()
        const result = await this.executeAITask(ai, task)
        const endTime = Date.now()
        
        // 记录结果
        const taskResult: AITaskResult = {
          provider: ai.provider,
          scenario: task.scenario,
          result: result,
          confidence: result.confidence || 0.8,
          responseTime: endTime - startTime
        }
        
        results.push(taskResult)
        
        // 更新步骤状态
        step.status = 'completed'
        step.endTime = new Date()
        step.result = result
        
      } catch (error) {
        console.error(`AI任务执行失败 ${ai.provider}:`, error)
        
        // 记录错误
        const taskResult: AITaskResult = {
          provider: ai.provider,
          scenario: task.scenario,
          result: null,
          confidence: 0,
          responseTime: 0,
          error: (error as Error).message
        }
        
        results.push(taskResult)
        
        // 更新步骤状态
        step.status = 'failed'
        step.endTime = new Date()
      }
    }
    
    return results
  }

  private async executeAITask(ai: any, task: OrchestrationTask): Promise<any> {
    // 获取AI配置
    const config = this.getAIConfig(ai.provider)
    if (!config) {
      throw new Error(`AI配置未找到: ${ai.provider}`)
    }
    
    // 创建AI提供商实例
    const provider = AIProviderFactory.createProvider(config)
    
    // 执行分析
    const thought: Thought = {
      id: task.id,
      content: task.content,
      timestamp: new Date(),
      tags: [],
      category: ''
    }
    
    return await provider.analyzeThought(thought.content, task.context.recentThoughts.map(t => t.content))
  }

  private async synthesizeResults(
    results: AITaskResult[],
    scenario: AIScenario
  ): Promise<SynthesizedInsight> {
    const validResults = results.filter(r => r.result && !r.error)
    
    if (validResults.length === 0) {
      return {
        primaryInsight: '分析失败，请稍后重试',
        supportingInsights: [],
        confidence: 0,
        sources: [],
        actionableAdvice: ['检查网络连接', '验证API配置'],
        relatedConcepts: []
      }
    }
    
    if (validResults.length === 1) {
      // 单一结果，直接返回
      const result = validResults[0].result
      return {
        primaryInsight: result.insights?.[0] || '分析完成',
        supportingInsights: result.insights?.slice(1) || [],
        confidence: result.thinkingPattern?.confidence || 0.7,
        sources: [validResults[0].provider],
        actionableAdvice: result.personalizedAdvice || [],
        relatedConcepts: result.themes || []
      }
    }
    
    // 多结果合成
    return this.synthesizeMultipleResults(validResults, scenario)
  }

  private synthesizeMultipleResults(results: AITaskResult[], scenario: AIScenario): SynthesizedInsight {
    const insights: string[] = []
    const themes: string[] = []
    const advice: string[] = []
    const sources: string[] = []
    let totalConfidence = 0
    
    results.forEach(result => {
      const r = result.result
      if (r.insights) insights.push(...r.insights)
      if (r.themes) themes.push(...r.themes)
      if (r.personalizedAdvice) advice.push(...r.personalizedAdvice)
      sources.push(result.provider)
      totalConfidence += (r.thinkingPattern?.confidence || 0.5)
    })
    
    // 去重和排序
    const uniqueInsights = [...new Set(insights)]
    const uniqueThemes = [...new Set(themes)]
    const uniqueAdvice = [...new Set(advice)]
    
    return {
      primaryInsight: uniqueInsights[0] || '多维度分析完成',
      supportingInsights: uniqueInsights.slice(1, 4),
      confidence: totalConfidence / results.length,
      sources,
      actionableAdvice: uniqueAdvice.slice(0, 3),
      relatedConcepts: uniqueThemes.slice(0, 5)
    }
  }

  private createOrchestrationResult(
    task: OrchestrationTask,
    selectedAIs: any[],
    results: AITaskResult[],
    synthesizedResult: SynthesizedInsight
  ): OrchestrationResult {
    const performance = this.calculatePerformance(results, task.context.sessionHistory.startTime)
    
    return {
      taskId: task.id,
      scenario: task.scenario,
      selectedAIs: selectedAIs.map(ai => ai.provider),
      results,
      synthesizedResult,
      performance,
      recommendations: this.generateRecommendations(task, results, performance)
    }
  }

  private calculatePerformance(results: AITaskResult[], startTime: Date): TaskPerformance {
    const totalTime = Date.now() - startTime.getTime()
    const successfulResults = results.filter(r => !r.error)
    const averageConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / Math.max(successfulResults.length, 1)
    const successRate = successfulResults.length / results.length
    
    return {
      totalTime,
      averageConfidence,
      successRate,
      costEstimate: this.estimateCost(results),
      userSatisfactionPrediction: Math.min(averageConfidence * successRate * 1.2, 1.0)
    }
  }

  private generateRecommendations(
    task: OrchestrationTask,
    results: AITaskResult[],
    performance: TaskPerformance
  ): string[] {
    const recommendations: string[] = []
    
    if (performance.successRate < 0.8) {
      recommendations.push('建议检查网络连接和API配置')
    }
    
    if (performance.averageConfidence < 0.6) {
      recommendations.push('考虑使用更高质量的AI提供商')
    }
    
    if (performance.totalTime > 10000) {
      recommendations.push('考虑使用更快的AI提供商以提升响应速度')
    }
    
    const failedProviders = results.filter(r => r.error).map(r => r.provider)
    if (failedProviders.length > 0) {
      recommendations.push(`以下AI提供商出现问题: ${failedProviders.join(', ')}`)
    }
    
    return recommendations
  }

  private createErrorResult(taskId: string, error: Error): OrchestrationResult {
    return {
      taskId,
      scenario: AIScenario.GENERAL_THINKING,
      selectedAIs: [],
      results: [],
      synthesizedResult: {
        primaryInsight: `处理失败: ${error.message}`,
        supportingInsights: [],
        confidence: 0,
        sources: [],
        actionableAdvice: ['检查网络连接', '验证配置'],
        relatedConcepts: []
      },
      performance: {
        totalTime: 0,
        averageConfidence: 0,
        successRate: 0,
        costEstimate: 0,
        userSatisfactionPrediction: 0
      },
      recommendations: ['请稍后重试', '检查系统配置']
    }
  }

  private cleanup(taskId: string): void {
    this.currentTasks.delete(taskId)
    this.workStatuses.delete(taskId)
  }

  private recordResult(result: OrchestrationResult): void {
    this.taskResults.set(result.taskId, result)
    
    // 保持最近100个结果
    if (this.taskResults.size > 100) {
      const oldestKey = this.taskResults.keys().next().value
      this.taskResults.delete(oldestKey)
    }
    
    // 更新AI性能数据
    result.results.forEach(aiResult => {
      if (!aiResult.error) {
        aiSelector.updatePerformance({
          provider: aiResult.provider,
          scenario: result.scenario,
          responseTime: aiResult.responseTime,
          userSatisfaction: result.performance.userSatisfactionPrediction,
          successRate: aiResult.error ? 0 : 1,
          timestamp: new Date()
        })
      }
    })
  }

  private notifyListeners(status: AIWorkStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('状态监听器错误:', error)
      }
    })
  }

  // 辅助方法
  private getRecentThoughts(): Thought[] {
    try {
      const thoughts = JSON.parse(localStorage.getItem('thinkmate-thoughts') || '[]')
      return thoughts.slice(-10) // 最近10个想法
    } catch {
      return []
    }
  }

  private getUserPreferences() {
    return {
      preferredAIs: {},
      speedVsQuality: 'balanced' as const,
      costSensitivity: 'medium' as const,
      privacyConcern: 'medium' as const,
      experienceLevel: 'intermediate' as const
    }
  }

  private getSessionHistory() {
    return {
      startTime: new Date(),
      thoughtCount: 0,
      dominantScenarios: [],
      aiPerformanceHistory: []
    }
  }

  private getRequiredCapabilities(scenario: AIScenario): string[] {
    const capabilityMap: { [key in AIScenario]: string[] } = {
      [AIScenario.QUICK_CLASSIFICATION]: ['classification', 'tagging'],
      [AIScenario.CONTENT_SUMMARIZATION]: ['summarization', 'extraction'],
      [AIScenario.DEEP_INSIGHT]: ['reasoning', 'analysis'],
      [AIScenario.PHILOSOPHICAL_THINKING]: ['philosophy', 'abstract thinking'],
      [AIScenario.CREATIVE_INSPIRATION]: ['creativity', 'brainstorming'],
      [AIScenario.SEARCH_OPTIMIZATION]: ['search', 'keyword extraction'],
      [AIScenario.KNOWLEDGE_LINKING]: ['relation detection', 'semantic analysis'],
      [AIScenario.LIVE_ANALYSIS]: ['real-time processing'],
      [AIScenario.FILE_PROCESSING]: ['document processing', 'extraction'],
      [AIScenario.AUTO_TAGGING]: ['auto tagging', 'classification'],
      [AIScenario.COMPLEX_REASONING]: ['logical reasoning', 'problem solving'],
      [AIScenario.RELATIONSHIP_DETECTION]: ['relationship analysis'],
      [AIScenario.CONTENT_CATEGORIZATION]: ['categorization'],
      [AIScenario.SENTIMENT_ANALYSIS]: ['sentiment detection'],
      [AIScenario.STRATEGIC_PLANNING]: ['planning', 'strategy'],
      [AIScenario.GENERAL_THINKING]: ['general analysis']
    }
    
    return capabilityMap[scenario] || ['general analysis']
  }

  private generateProcessingSteps(scenario: AIScenario, selectedAIs: any[]): ProcessingStep[] {
    const steps: ProcessingStep[] = []
    
    selectedAIs.forEach((ai, index) => {
      steps.push({
        name: `${ai.provider}分析`,
        description: `使用${ai.provider}进行${this.getScenarioDescription(scenario)}`,
        aiProvider: ai.provider,
        status: 'pending'
      })
    })
    
    if (selectedAIs.length > 1) {
      steps.push({
        name: '结果合成',
        description: '合成多个AI的分析结果',
        status: 'pending'
      })
    }
    
    return steps
  }

  private getScenarioDescription(scenario: AIScenario): string {
    const descriptions: { [key in AIScenario]: string } = {
      [AIScenario.QUICK_CLASSIFICATION]: '快速分类',
      [AIScenario.CONTENT_SUMMARIZATION]: '内容总结',
      [AIScenario.DEEP_INSIGHT]: '深度洞察',
      [AIScenario.PHILOSOPHICAL_THINKING]: '哲学思辨',
      [AIScenario.CREATIVE_INSPIRATION]: '创意激发',
      [AIScenario.SEARCH_OPTIMIZATION]: '搜索优化',
      [AIScenario.KNOWLEDGE_LINKING]: '知识关联',
      [AIScenario.LIVE_ANALYSIS]: '实时分析',
      [AIScenario.FILE_PROCESSING]: '文件处理',
      [AIScenario.AUTO_TAGGING]: '自动标签',
      [AIScenario.COMPLEX_REASONING]: '复杂推理',
      [AIScenario.RELATIONSHIP_DETECTION]: '关系检测',
      [AIScenario.CONTENT_CATEGORIZATION]: '内容分类',
      [AIScenario.SENTIMENT_ANALYSIS]: '情感分析',
      [AIScenario.STRATEGIC_PLANNING]: '战略规划',
      [AIScenario.GENERAL_THINKING]: '通用分析'
    }
    
    return descriptions[scenario] || '分析处理'
  }

  private estimateProcessingTime(scenario: AIScenario, selectedAIs: any[]): number {
    const baseTime = 2000 // 2秒基础时间
    const aiTime = selectedAIs.length * 1500 // 每个AI增加1.5秒
    
    const scenarioMultiplier: { [key in AIScenario]: number } = {
      [AIScenario.QUICK_CLASSIFICATION]: 0.5,
      [AIScenario.LIVE_ANALYSIS]: 0.6,
      [AIScenario.AUTO_TAGGING]: 0.7,
      [AIScenario.CONTENT_CATEGORIZATION]: 0.8,
      [AIScenario.SENTIMENT_ANALYSIS]: 0.8,
      [AIScenario.SEARCH_OPTIMIZATION]: 0.9,
      [AIScenario.CONTENT_SUMMARIZATION]: 1.0,
      [AIScenario.KNOWLEDGE_LINKING]: 1.2,
      [AIScenario.RELATIONSHIP_DETECTION]: 1.2,
      [AIScenario.CREATIVE_INSPIRATION]: 1.3,
      [AIScenario.FILE_PROCESSING]: 1.5,
      [AIScenario.DEEP_INSIGHT]: 1.8,
      [AIScenario.COMPLEX_REASONING]: 2.0,
      [AIScenario.PHILOSOPHICAL_THINKING]: 2.2,
      [AIScenario.STRATEGIC_PLANNING]: 2.5,
      [AIScenario.GENERAL_THINKING]: 1.0
    }
    
    return (baseTime + aiTime) * (scenarioMultiplier[scenario] || 1.0)
  }

  private estimateQuickConfidence(content: string, scenario: AIScenario): number {
    let confidence = 0.6 // 基础置信度
    
    // 内容长度影响
    if (content.length > 100) confidence += 0.1
    if (content.length > 200) confidence += 0.1
    
    // 特定模式匹配
    if (scenario === AIScenario.QUICK_CLASSIFICATION && content.length < 50) {
      confidence += 0.2
    }
    
    if (scenario === AIScenario.DEEP_INSIGHT && /为什么|如何|怎样/.test(content)) {
      confidence += 0.2
    }
    
    return Math.min(confidence, 1.0)
  }

  private estimateCost(results: AITaskResult[]): number {
    // 简化的成本估算
    const costPerRequest: { [provider: string]: number } = {
      'openai': 0.02,
      'claude': 0.015,
      'gemini': 0.01,
      'deepseek': 0.005,
      'zhipu': 0.008,
      'moonshot': 0.01,
      'qwen': 0.006,
      'wenxin': 0.008,
      'doubao': 0.005
    }
    
    return results.reduce((total, result) => {
      return total + (costPerRequest[result.provider] || 0.01)
    }, 0)
  }

  private getAIConfig(provider: string): AIConfig | null {
    try {
      const config = JSON.parse(localStorage.getItem('thinkmate-ai-config') || '{}')
      if (config.provider === provider) {
        return config
      }
      
      // 如果当前配置不匹配，返回默认配置
      return {
        provider: provider as any,
        apiKey: '', // 在实际使用中需要有效的API密钥
        model: this.getDefaultModel(provider)
      }
    } catch {
      return null
    }
  }

  private getDefaultModel(provider: string): string {
    const defaultModels: { [provider: string]: string } = {
      'openai': 'gpt-4o-mini',
      'claude': 'claude-3-haiku-20240307',
      'gemini': 'gemini-1.5-flash',
      'deepseek': 'deepseek-chat',
      'zhipu': 'glm-4-flash',
      'moonshot': 'moonshot-v1-8k',
      'qwen': 'qwen-turbo',
      'wenxin': 'ernie-4.0-turbo-8k',
      'doubao': 'doubao-lite-4k'
    }
    
    return defaultModels[provider] || 'gpt-4o-mini'
  }
}

// 单例导出
export const aiOrchestrator = new AIOrchestrator()