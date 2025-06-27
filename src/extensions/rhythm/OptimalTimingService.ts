/**
 * 🍎 Optimal Timing Service - Jobs' Predictive Intelligence
 * "The best interface is no interface. The computer should know what you need before you do."
 * 
 * Like iPhone's smart notifications - right message, right time, zero annoyance.
 */

import ThinkingRhythmDetector, { RhythmPattern, RhythmInsight } from './ThinkingRhythmDetector';

export interface TimingRecommendation {
  type: 'start_session' | 'take_break' | 'deep_work' | 'reflection' | 'energy_boost';
  confidence: number;        // How confident we are (0-100)
  urgency: 'low' | 'medium' | 'high';
  message: string;
  suggestedAction: string;
  timing: 'now' | 'in_minutes' | 'scheduled';
  minutesUntil?: number;     // If timing is 'in_minutes'
  scheduledTime?: number;    // If timing is 'scheduled'
}

export interface EnergyForecast {
  currentLevel: 'low' | 'medium' | 'high' | 'peak';
  nextPeakTime: number;      // Timestamp
  nextDipTime: number;       // Timestamp
  todaysPeakHours: number[]; // Hours when energy will be highest today
  recommendation: string;
}

class OptimalTimingService {
  private static instance: OptimalTimingService;
  private rhythmDetector: ThinkingRhythmDetector;
  private notificationQueue: TimingRecommendation[] = [];

  public static getInstance(): OptimalTimingService {
    if (!OptimalTimingService.instance) {
      OptimalTimingService.instance = new OptimalTimingService();
    }
    return OptimalTimingService.instance;
  }

  constructor() {
    this.rhythmDetector = ThinkingRhythmDetector.getInstance();
    this.setupTimingAnalysis();
  }

  /**
   * 🎯 Get current timing recommendations
   * Jobs: "People don't know what they want until you show it to them"
   */
  public getCurrentRecommendations(): TimingRecommendation[] {
    const pattern = this.rhythmDetector.analyzeRhythm();
    const currentState = this.rhythmDetector.getCurrentState();
    const insights = this.rhythmDetector.generateInsights();
    
    const recommendations: TimingRecommendation[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Session start recommendations
    if (!currentState.isActive && this.isOptimalStartTime(pattern, currentHour)) {
      recommendations.push({
        type: 'start_session',
        confidence: 85,
        urgency: 'high',
        message: 'Your thinking prime time is now',
        suggestedAction: 'Start a focused thinking session',
        timing: 'now'
      });
    }

    // Break recommendations
    if (currentState.isActive && currentState.sessionDuration > 45) {
      recommendations.push({
        type: 'take_break',
        confidence: 90,
        urgency: 'medium',
        message: 'You\'ve been thinking hard for a while',
        suggestedAction: 'Take a 5-10 minute break to recharge',
        timing: 'now'
      });
    }

    // Deep work opportunities
    if (this.isDeepWorkTime(pattern, currentHour) && !currentState.isActive) {
      recommendations.push({
        type: 'deep_work',
        confidence: 80,
        urgency: 'high',
        message: 'Perfect time for deep thinking',
        suggestedAction: 'Tackle your most challenging thoughts',
        timing: 'now'
      });
    }

    // Upcoming optimal times
    const nextOptimalTime = this.getNextOptimalTime(pattern, currentHour, currentMinute);
    if (nextOptimalTime && nextOptimalTime.minutesUntil < 60) {
      recommendations.push({
        type: 'start_session',
        confidence: 75,
        urgency: 'low',
        message: `Your peak thinking time starts in ${nextOptimalTime.minutesUntil} minutes`,
        suggestedAction: 'Prepare for a productive thinking session',
        timing: 'in_minutes',
        minutesUntil: nextOptimalTime.minutesUntil
      });
    }

    // Energy boost recommendations
    if (this.isLowEnergyTime(currentHour) && !currentState.isActive) {
      recommendations.push({
        type: 'energy_boost',
        confidence: 70,
        urgency: 'medium',
        message: 'Energy naturally dips around this time',
        suggestedAction: 'Light reflection or review past thoughts',
        timing: 'now'
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 🔮 Generate energy forecast for the day
   * Jobs: "Anticipate needs, don't react to them"
   */
  public generateEnergyForecast(): EnergyForecast {
    const pattern = this.rhythmDetector.analyzeRhythm();
    const now = new Date();
    const currentHour = now.getHours();

    if (!pattern) {
      return this.getDefaultForecast(currentHour);
    }

    const currentLevel = this.getCurrentEnergyLevel(pattern, currentHour);
    const nextPeakTime = this.getNextPeakTime(pattern, now);
    const nextDipTime = this.getNextDipTime(pattern, now);
    const todaysPeakHours = this.getTodaysPeakHours(pattern);

    return {
      currentLevel,
      nextPeakTime,
      nextDipTime,
      todaysPeakHours,
      recommendation: this.generateForecastRecommendation(currentLevel, todaysPeakHours, currentHour)
    };
  }

  /**
   * 📅 Schedule optimal thinking sessions for today
   * Jobs: "Design is not just what it looks like - design is how it works"
   */
  public scheduleOptimalSessions(): Array<{time: string, duration: number, type: string}> {
    const pattern = this.rhythmDetector.analyzeRhythm();
    if (!pattern) return [];

    const sessions = [];
    const today = new Date();
    
    // Schedule sessions during peak hours
    for (const hour of pattern.bestHours) {
      if (hour > today.getHours() || (hour === today.getHours() && today.getMinutes() < 30)) {
        const sessionTime = new Date(today);
        sessionTime.setHours(hour, 0, 0, 0);
        
        sessions.push({
          time: sessionTime.toTimeString().substring(0, 5),
          duration: Math.round(pattern.averageSessionLength),
          type: this.getSessionType(hour)
        });
      }
    }

    return sessions.slice(0, 3); // Max 3 sessions per day
  }

  /**
   * 🧠 Get personalized thinking tips based on current timing
   */
  public getTimingTips(): string[] {
    const pattern = this.rhythmDetector.analyzeRhythm();
    const currentHour = new Date().getHours();
    const tips: string[] = [];

    if (pattern) {
      if (pattern.bestHours.includes(currentHour)) {
        tips.push("🌟 You're in your prime thinking zone - tackle complex problems now");
      }

      if (pattern.cognitiveType === 'morning' && currentHour < 12) {
        tips.push("🌅 Morning mind is sharp - perfect for strategic thinking");
      }

      if (pattern.cognitiveType === 'evening' && currentHour >= 17) {
        tips.push("🌆 Evening energy - great time for creative connections");
      }
    }

    // Universal timing tips - Jobs' wisdom applied
    if (currentHour >= 10 && currentHour <= 11) {
      tips.push("☕ Late morning is prime for focused deep work");
    }

    if (currentHour >= 14 && currentHour <= 16) {
      tips.push("🧘 Post-lunch dip? Perfect for reflection and review");
    }

    if (currentHour >= 19 && currentHour <= 21) {
      tips.push("🌙 Evening hours - when insights from the day connect");
    }

    return tips;
  }

  // 🛠️ Private helper methods - Jobs' attention to detail

  private isOptimalStartTime(pattern: RhythmPattern | null, hour: number): boolean {
    if (!pattern) {
      // Default optimal hours if no pattern yet
      return [9, 10, 11, 14, 19, 20].includes(hour);
    }
    
    return pattern.bestHours.includes(hour);
  }

  private isDeepWorkTime(pattern: RhythmPattern | null, hour: number): boolean {
    if (!pattern) {
      return [10, 11, 15, 20].includes(hour);
    }

    // Deep work is possible during best hours and if cognitive type matches
    const isInBestHours = pattern.bestHours.includes(hour);
    const matchesCognitiveType = this.matchesCognitiveType(pattern.cognitiveType, hour);
    
    return isInBestHours && matchesCognitiveType;
  }

  private isLowEnergyTime(hour: number): boolean {
    // Common low energy times for most people
    return [13, 14, 15, 16].includes(hour); // Post-lunch dip
  }

  private matchesCognitiveType(type: string, hour: number): boolean {
    switch (type) {
      case 'morning': return hour >= 6 && hour <= 12;
      case 'afternoon': return hour >= 12 && hour <= 17;
      case 'evening': return hour >= 17 && hour <= 22;
      case 'night': return hour >= 22 || hour <= 5;
      case 'flexible': return true;
      default: return true;
    }
  }

  private getNextOptimalTime(pattern: RhythmPattern | null, currentHour: number, currentMinute: number): {minutesUntil: number} | null {
    if (!pattern) return null;

    // Find next best hour
    const upcomingHours = pattern.bestHours
      .map(hour => hour > currentHour ? hour : hour + 24) // Handle next day
      .sort((a, b) => a - b);

    if (upcomingHours.length === 0) return null;

    const nextHour = upcomingHours[0];
    const hoursUntil = nextHour > 24 ? nextHour - 24 - currentHour : nextHour - currentHour;
    const minutesUntil = hoursUntil * 60 - currentMinute;

    return minutesUntil > 0 && minutesUntil < 12 * 60 ? { minutesUntil } : null;
  }

  private getCurrentEnergyLevel(pattern: RhythmPattern, hour: number): 'low' | 'medium' | 'high' | 'peak' {
    if (pattern.bestHours.includes(hour)) {
      return 'peak';
    }

    if (this.isLowEnergyTime(hour)) {
      return 'low';
    }

    if (this.matchesCognitiveType(pattern.cognitiveType, hour)) {
      return 'high';
    }

    return 'medium';
  }

  private getNextPeakTime(pattern: RhythmPattern, now: Date): number {
    const currentHour = now.getHours();
    
    // Find next peak hour today or tomorrow
    let nextPeakHour = pattern.bestHours.find(hour => hour > currentHour);
    if (!nextPeakHour) {
      nextPeakHour = pattern.bestHours[0]; // First peak tomorrow
    }

    const nextPeak = new Date(now);
    if (nextPeakHour <= currentHour) {
      nextPeak.setDate(nextPeak.getDate() + 1); // Tomorrow
    }
    nextPeak.setHours(nextPeakHour, 0, 0, 0);

    return nextPeak.getTime();
  }

  private getNextDipTime(pattern: RhythmPattern, now: Date): number {
    // Simple heuristic: afternoon dip at 2 PM
    const dipHour = 14;
    const nextDip = new Date(now);
    
    if (now.getHours() >= dipHour) {
      nextDip.setDate(nextDip.getDate() + 1); // Tomorrow
    }
    nextDip.setHours(dipHour, 0, 0, 0);

    return nextDip.getTime();
  }

  private getTodaysPeakHours(pattern: RhythmPattern): number[] {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Return remaining peak hours for today
    return pattern.bestHours.filter(hour => hour >= currentHour);
  }

  private generateForecastRecommendation(currentLevel: string, peakHours: number[], currentHour: number): string {
    if (currentLevel === 'peak') {
      return "You're at peak performance - perfect time for your most important thinking.";
    }

    if (peakHours.length > 0) {
      const nextPeak = peakHours[0];
      const hoursUntil = nextPeak - currentHour;
      
      if (hoursUntil <= 1) {
        return "Your peak thinking time is starting soon - prepare for deep work.";
      } else {
        return `Your next peak thinking window is at ${nextPeak}:00 - plan accordingly.`;
      }
    }

    return "Focus on reflection and light thinking for now.";
  }

  private getDefaultForecast(currentHour: number): EnergyForecast {
    const defaultPeakHours = [10, 11, 20];
    const nextPeakHour = defaultPeakHours.find(h => h > currentHour) || defaultPeakHours[0];
    
    const nextPeak = new Date();
    if (nextPeakHour <= currentHour) {
      nextPeak.setDate(nextPeak.getDate() + 1);
    }
    nextPeak.setHours(nextPeakHour, 0, 0, 0);

    const nextDip = new Date();
    nextDip.setHours(14, 0, 0, 0);
    if (currentHour >= 14) {
      nextDip.setDate(nextDip.getDate() + 1);
    }

    return {
      currentLevel: 'medium',
      nextPeakTime: nextPeak.getTime(),
      nextDipTime: nextDip.getTime(),
      todaysPeakHours: defaultPeakHours.filter(h => h >= currentHour),
      recommendation: "We're learning your patterns - keep thinking to build your personal rhythm profile."
    };
  }

  private getSessionType(hour: number): string {
    if (hour >= 6 && hour <= 11) return 'Deep Focus';
    if (hour >= 12 && hour <= 16) return 'Creative Work';
    if (hour >= 17 && hour <= 21) return 'Reflection';
    return 'Light Thinking';
  }

  private setupTimingAnalysis(): void {
    // Run analysis every 15 minutes
    setInterval(() => {
      this.updateRecommendations();
    }, 15 * 60 * 1000);

    // Initial analysis
    this.updateRecommendations();
  }

  private updateRecommendations(): void {
    this.notificationQueue = this.getCurrentRecommendations();
  }
}

export default OptimalTimingService;