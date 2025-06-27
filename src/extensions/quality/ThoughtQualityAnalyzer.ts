/**
 * 🍎 Jobs' Thought Quality Analyzer
 * "Simplicity is the ultimate sophistication in thought analysis."
 * 
 * Like iPhone battery health - one number that tells you everything.
 */

export interface QualityMetrics {
  clarity: number;        // How clear and focused the thought is (0-100)
  depth: number;          // How deep the thinking goes (0-100)
  originality: number;    // How original/creative the thought is (0-100)
  coherence: number;      // How well structured the thought is (0-100)
  overall: number;        // Overall quality score (0-100)
  trend: 'improving' | 'stable' | 'declining';
}

export interface ThoughtQualityProfile {
  currentScore: number;
  peak: number;
  average: number;
  recentTrend: 'up' | 'down' | 'stable';
  strongSuits: string[];
  growthAreas: string[];
}

class ThoughtQualityAnalyzer {
  private static instance: ThoughtQualityAnalyzer;
  
  public static getInstance(): ThoughtQualityAnalyzer {
    if (!ThoughtQualityAnalyzer.instance) {
      ThoughtQualityAnalyzer.instance = new ThoughtQualityAnalyzer();
    }
    return ThoughtQualityAnalyzer.instance;
  }

  /**
   * 🎯 The Jobs Method: Analyze thought quality like we analyze battery health
   * Simple, immediate, actionable.
   */
  public analyzeThought(content: string): QualityMetrics {
    const clarity = this.assessClarity(content);
    const depth = this.assessDepth(content);
    const originality = this.assessOriginality(content);
    const coherence = this.assessCoherence(content);
    
    // Jobs' weighted formula - clarity and depth matter most
    const overall = Math.round(
      clarity * 0.35 +       // Clear thinking is paramount
      depth * 0.35 +         // Deep thinking creates value
      coherence * 0.20 +     // Structure enables understanding
      originality * 0.10     // Creativity is the cherry on top
    );

    return {
      clarity,
      depth,
      originality,
      coherence,
      overall,
      trend: this.calculateTrend(overall)
    };
  }

  /**
   * 🔍 Assess Clarity: Is the thought focused and precise?
   * Jobs: "Simplicity is the ultimate sophistication"
   */
  private assessClarity(content: string): number {
    let score = 50; // Start neutral
    
    // Positive indicators
    if (content.length > 20 && content.length < 500) score += 15; // Good length
    if (this.hasSpecificExamples(content)) score += 10;
    if (this.usesConcreteLanguage(content)) score += 15;
    if (this.hasClearStructure(content)) score += 10;
    
    // Negative indicators
    if (this.hasFillerWords(content)) score -= 10;
    if (this.isOverlyVague(content)) score -= 15;
    if (this.hasMultipleTopics(content)) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 🏔️ Assess Depth: Does the thought dig beneath the surface?
   * Jobs: "Stay hungry, stay foolish" - but think deep
   */
  private assessDepth(content: string): number {
    let score = 30; // Start lower - depth is rare
    
    // Depth indicators
    if (this.hasWhyQuestions(content)) score += 20;
    if (this.exploresImplications(content)) score += 15;
    if (this.connectsToLargerPattern(content)) score += 15;
    if (this.challengesAssumptions(content)) score += 10;
    if (this.considersMultiplePerspectives(content)) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * ✨ Assess Originality: Is this a fresh perspective?
   * Jobs: "Innovation distinguishes between a leader and a follower"
   */
  private assessOriginality(content: string): number {
    let score = 40; // Most thoughts are derivative
    
    // Originality indicators
    if (this.hasUnexpectedConnections(content)) score += 20;
    if (this.challengesConventionalWisdom(content)) score += 15;
    if (this.usesNovelMetaphors(content)) score += 10;
    if (this.proposesNewSolutions(content)) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 🏗️ Assess Coherence: Is the thought well-structured?
   * Jobs: "Details are not details. They make the design."
   */
  private assessCoherence(content: string): number {
    let score = 50;
    
    // Structure indicators
    if (this.hasLogicalFlow(content)) score += 15;
    if (this.hasConclusion(content)) score += 10;
    if (this.usesTransitions(content)) score += 10;
    if (this.staysOnTopic(content)) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * 📈 Calculate trend based on recent scores
   */
  private calculateTrend(currentScore: number): 'improving' | 'stable' | 'declining' {
    // This would normally use historical data
    // For now, return stable as default
    return 'stable';
  }

  // 🛠️ Helper methods for content analysis
  private hasSpecificExamples(content: string): boolean {
    return /for example|such as|like when|specifically|instance/.test(content.toLowerCase());
  }

  private usesConcreteLanguage(content: string): boolean {
    const abstractWords = /generally|usually|often|sometimes|maybe|perhaps|might|could/gi;
    const concreteWords = /exactly|specifically|precisely|definitely|clearly|directly/gi;
    return (content.match(concreteWords) || []).length > (content.match(abstractWords) || []).length;
  }

  private hasClearStructure(content: string): boolean {
    return /first|second|third|then|next|finally|because|therefore|however|but/.test(content.toLowerCase());
  }

  private hasFillerWords(content: string): boolean {
    const fillers = /um|uh|like|you know|sort of|kind of|just thinking|random thought/gi;
    return (content.match(fillers) || []).length > 2;
  }

  private isOverlyVague(content: string): boolean {
    const vagueWords = /thing|stuff|something|anything|whatever|somehow|somewhere/gi;
    return (content.match(vagueWords) || []).length > 2;
  }

  private hasMultipleTopics(content: string): boolean {
    const topics = content.split(/[.!?]/).filter(s => s.trim().length > 10);
    if (topics.length < 2) return false;
    
    // Simple heuristic: if sentences seem unrelated, multiple topics
    return topics.length > 3 && content.includes('also') && content.includes('another');
  }

  private hasWhyQuestions(content: string): boolean {
    return /why|what if|how come|what's the reason|what causes/.test(content.toLowerCase());
  }

  private exploresImplications(content: string): boolean {
    return /this means|implications|consequences|leads to|results in|if this then/.test(content.toLowerCase());
  }

  private connectsToLargerPattern(content: string): boolean {
    return /pattern|trend|similar to|reminds me of|connects to|part of larger/.test(content.toLowerCase());
  }

  private challengesAssumptions(content: string): boolean {
    return /but what if|assumption|take for granted|challenge|question|doubt/.test(content.toLowerCase());
  }

  private considersMultiplePerspectives(content: string): boolean {
    return /on the other hand|alternatively|from another view|different perspective|others might/.test(content.toLowerCase());
  }

  private hasUnexpectedConnections(content: string): boolean {
    return /surprisingly|unexpectedly|never thought|interesting connection|unlike/.test(content.toLowerCase());
  }

  private challengesConventionalWisdom(content: string): boolean {
    return /conventional wisdom|everyone thinks|common belief|challenge the idea|disagree/.test(content.toLowerCase());
  }

  private usesNovelMetaphors(content: string): boolean {
    return /like a|similar to|as if|metaphorically|imagine if/.test(content.toLowerCase());
  }

  private proposesNewSolutions(content: string): boolean {
    return /what if we|new way|different approach|alternative|innovative|solution/.test(content.toLowerCase());
  }

  private hasLogicalFlow(content: string): boolean {
    return /because|since|therefore|thus|as a result|consequently/.test(content.toLowerCase());
  }

  private hasConclusion(content: string): boolean {
    return /in conclusion|therefore|so|ultimately|the point is|what this means/.test(content.toLowerCase());
  }

  private usesTransitions(content: string): boolean {
    return /however|meanwhile|furthermore|moreover|additionally|on the contrary/.test(content.toLowerCase());
  }

  private staysOnTopic(content: string): boolean {
    // Simple heuristic: fewer topic changes = better coherence
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 5);
    return sentences.length > 0 && sentences.length < 5; // Not too scattered
  }
}

export default ThoughtQualityAnalyzer;