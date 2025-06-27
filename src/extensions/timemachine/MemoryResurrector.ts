/**
 * 🍎 Memory Resurrector - Jobs' Time Machine for Thoughts
 * "The best ideas shouldn't disappear. They should bloom again at the perfect moment."
 * 
 * Like iPhone's intelligent app suggestions - surface what you need before you know you need it.
 */

export interface ThoughtMemory {
  id: string;
  content: string;
  timestamp: number;
  context: string;           // What was happening when this thought occurred
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'excited' | 'contemplative';
  qualityScore: number;
  tags: string[];
  connectionStrength: number; // How related to current thought (0-100)
}

export interface MemoryCluster {
  theme: string;             // Common theme of memories
  memories: ThoughtMemory[];
  timeSpan: string;          // "Last week", "3 months ago", etc.
  significance: 'high' | 'medium' | 'low';
  emotionalJourney: string;  // Narrative of how thinking evolved
}

export interface ResurrectionMoment {
  type: 'serendipity' | 'evolution' | 'pattern' | 'forgotten_gem';
  triggeredBy: string;       // What current thought triggered this
  resurrectedMemory: ThoughtMemory;
  connectionReason: string;  // Why this memory is relevant now
  suggestedAction: string;   // What to do with this rediscovered insight
}

class MemoryResurrector {
  private static instance: MemoryResurrector;
  private memoryBank: ThoughtMemory[] = [];
  private readonly STORAGE_KEY = 'thinkmate_memory_bank';
  private readonly RELEVANCE_THRESHOLD = 65;

  public static getInstance(): MemoryResurrector {
    if (!MemoryResurrector.instance) {
      MemoryResurrector.instance = new MemoryResurrector();
    }
    return MemoryResurrector.instance;
  }

  constructor() {
    this.loadMemoryBank();
  }

  /**
   * 🧠 Add new thought to memory bank
   * Jobs: "Every moment of brilliance deserves to be remembered"
   */
  public storeMemory(content: string, qualityScore: number, context?: string): void {
    const memory: ThoughtMemory = {
      id: this.generateMemoryId(),
      content,
      timestamp: Date.now(),
      context: context || this.inferContext(),
      emotionalTone: this.detectEmotionalTone(content),
      qualityScore,
      tags: this.extractTags(content),
      connectionStrength: 0 // Will be calculated when retrieving
    };

    this.memoryBank.push(memory);
    
    // Keep only meaningful memories (quality > 50) and limit to 500 memories
    this.memoryBank = this.memoryBank
      .filter(m => m.qualityScore > 50)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 500);

    this.saveMemoryBank();
  }

  /**
   * 🔍 Find relevant memories for current thought
   * Jobs: "The right memory at the right moment is pure magic"
   */
  public async resurrectRelevantMemories(currentThought: string): Promise<ResurrectionMoment[]> {
    if (this.memoryBank.length === 0) return [];

    const relevantMemories = await this.findSemanticMatches(currentThought);
    const moments: ResurrectionMoment[] = [];

    for (const memory of relevantMemories) {
      if (memory.connectionStrength > this.RELEVANCE_THRESHOLD) {
        const moment = this.createResurrectionMoment(currentThought, memory);
        if (moment) {
          moments.push(moment);
        }
      }
    }

    // Sort by relevance and return top 3
    return moments
      .sort((a, b) => b.resurrectedMemory.connectionStrength - a.resurrectedMemory.connectionStrength)
      .slice(0, 3);
  }

  /**
   * 📚 Get memory clusters by theme
   * Jobs: "Patterns in the chaos reveal the deeper truth"
   */
  public getMemoryClusters(): MemoryCluster[] {
    if (this.memoryBank.length < 5) return [];

    const clusters = new Map<string, ThoughtMemory[]>();
    
    // Group memories by similar themes
    for (const memory of this.memoryBank) {
      const theme = this.identifyTheme(memory);
      if (!clusters.has(theme)) {
        clusters.set(theme, []);
      }
      clusters.get(theme)!.push(memory);
    }

    return Array.from(clusters.entries())
      .filter(([, memories]) => memories.length >= 2) // At least 2 memories per cluster
      .map(([theme, memories]) => ({
        theme,
        memories: memories.sort((a, b) => b.timestamp - a.timestamp),
        timeSpan: this.calculateTimeSpan(memories),
        significance: this.calculateSignificance(memories),
        emotionalJourney: this.generateEmotionalJourney(memories)
      }))
      .sort((a, b) => b.memories.length - a.memories.length)
      .slice(0, 5); // Top 5 clusters
  }

  /**
   * 💎 Get forgotten gems - high quality memories that haven't been accessed
   * Jobs: "Sometimes the best ideas are the ones we've forgotten"
   */
  public getForgottenGems(): ThoughtMemory[] {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    return this.memoryBank
      .filter(memory => 
        memory.qualityScore > 80 && 
        memory.timestamp < oneMonthAgo
      )
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 3);
  }

  /**
   * 🌊 Get thinking evolution journey
   * Jobs: "See how far you've come in your thinking journey"
   */
  public getThinkingEvolution(): { period: string; averageQuality: number; dominantThemes: string[] }[] {
    if (this.memoryBank.length < 10) return [];

    const periods = this.groupByTimePeriods();
    
    return periods.map(period => ({
      period: period.name,
      averageQuality: period.memories.reduce((sum, m) => sum + m.qualityScore, 0) / period.memories.length,
      dominantThemes: this.getDominantThemes(period.memories)
    }));
  }

  // 🛠️ Private helper methods - Jobs' attention to implementation excellence

  private async findSemanticMatches(currentThought: string): Promise<ThoughtMemory[]> {
    // Simple semantic matching based on keywords and concepts
    const currentWords = this.extractKeywords(currentThought.toLowerCase());
    
    return this.memoryBank.map(memory => {
      const memoryWords = this.extractKeywords(memory.content.toLowerCase());
      const commonWords = currentWords.filter(word => memoryWords.includes(word));
      
      // Calculate connection strength
      let connectionStrength = (commonWords.length / Math.max(currentWords.length, memoryWords.length)) * 100;
      
      // Boost connection for high-quality memories
      if (memory.qualityScore > 80) {
        connectionStrength *= 1.2;
      }
      
      // Boost recent memories slightly
      const daysSinceCreation = (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        connectionStrength *= 1.1;
      }
      
      return {
        ...memory,
        connectionStrength: Math.min(100, connectionStrength)
      };
    });
  }

  private createResurrectionMoment(currentThought: string, memory: ThoughtMemory): ResurrectionMoment | null {
    const type = this.determineResurrectionType(currentThought, memory);
    const connectionReason = this.explainConnection(currentThought, memory);
    const suggestedAction = this.suggestAction(type, memory);

    return {
      type,
      triggeredBy: currentThought.substring(0, 100) + '...',
      resurrectedMemory: memory,
      connectionReason,
      suggestedAction
    };
  }

  private determineResurrectionType(currentThought: string, memory: ThoughtMemory): ResurrectionMoment['type'] {
    const timeDiff = Date.now() - memory.timestamp;
    const monthsAgo = timeDiff / (1000 * 60 * 60 * 24 * 30);

    if (monthsAgo > 3 && memory.qualityScore > 85) {
      return 'forgotten_gem';
    }
    
    if (this.hasEvolutionPattern(currentThought, memory.content)) {
      return 'evolution';
    }
    
    if (this.hasPatternMatch(currentThought, memory.content)) {
      return 'pattern';
    }
    
    return 'serendipity';
  }

  private explainConnection(currentThought: string, memory: ThoughtMemory): string {
    const explanations = [
      `Both thoughts explore similar themes and concepts`,
      `This memory provides valuable context for your current thinking`,
      `You've been developing this idea over time - here's where it started`,
      `This past insight might spark a new direction for your current thought`,
      `These thoughts share a deep conceptual connection`
    ];

    return explanations[Math.floor(Math.random() * explanations.length)];
  }

  private suggestAction(type: ResurrectionMoment['type'], memory: ThoughtMemory): string {
    const suggestions = {
      serendipity: `Consider how this past insight might illuminate your current thinking`,
      evolution: `Trace how your thinking has evolved and where it might go next`,
      pattern: `Explore the recurring pattern between these thoughts`,
      forgotten_gem: `Revisit this powerful insight and see how it applies today`
    };

    return suggestions[type];
  }

  private inferContext(): string {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    let timeContext = '';
    if (hour >= 5 && hour < 12) timeContext = 'morning';
    else if (hour >= 12 && hour < 17) timeContext = 'afternoon';
    else if (hour >= 17 && hour < 22) timeContext = 'evening';
    else timeContext = 'late night';
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return `${timeContext} on ${dayNames[day]}`;
  }

  private detectEmotionalTone(content: string): ThoughtMemory['emotionalTone'] {
    const positiveWords = /exciting|amazing|breakthrough|insight|wonderful|great|fantastic/i;
    const negativeWords = /worried|concerned|problem|difficult|challenge|frustrated/i;
    const excitedWords = /eureka|aha|discovered|realized|incredible/i;
    const contemplativeWords = /wonder|ponder|consider|reflect|think about/i;

    if (excitedWords.test(content)) return 'excited';
    if (positiveWords.test(content)) return 'positive';
    if (negativeWords.test(content)) return 'negative';
    if (contemplativeWords.test(content)) return 'contemplative';
    return 'neutral';
  }

  private extractTags(content: string): string[] {
    // Simple tag extraction based on key concepts
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);
    
    // Return unique words, limited to 5 tags
    return [...new Set(words)].slice(0, 5);
  }

  private extractKeywords(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 20); // Top 20 keywords
  }

  private identifyTheme(memory: ThoughtMemory): string {
    // Simple theme identification based on content analysis
    const content = memory.content.toLowerCase();
    
    if (/work|career|professional|business|project/i.test(content)) return 'Professional Growth';
    if (/relationship|family|friend|love|social/i.test(content)) return 'Relationships';
    if (/learn|study|knowledge|understand|education/i.test(content)) return 'Learning';
    if (/create|art|design|music|write|creative/i.test(content)) return 'Creativity';
    if (/health|exercise|wellness|mental|physical/i.test(content)) return 'Wellness';
    if (/future|goal|plan|dream|aspiration/i.test(content)) return 'Future Planning';
    if (/philosophy|meaning|purpose|life|existence/i.test(content)) return 'Life Philosophy';
    
    return 'General Reflection';
  }

  private calculateTimeSpan(memories: ThoughtMemory[]): string {
    if (memories.length === 0) return 'Unknown';
    
    const oldest = Math.min(...memories.map(m => m.timestamp));
    const newest = Math.max(...memories.map(m => m.timestamp));
    const daysDiff = (newest - oldest) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 7) return 'This week';
    if (daysDiff < 30) return 'This month';
    if (daysDiff < 90) return 'Past 3 months';
    return 'Over 3 months';
  }

  private calculateSignificance(memories: ThoughtMemory[]): 'high' | 'medium' | 'low' {
    const avgQuality = memories.reduce((sum, m) => sum + m.qualityScore, 0) / memories.length;
    
    if (avgQuality > 80) return 'high';
    if (avgQuality > 65) return 'medium';
    return 'low';
  }

  private generateEmotionalJourney(memories: ThoughtMemory[]): string {
    const tones = memories.map(m => m.emotionalTone);
    const uniqueTones = [...new Set(tones)];
    
    if (uniqueTones.length === 1) {
      return `A consistent ${uniqueTones[0]} exploration of this theme`;
    }
    
    return `A journey from ${tones[tones.length - 1]} to ${tones[0]} thinking`;
  }

  private groupByTimePeriods(): { name: string; memories: ThoughtMemory[] }[] {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    
    return [
      {
        name: 'This Week',
        memories: this.memoryBank.filter(m => now - m.timestamp < oneWeek)
      },
      {
        name: 'This Month',
        memories: this.memoryBank.filter(m => 
          now - m.timestamp >= oneWeek && now - m.timestamp < oneMonth
        )
      },
      {
        name: 'Earlier',
        memories: this.memoryBank.filter(m => now - m.timestamp >= oneMonth)
      }
    ].filter(period => period.memories.length > 0);
  }

  private getDominantThemes(memories: ThoughtMemory[]): string[] {
    const themeCount = new Map<string, number>();
    
    memories.forEach(memory => {
      const theme = this.identifyTheme(memory);
      themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
    });
    
    return Array.from(themeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);
  }

  private hasEvolutionPattern(current: string, past: string): boolean {
    // Simple check for evolution - similar concepts but different conclusions
    const currentWords = new Set(this.extractKeywords(current));
    const pastWords = new Set(this.extractKeywords(past));
    const overlap = [...currentWords].filter(word => pastWords.has(word)).length;
    
    return overlap >= 2 && current.length > past.length * 1.2;
  }

  private hasPatternMatch(current: string, past: string): boolean {
    // Check for recurring patterns or themes
    const currentWords = this.extractKeywords(current);
    const pastWords = this.extractKeywords(past);
    const commonWords = currentWords.filter(word => pastWords.includes(word));
    
    return commonWords.length >= 3;
  }

  private generateMemoryId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadMemoryBank(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.memoryBank = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load memory bank:', error);
      this.memoryBank = [];
    }
  }

  private saveMemoryBank(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryBank));
    } catch (error) {
      console.warn('Could not save memory bank:', error);
    }
  }
}

export default MemoryResurrector;