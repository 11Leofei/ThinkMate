/**
 * 🍎 Thinking Rhythm Detector - Jobs' Intuitive Intelligence
 * "The computer should anticipate what you need, not ask what you want."
 * 
 * Like iPhone's smart battery optimization - learns your patterns, serves your needs.
 */

export interface ThinkingSession {
  startTime: number;
  endTime?: number;
  thoughtCount: number;
  qualityScore: number;
  intensity: 'low' | 'medium' | 'high' | 'peak';
  context: string; // morning, afternoon, evening, late-night
}

export interface RhythmPattern {
  bestHours: number[];        // Hours when user thinks best (0-23)
  peakDays: string[];         // Days when thinking is strongest
  averageSessionLength: number; // Minutes
  optimalBreakTime: number;   // Minutes between sessions
  cognitiveType: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
  confidenceLevel: number;    // How confident we are in the pattern (0-100)
}

export interface RhythmInsight {
  type: 'optimal_time' | 'energy_dip' | 'breakthrough_moment' | 'rest_needed';
  message: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  timing: number; // When to show this (timestamp)
}

class ThinkingRhythmDetector {
  private static instance: ThinkingRhythmDetector;
  private sessions: ThinkingSession[] = [];
  private currentSession: ThinkingSession | null = null;
  private readonly STORAGE_KEY = 'thinkmate_rhythm_data';
  private readonly MIN_SESSIONS_FOR_PATTERN = 10;

  public static getInstance(): ThinkingRhythmDetector {
    if (!ThinkingRhythmDetector.instance) {
      ThinkingRhythmDetector.instance = new ThinkingRhythmDetector();
    }
    return ThinkingRhythmDetector.instance;
  }

  constructor() {
    this.loadData();
    this.setupActivityListeners();
  }

  /**
   * 🎯 Start tracking a thinking session
   * Jobs: "It just works" - seamless, invisible, automatic
   */
  public startSession(): void {
    if (this.currentSession) {
      this.endSession(); // End previous session
    }

    this.currentSession = {
      startTime: Date.now(),
      thoughtCount: 0,
      qualityScore: 0,
      intensity: 'low',
      context: this.getTimeContext()
    };
  }

  /**
   * 📝 Record a thought during the session
   */
  public recordThought(qualityScore: number): void {
    if (!this.currentSession) {
      this.startSession();
    }

    if (this.currentSession) {
      this.currentSession.thoughtCount++;
      
      // Update average quality score
      const totalQuality = this.currentSession.qualityScore * (this.currentSession.thoughtCount - 1) + qualityScore;
      this.currentSession.qualityScore = totalQuality / this.currentSession.thoughtCount;
      
      // Update intensity based on frequency and quality
      this.updateSessionIntensity();
    }
  }

  /**
   * ⏹️ End the current thinking session
   */
  public endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.sessions.push(this.currentSession);
      
      // Keep only last 100 sessions to avoid bloat
      if (this.sessions.length > 100) {
        this.sessions = this.sessions.slice(-100);
      }
      
      this.saveData();
      this.currentSession = null;
    }
  }

  /**
   * 🧠 Analyze and extract thinking patterns
   * Jobs: "People don't know what they want until you show it to them"
   */
  public analyzeRhythm(): RhythmPattern | null {
    if (this.sessions.length < this.MIN_SESSIONS_FOR_PATTERN) {
      return null;
    }

    const hourlyPerformance = this.analyzeHourlyPerformance();
    const dailyPatterns = this.analyzeDailyPatterns();
    const sessionMetrics = this.analyzeSessionMetrics();

    return {
      bestHours: this.identifyBestHours(hourlyPerformance),
      peakDays: this.identifyPeakDays(dailyPatterns),
      averageSessionLength: sessionMetrics.averageLength,
      optimalBreakTime: sessionMetrics.optimalBreak,
      cognitiveType: this.identifyCognitiveType(hourlyPerformance),
      confidenceLevel: this.calculateConfidence()
    };
  }

  /**
   * 💡 Generate personalized rhythm insights
   * Jobs: "Simplicity is about subtracting the obvious and adding the meaningful"
   */
  public generateInsights(): RhythmInsight[] {
    const pattern = this.analyzeRhythm();
    if (!pattern) return [];

    const insights: RhythmInsight[] = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Optimal time insights
    if (pattern.bestHours.includes(currentHour)) {
      insights.push({
        type: 'optimal_time',
        message: 'You\'re in your thinking prime time',
        recommendation: 'This is when your best ideas flow. Dive into deep work.',
        priority: 'high',
        timing: Date.now()
      });
    }

    // Energy dip detection
    const lowEnergyHours = this.identifyLowEnergyHours();
    if (lowEnergyHours.includes(currentHour)) {
      insights.push({
        type: 'energy_dip',
        message: 'Energy naturally dips around this time',
        recommendation: 'Perfect time for reflection or light review of past thoughts.',
        priority: 'medium',
        timing: Date.now()
      });
    }

    // Breakthrough moment prediction
    if (this.isPotentialBreakthroughTime()) {
      insights.push({
        type: 'breakthrough_moment',
        message: 'Breakthrough potential detected',
        recommendation: 'You\'ve been building up insights. Time for a creative leap.',
        priority: 'high',
        timing: Date.now()
      });
    }

    // Rest recommendations
    if (this.needsRest()) {
      insights.push({
        type: 'rest_needed',
        message: 'Your mind has been working hard',
        recommendation: 'Consider a short break to recharge your thinking.',
        priority: 'medium',
        timing: Date.now()
      });
    }

    return insights;
  }

  /**
   * 📊 Get current thinking state
   */
  public getCurrentState(): {
    isActive: boolean;
    sessionDuration: number;
    intensity: string;
    thoughtCount: number;
  } {
    if (!this.currentSession) {
      return {
        isActive: false,
        sessionDuration: 0,
        intensity: 'none',
        thoughtCount: 0
      };
    }

    return {
      isActive: true,
      sessionDuration: Math.floor((Date.now() - this.currentSession.startTime) / 1000 / 60), // minutes
      intensity: this.currentSession.intensity,
      thoughtCount: this.currentSession.thoughtCount
    };
  }

  // 🛠️ Private helper methods - Jobs loved perfect implementation details

  private getTimeContext(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'late-night';
  }

  private updateSessionIntensity(): void {
    if (!this.currentSession) return;

    const { thoughtCount, qualityScore } = this.currentSession;
    const sessionDuration = (Date.now() - this.currentSession.startTime) / 1000 / 60; // minutes
    
    const thoughtsPerMinute = thoughtCount / Math.max(sessionDuration, 1);
    
    // Jobs' algorithm: simple but sophisticated
    if (qualityScore > 80 && thoughtsPerMinute > 0.5) {
      this.currentSession.intensity = 'peak';
    } else if (qualityScore > 70 || thoughtsPerMinute > 0.3) {
      this.currentSession.intensity = 'high';
    } else if (qualityScore > 50 || thoughtsPerMinute > 0.1) {
      this.currentSession.intensity = 'medium';
    } else {
      this.currentSession.intensity = 'low';
    }
  }

  private analyzeHourlyPerformance(): Map<number, number> {
    const hourlyScores = new Map<number, number[]>();
    
    this.sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (!hourlyScores.has(hour)) {
        hourlyScores.set(hour, []);
      }
      hourlyScores.get(hour)!.push(session.qualityScore);
    });

    // Calculate average score for each hour
    const hourlyAverage = new Map<number, number>();
    hourlyScores.forEach((scores, hour) => {
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      hourlyAverage.set(hour, average);
    });

    return hourlyAverage;
  }

  private analyzeDailyPatterns(): Map<string, number> {
    const dailyScores = new Map<string, number[]>();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    this.sessions.forEach(session => {
      const day = days[new Date(session.startTime).getDay()];
      if (!dailyScores.has(day)) {
        dailyScores.set(day, []);
      }
      dailyScores.get(day)!.push(session.qualityScore);
    });

    const dailyAverage = new Map<string, number>();
    dailyScores.forEach((scores, day) => {
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      dailyAverage.set(day, average);
    });

    return dailyAverage;
  }

  private analyzeSessionMetrics(): { averageLength: number; optimalBreak: number } {
    const lengths = this.sessions
      .filter(s => s.endTime)
      .map(s => (s.endTime! - s.startTime) / 1000 / 60); // minutes

    const averageLength = lengths.length > 0 
      ? lengths.reduce((a, b) => a + b, 0) / lengths.length 
      : 25; // Default 25 minutes

    // Calculate optimal break time based on session performance
    const optimalBreak = Math.max(5, Math.min(30, averageLength * 0.2));

    return { averageLength, optimalBreak };
  }

  private identifyBestHours(hourlyPerformance: Map<number, number>): number[] {
    const entries = Array.from(hourlyPerformance.entries());
    entries.sort((a, b) => b[1] - a[1]); // Sort by score descending
    
    // Return top 3-5 hours
    const topCount = Math.min(5, Math.max(3, entries.length / 4));
    return entries.slice(0, topCount).map(([hour]) => hour);
  }

  private identifyPeakDays(dailyPatterns: Map<string, number>): string[] {
    const entries = Array.from(dailyPatterns.entries());
    entries.sort((a, b) => b[1] - a[1]);
    
    // Return top 2-3 days
    const topCount = Math.min(3, Math.max(2, entries.length / 2));
    return entries.slice(0, topCount).map(([day]) => day);
  }

  private identifyCognitiveType(hourlyPerformance: Map<number, number>): 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible' {
    const morningHours = [6, 7, 8, 9, 10, 11];
    const afternoonHours = [12, 13, 14, 15, 16];
    const eveningHours = [17, 18, 19, 20, 21];
    const nightHours = [22, 23, 0, 1, 2, 3, 4, 5];

    const morningScore = this.getAverageScoreForHours(hourlyPerformance, morningHours);
    const afternoonScore = this.getAverageScoreForHours(hourlyPerformance, afternoonHours);
    const eveningScore = this.getAverageScoreForHours(hourlyPerformance, eveningHours);
    const nightScore = this.getAverageScoreForHours(hourlyPerformance, nightHours);

    const scores = [
      { type: 'morning' as const, score: morningScore },
      { type: 'afternoon' as const, score: afternoonScore },
      { type: 'evening' as const, score: eveningScore },
      { type: 'night' as const, score: nightScore }
    ];

    scores.sort((a, b) => b.score - a.score);
    
    // If the difference between top two is small, consider flexible
    if (scores[0].score - scores[1].score < 5) {
      return 'flexible';
    }

    return scores[0].type;
  }

  private getAverageScoreForHours(hourlyPerformance: Map<number, number>, hours: number[]): number {
    const scores = hours
      .map(hour => hourlyPerformance.get(hour) || 0)
      .filter(score => score > 0);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  private identifyLowEnergyHours(): number[] {
    // Common low energy hours for most people
    return [14, 15, 16]; // Post-lunch dip
  }

  private isPotentialBreakthroughTime(): boolean {
    // Look for patterns that suggest breakthrough potential
    const recentSessions = this.sessions.slice(-5);
    const qualityTrend = recentSessions.map(s => s.qualityScore);
    
    // Check if there's an upward trend
    let improvements = 0;
    for (let i = 1; i < qualityTrend.length; i++) {
      if (qualityTrend[i] > qualityTrend[i - 1]) improvements++;
    }
    
    return improvements >= qualityTrend.length / 2;
  }

  private needsRest(): boolean {
    if (!this.currentSession) return false;
    
    const sessionDuration = (Date.now() - this.currentSession.startTime) / 1000 / 60;
    return sessionDuration > 90 || this.currentSession.intensity === 'low';
  }

  private calculateConfidence(): number {
    // Confidence based on data quantity and consistency
    const sessionCount = this.sessions.length;
    const baseConfidence = Math.min(100, (sessionCount / 30) * 100); // 30 sessions = 100% confidence
    
    // Reduce confidence if patterns are inconsistent
    // This is a simplified calculation - could be more sophisticated
    return Math.max(20, baseConfidence);
  }

  private setupActivityListeners(): void {
    // Listen for user activity to detect session boundaries
    let lastActivity = Date.now();
    const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutes

    const checkInactivity = () => {
      if (Date.now() - lastActivity > INACTIVITY_THRESHOLD && this.currentSession) {
        this.endSession();
      }
    };

    // Set up activity detection
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Listen to various activity events
    if (typeof window !== 'undefined') {
      window.addEventListener('click', updateActivity);
      window.addEventListener('keypress', updateActivity);
      window.addEventListener('scroll', updateActivity);
      
      // Check for inactivity every 5 minutes
      setInterval(checkInactivity, 5 * 60 * 1000);
    }
  }

  private loadData(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.sessions = data.sessions || [];
      }
    } catch (error) {
      console.warn('Could not load rhythm data:', error);
      this.sessions = [];
    }
  }

  private saveData(): void {
    try {
      const data = {
        sessions: this.sessions,
        lastUpdated: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save rhythm data:', error);
    }
  }
}

export default ThinkingRhythmDetector;