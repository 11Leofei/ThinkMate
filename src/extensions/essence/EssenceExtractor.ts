/**
 * 🍎 Essence Extractor - Jobs' Magical Curation
 * "Innovation is saying no to a thousand things to find the one thing that matters."
 * 
 * Like iOS Year in Review - find the gems hidden in the everyday.
 */

export interface ThoughtEssence {
  id: string;
  originalThought: string;
  essenceText: string;
  category: 'breakthrough' | 'wisdom' | 'pattern' | 'question' | 'connection';
  impactScore: number;        // 0-100, how significant this thought is
  timestamp: number;
  connectedThoughts: string[]; // IDs of related thoughts
  tags: string[];
}

export interface EssenceCollection {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: number;
  endDate: number;
  title: string;              // AI-generated poetic title
  summary: string;            // Beautiful narrative summary
  keyThemes: string[];        // Main thinking themes
  breakthroughs: ThoughtEssence[];
  patterns: ThoughtEssence[];
  questions: ThoughtEssence[];
  growthMoments: ThoughtEssence[];
  stats: {
    totalThoughts: number;
    qualityGrowth: number;     // % improvement in thinking quality
    deepestDay: string;        // Date with highest quality thoughts
    mostActiveHour: number;    // Hour with most thinking activity
    thinkingStreak: number;    // Longest consecutive days of thinking
  };
}

export interface EssenceInsight {
  type: 'evolution' | 'recurring_theme' | 'blind_spot' | 'strength';
  title: string;
  description: string;
  evidence: string[];         // Supporting thought excerpts
  recommendation?: string;
}

class EssenceExtractor {
  private static instance: EssenceExtractor;
  
  public static getInstance(): EssenceExtractor {
    if (!EssenceExtractor.instance) {
      EssenceExtractor.instance = new EssenceExtractor();
    }
    return EssenceExtractor.instance;
  }

  /**
   * 🎯 Extract weekly essence - like getting your best photos auto-selected
   * Jobs: "Simplicity is the ultimate sophistication"
   */
  public async extractWeeklyEssence(): Promise<EssenceCollection> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    return this.extractEssenceForPeriod('week', weekStart.getTime(), now.getTime());
  }

  /**
   * 📅 Extract monthly essence - deeper patterns emerge
   */
  public async extractMonthlyEssence(): Promise<EssenceCollection> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return this.extractEssenceForPeriod('month', monthStart.getTime(), now.getTime());
  }

  /**
   * 🎨 Extract custom period essence
   */
  public async extractEssenceForPeriod(
    period: 'week' | 'month' | 'quarter' | 'year',
    startDate: number,
    endDate: number
  ): Promise<EssenceCollection> {
    
    const thoughts = await this.getThoughtsInPeriod(startDate, endDate);
    if (thoughts.length === 0) {
      return this.createEmptyCollection(period, startDate, endDate);
    }

    // Jobs' approach: find the exceptional, ignore the ordinary
    const essences = await this.extractEssencesFromThoughts(thoughts);
    const categorized = this.categorizeEssences(essences);
    const insights = this.generatePeriodInsights(essences, thoughts);
    const stats = this.calculatePeriodStats(thoughts, startDate, endDate);

    return {
      period,
      startDate,
      endDate,
      title: this.generatePoeticeTitle(categorized, period),
      summary: this.generateNarrativeSummary(categorized, insights, period),
      keyThemes: this.extractKeyThemes(essences),
      breakthroughs: categorized.breakthroughs,
      patterns: categorized.patterns,
      questions: categorized.questions,
      growthMoments: categorized.growthMoments,
      stats
    };
  }

  /**
   * 💎 Find single most impactful thought - the crown jewel
   * Jobs: "Focus is about saying no"
   */
  public async findCrownJewel(thoughts: any[]): Promise<ThoughtEssence | null> {
    if (thoughts.length === 0) return null;

    const essences = await this.extractEssencesFromThoughts(thoughts);
    if (essences.length === 0) return null;

    // Sort by impact score and return the highest
    essences.sort((a, b) => b.impactScore - a.impactScore);
    return essences[0];
  }

  /**
   * 🔍 Identify thinking evolution over time
   */
  public async analyzeThinkingEvolution(months: number = 6): Promise<EssenceInsight[]> {
    const insights: EssenceInsight[] = [];
    const now = Date.now();
    const periodStart = now - (months * 30 * 24 * 60 * 60 * 1000);

    const collections = await this.getEssenceCollectionsInPeriod(periodStart, now);
    
    // Analyze quality evolution
    const qualityEvolution = this.analyzeQualityEvolution(collections);
    if (qualityEvolution) {
      insights.push(qualityEvolution);
    }

    // Find recurring themes
    const recurringThemes = this.findRecurringThemes(collections);
    insights.push(...recurringThemes);

    // Identify thinking strengths
    const strengths = this.identifyThinkingStrengths(collections);
    if (strengths) {
      insights.push(strengths);
    }

    return insights;
  }

  // 🛠️ Private helper methods - Jobs' attention to detail

  private async getThoughtsInPeriod(startDate: number, endDate: number): Promise<any[]> {
    // This would normally fetch from storage
    // For now, return mock data or integrate with existing storage
    try {
      const stored = localStorage.getItem('thinkmate_thoughts');
      if (!stored) return [];
      
      const allThoughts = JSON.parse(stored);
      return allThoughts.filter((t: any) => 
        t.timestamp >= startDate && t.timestamp <= endDate
      );
    } catch (error) {
      console.warn('Could not load thoughts:', error);
      return [];
    }
  }

  private async extractEssencesFromThoughts(thoughts: any[]): Promise<ThoughtEssence[]> {
    const essences: ThoughtEssence[] = [];

    for (const thought of thoughts) {
      const essence = await this.extractSingleEssence(thought);
      if (essence && essence.impactScore > 60) { // Only include high-impact thoughts
        essences.push(essence);
      }
    }

    return essences;
  }

  private async extractSingleEssence(thought: any): Promise<ThoughtEssence | null> {
    const content = thought.content || thought.text || '';
    if (content.length < 20) return null; // Too short to be meaningful

    // AI-powered essence extraction (simplified for now)
    const impactScore = this.calculateImpactScore(content);
    const category = this.categorizeThought(content);
    const essenceText = this.distillEssence(content);

    if (impactScore < 50) return null; // Not impactful enough

    return {
      id: thought.id || Date.now().toString(),
      originalThought: content,
      essenceText,
      category,
      impactScore,
      timestamp: thought.timestamp || Date.now(),
      connectedThoughts: this.findConnectedThoughts(content, thought.id),
      tags: this.extractTags(content)
    };
  }

  private calculateImpactScore(content: string): number {
    let score = 40; // Base score

    // Length and depth indicators
    if (content.length > 200) score += 10;
    if (content.length > 500) score += 10;

    // Quality indicators
    if (this.hasQuestions(content)) score += 15;
    if (this.hasInsights(content)) score += 20;
    if (this.hasConnections(content)) score += 15;
    if (this.hasMetacognition(content)) score += 20;
    if (this.hasEmotionalDepth(content)) score += 10;

    // Breakthrough indicators
    if (this.hasBreakthroughLanguage(content)) score += 25;
    if (this.hasSynthesis(content)) score += 20;

    return Math.min(100, score);
  }

  private categorizeThought(content: string): ThoughtEssence['category'] {
    if (this.hasBreakthroughLanguage(content)) return 'breakthrough';
    if (this.hasQuestions(content)) return 'question';
    if (this.hasConnections(content)) return 'connection';
    if (this.hasPatternRecognition(content)) return 'pattern';
    return 'wisdom';
  }

  private distillEssence(content: string): string {
    // Find the most impactful sentence or phrase
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    
    if (sentences.length === 0) return content.substring(0, 100);
    if (sentences.length === 1) return sentences[0];

    // Simple heuristic: find sentence with most impact words
    const impactWords = ['realize', 'discover', 'understand', 'insight', 'breakthrough', 'connect', 'pattern', 'why', 'because', 'therefore'];
    
    let bestSentence = sentences[0];
    let bestScore = 0;

    for (const sentence of sentences) {
      const score = impactWords.reduce((count, word) => 
        count + (sentence.toLowerCase().includes(word) ? 1 : 0), 0
      );
      
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    }

    return bestSentence.length > 200 ? bestSentence.substring(0, 200) + '...' : bestSentence;
  }

  private categorizeEssences(essences: ThoughtEssence[]): {
    breakthroughs: ThoughtEssence[];
    patterns: ThoughtEssence[];
    questions: ThoughtEssence[];
    growthMoments: ThoughtEssence[];
  } {
    return {
      breakthroughs: essences.filter(e => e.category === 'breakthrough').slice(0, 5),
      patterns: essences.filter(e => e.category === 'pattern').slice(0, 5),
      questions: essences.filter(e => e.category === 'question').slice(0, 3),
      growthMoments: essences
        .filter(e => e.impactScore > 80)
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 3)
    };
  }

  private generatePoeticeTitle(categorized: any, period: string): string {
    const templates = {
      week: [
        "Seven Days of Discovery",
        "A Week of Wonder",
        "Weekly Wisdom Unfolds",
        "This Week's Thinking Journey"
      ],
      month: [
        "A Month of Mental Exploration",
        "Thirty Days of Deep Thought",
        "Monthly Mindscapes",
        "This Month's Cognitive Canvas"
      ]
    };

    const periodTemplates = templates[period as keyof typeof templates] || templates.week;
    return periodTemplates[Math.floor(Math.random() * periodTemplates.length)];
  }

  private generateNarrativeSummary(categorized: any, insights: EssenceInsight[], period: string): string {
    const breakthroughCount = categorized.breakthroughs.length;
    const patternCount = categorized.patterns.length;
    const questionCount = categorized.questions.length;

    if (breakthroughCount === 0 && patternCount === 0) {
      return `This ${period} was a time of gentle reflection and building thoughts. Every great mind has quiet periods that prepare for the next breakthrough.`;
    }

    let summary = `This ${period} brought `;
    
    if (breakthroughCount > 0) {
      summary += `${breakthroughCount} breakthrough moment${breakthroughCount > 1 ? 's' : ''} `;
    }
    
    if (patternCount > 0) {
      summary += `and ${patternCount} pattern recognition${patternCount > 1 ? 's' : ''} `;
    }
    
    if (questionCount > 0) {
      summary += `along with ${questionCount} deep question${questionCount > 1 ? 's' : ''} `;
    }

    summary += "that shaped your thinking landscape.";

    return summary;
  }

  private extractKeyThemes(essences: ThoughtEssence[]): string[] {
    const allTags = essences.flatMap(e => e.tags);
    const tagCounts = new Map<string, number>();
    
    allTags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  private calculatePeriodStats(thoughts: any[], startDate: number, endDate: number): EssenceCollection['stats'] {
    if (thoughts.length === 0) {
      return {
        totalThoughts: 0,
        qualityGrowth: 0,
        deepestDay: new Date(startDate).toDateString(),
        mostActiveHour: 10,
        thinkingStreak: 0
      };
    }

    // Calculate quality growth
    const firstHalf = thoughts.slice(0, Math.floor(thoughts.length / 2));
    const secondHalf = thoughts.slice(Math.floor(thoughts.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, t) => sum + (t.qualityScore || 50), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + (t.qualityScore || 50), 0) / secondHalf.length;
    const qualityGrowth = Math.round(((secondAvg - firstAvg) / firstAvg) * 100);

    // Find deepest day (highest average quality)
    const dailyQuality = new Map<string, number[]>();
    thoughts.forEach(t => {
      const day = new Date(t.timestamp).toDateString();
      if (!dailyQuality.has(day)) {
        dailyQuality.set(day, []);
      }
      dailyQuality.get(day)!.push(t.qualityScore || 50);
    });

    let deepestDay = new Date(startDate).toDateString();
    let highestAvg = 0;
    
    dailyQuality.forEach((scores, day) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        deepestDay = day;
      }
    });

    // Find most active hour
    const hourCounts = new Map<number, number>();
    thoughts.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const mostActiveHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 10;

    return {
      totalThoughts: thoughts.length,
      qualityGrowth,
      deepestDay,
      mostActiveHour,
      thinkingStreak: this.calculateThinkingStreak(thoughts)
    };
  }

  private calculateThinkingStreak(thoughts: any[]): number {
    if (thoughts.length === 0) return 0;

    const days = new Set(thoughts.map(t => 
      new Date(t.timestamp).toDateString()
    ));

    // Simple streak calculation - consecutive days
    const sortedDays = Array.from(days).sort();
    let streak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const current = new Date(sortedDays[i]);
      const previous = new Date(sortedDays[i - 1]);
      const diffDays = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }

    return maxStreak;
  }

  // Content analysis helpers - Jobs would love these micro-details

  private hasQuestions(content: string): boolean {
    return /\?|why|how|what if|wonder|curious/.test(content.toLowerCase());
  }

  private hasInsights(content: string): boolean {
    return /realize|understand|insight|dawn on me|click|aha|eureka/.test(content.toLowerCase());
  }

  private hasConnections(content: string): boolean {
    return /connect|link|similar|reminds me|like|parallel|analogy/.test(content.toLowerCase());
  }

  private hasMetacognition(content: string): boolean {
    return /thinking about thinking|meta|process|how I think|my mind/.test(content.toLowerCase());
  }

  private hasEmotionalDepth(content: string): boolean {
    return /feel|emotion|heart|soul|deeply|profound|moving/.test(content.toLowerCase());
  }

  private hasBreakthroughLanguage(content: string): boolean {
    return /breakthrough|eureka|suddenly|finally understand|game changer|revolutionary/.test(content.toLowerCase());
  }

  private hasSynthesis(content: string): boolean {
    return /combine|synthesis|merge|integrate|bring together|unify/.test(content.toLowerCase());
  }

  private hasPatternRecognition(content: string): boolean {
    return /pattern|recurring|always|tend to|notice|observe|repeat/.test(content.toLowerCase());
  }

  private findConnectedThoughts(content: string, thoughtId: string): string[] {
    // This would normally use semantic similarity
    // For now, return empty array
    return [];
  }

  private extractTags(content: string): string[] {
    // Simple keyword extraction
    const keywords = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 3);
    
    return [...new Set(keywords)];
  }

  private createEmptyCollection(period: string, startDate: number, endDate: number): EssenceCollection {
    return {
      period: period as any,
      startDate,
      endDate,
      title: `A Quiet ${period.charAt(0).toUpperCase() + period.slice(1)}`,
      summary: `This ${period} was a time for reflection. Sometimes the mind prepares in silence for the next wave of insights.`,
      keyThemes: [],
      breakthroughs: [],
      patterns: [],
      questions: [],
      growthMoments: [],
      stats: {
        totalThoughts: 0,
        qualityGrowth: 0,
        deepestDay: new Date(startDate).toDateString(),
        mostActiveHour: 10,
        thinkingStreak: 0
      }
    };
  }

  private generatePeriodInsights(essences: ThoughtEssence[], thoughts: any[]): EssenceInsight[] {
    // This would generate deeper insights
    return [];
  }

  private async getEssenceCollectionsInPeriod(startDate: number, endDate: number): Promise<EssenceCollection[]> {
    // This would fetch historical collections
    return [];
  }

  private analyzeQualityEvolution(collections: EssenceCollection[]): EssenceInsight | null {
    // This would analyze quality trends over time
    return null;
  }

  private findRecurringThemes(collections: EssenceCollection[]): EssenceInsight[] {
    // This would find patterns across multiple periods
    return [];
  }

  private identifyThinkingStrengths(collections: EssenceCollection[]): EssenceInsight | null {
    // This would identify consistent strengths
    return null;
  }
}

export default EssenceExtractor;