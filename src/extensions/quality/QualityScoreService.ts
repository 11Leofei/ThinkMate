/**
 * 🍎 Quality Score Service - The Jobs Way
 * "Make it simple, but not simpler." - Einstein via Jobs
 * 
 * Like iOS battery optimization - intelligent, background, essential.
 */

import ThoughtQualityAnalyzer, { QualityMetrics, ThoughtQualityProfile } from './ThoughtQualityAnalyzer';

interface QualityHistory {
  timestamp: number;
  score: number;
  category: 'peak' | 'good' | 'average' | 'low';
}

interface QualityInsight {
  type: 'strength' | 'improvement' | 'achievement' | 'concern';
  title: string;
  description: string;
  actionable: boolean;
}

class QualityScoreService {
  private static instance: QualityScoreService;
  private analyzer: ThoughtQualityAnalyzer;
  private qualityHistory: QualityHistory[] = [];
  private readonly STORAGE_KEY = 'thinkmate_quality_history';

  public static getInstance(): QualityScoreService {
    if (!QualityScoreService.instance) {
      QualityScoreService.instance = new QualityScoreService();
    }
    return QualityScoreService.instance;
  }

  constructor() {
    this.analyzer = ThoughtQualityAnalyzer.getInstance();
    this.loadHistory();
  }

  /**
   * 🎯 Main entry point: Analyze and record thought quality
   * Jobs philosophy: Make it effortless for the user
   */
  public async processThought(content: string): Promise<QualityMetrics> {
    const metrics = this.analyzer.analyzeThought(content);
    
    // Record in history
    this.recordQuality(metrics.overall);
    
    // Trigger background insights generation
    this.generateInsights();
    
    return metrics;
  }

  /**
   * 📊 Get the user's current quality profile
   * Like iPhone battery health - instant, meaningful, actionable
   */
  public getQualityProfile(): ThoughtQualityProfile {
    if (this.qualityHistory.length === 0) {
      return this.getDefaultProfile();
    }

    const scores = this.qualityHistory.map(h => h.score);
    const recentScores = scores.slice(-10); // Last 10 thoughts
    const currentScore = scores[scores.length - 1] || 0;
    
    return {
      currentScore,
      peak: Math.max(...scores),
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      recentTrend: this.calculateRecentTrend(recentScores),
      strongSuits: this.identifyStrengths(),
      growthAreas: this.identifyGrowthAreas()
    };
  }

  /**
   * 💡 Get personalized insights
   * Jobs: "People don't know what they want until you show it to them"
   */
  public getQualityInsights(): QualityInsight[] {
    const profile = this.getQualityProfile();
    const insights: QualityInsight[] = [];

    // Celebrate achievements
    if (profile.currentScore > profile.average + 10) {
      insights.push({
        type: 'achievement',
        title: 'Exceptional Thinking',
        description: `Your last thought scored ${profile.currentScore}% - above your personal average!`,
        actionable: false
      });
    }

    // Strength recognition
    if (profile.strongSuits.length > 0) {
      insights.push({
        type: 'strength',
        title: 'Your Thinking Strengths',
        description: `You excel at ${profile.strongSuits.join(' and ')}. Keep leveraging these skills.`,
        actionable: false
      });
    }

    // Improvement suggestions
    if (profile.growthAreas.length > 0) {
      insights.push({
        type: 'improvement',
        title: 'Growth Opportunity',
        description: `Consider exploring ${profile.growthAreas[0]} more deeply in your next thoughts.`,
        actionable: true
      });
    }

    // Trend warnings
    if (profile.recentTrend === 'down') {
      insights.push({
        type: 'concern',
        title: 'Thinking Quality Dip',
        description: 'Your recent thoughts seem less focused. Take a moment to center yourself.',
        actionable: true
      });
    }

    return insights;
  }

  /**
   * 📈 Get quality trend data for visualization
   * Jobs: "Design is not just what it looks like - design is how it works"
   */
  public getQualityTrendData(days: number = 30): Array<{date: string, score: number}> {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    return this.qualityHistory
      .filter(h => h.timestamp > cutoff)
      .map(h => ({
        date: new Date(h.timestamp).toISOString().split('T')[0],
        score: h.score
      }));
  }

  /**
   * 🎨 Get quality level description with Jobs-like copy
   */
  public getQualityDescription(score: number): {level: string, description: string, emoji: string} {
    if (score >= 90) {
      return {
        level: 'Exceptional',
        description: 'Thinking that changes everything. This is breakthrough territory.',
        emoji: '🚀'
      };
    } else if (score >= 80) {
      return {
        level: 'Excellent',
        description: 'Sharp, focused thinking. You\'re in the zone.',
        emoji: '⭐'
      };
    } else if (score >= 70) {
      return {
        level: 'Good',
        description: 'Solid thinking with room to go deeper.',
        emoji: '👍'
      };
    } else if (score >= 60) {
      return {
        level: 'Developing',
        description: 'Good foundation. Push yourself to explore further.',
        emoji: '🌱'
      };
    } else {
      return {
        level: 'Emerging',
        description: 'Every great thinker started here. Keep going.',
        emoji: '🤔'
      };
    }
  }

  // 🛠️ Private helper methods

  private recordQuality(score: number): void {
    const category = this.categorizeScore(score);
    
    this.qualityHistory.push({
      timestamp: Date.now(),
      score,
      category
    });

    // Keep only last 100 entries to avoid bloat
    if (this.qualityHistory.length > 100) {
      this.qualityHistory = this.qualityHistory.slice(-100);
    }

    this.saveHistory();
  }

  private categorizeScore(score: number): 'peak' | 'good' | 'average' | 'low' {
    if (score >= 85) return 'peak';
    if (score >= 70) return 'good';
    if (score >= 55) return 'average';
    return 'low';
  }

  private calculateRecentTrend(scores: number[]): 'up' | 'down' | 'stable' {
    if (scores.length < 3) return 'stable';
    
    const recent = scores.slice(-3);
    const earlier = scores.slice(-6, -3);
    
    if (earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    const diff = recentAvg - earlierAvg;
    
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  }

  private identifyStrengths(): string[] {
    // This would analyze historical data to identify consistent strengths
    // For now, return common strengths
    return ['clarity', 'depth'];
  }

  private identifyGrowthAreas(): string[] {
    // This would analyze weaknesses in recent thoughts
    // For now, return common growth areas
    return ['exploring implications', 'connecting to larger patterns'];
  }

  private getDefaultProfile(): ThoughtQualityProfile {
    return {
      currentScore: 0,
      peak: 0,
      average: 0,
      recentTrend: 'stable',
      strongSuits: [],
      growthAreas: ['thought depth', 'clarity of expression']
    };
  }

  private generateInsights(): void {
    // Background task to generate insights
    // Could trigger notifications or update dashboard
    setTimeout(() => {
      // Generate insights in background
      this.getQualityInsights();
    }, 100);
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.qualityHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load quality history:', error);
      this.qualityHistory = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.qualityHistory));
    } catch (error) {
      console.warn('Could not save quality history:', error);
    }
  }
}

export default QualityScoreService;
export type { QualityInsight, QualityHistory };