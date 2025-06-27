/**
 * 🍎 Thinking Coach - Jobs' Personal Thinking Mentor
 * "Everyone needs a mentor. This is yours for thinking."
 * 
 * Like having Steve Jobs as your personal thinking coach.
 */

export interface CoachingProfile {
  userId: string;
  thinkingLevel: 'beginner' | 'intermediate' | 'advanced' | 'master';
  strengths: string[];
  growthAreas: string[];
  preferredGuidanceStyle: 'gentle' | 'challenging' | 'socratic' | 'inspiring';
  currentGoals: ThinkingGoal[];
  achievements: Achievement[];
  lastCoachingSession: number;
}

export interface ThinkingGoal {
  id: string;
  type: 'clarity' | 'depth' | 'creativity' | 'critical-thinking' | 'synthesis';
  title: string;
  description: string;
  targetDate: number;
  progress: number; // 0-100
  milestones: Milestone[];
  status: 'active' | 'completed' | 'paused';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  requiredScore: number;
  achievedAt?: number;
  celebration?: CelebrationMoment;
}

export interface CelebrationMoment {
  type: 'badge' | 'animation' | 'quote' | 'insight';
  content: string;
  visualEffect?: string;
  soundEffect?: string;
}

export interface CoachingSession {
  id: string;
  timestamp: number;
  type: 'guidance' | 'challenge' | 'reflection' | 'celebration';
  content: string;
  userResponse?: string;
  impact: 'breakthrough' | 'progress' | 'resistance' | 'neutral';
  followUp?: string;
}

export interface TrainingExercise {
  id: string;
  title: string;
  description: string;
  type: 'prompt' | 'challenge' | 'reflection' | 'synthesis';
  difficulty: 'easy' | 'medium' | 'hard' | 'master';
  targetSkills: string[];
  estimatedTime: number; // minutes
  rewards: string[];
}

export interface GuidanceSuggestion {
  type: 'tip' | 'question' | 'challenge' | 'encouragement';
  content: string;
  context: string;
  urgency: 'immediate' | 'soon' | 'whenever';
  targetSkill?: string;
}

class ThinkingCoach {
  private static instance: ThinkingCoach;
  private profile: CoachingProfile | null = null;
  private currentSession: CoachingSession | null = null;
  private readonly STORAGE_KEY = 'thinkmate_coach_profile';
  private readonly JOBS_QUOTES = [
    "Your thinking is at the intersection of technology and liberal arts.",
    "Stay hungry for deeper insights, stay foolish enough to question everything.",
    "Great thinking requires saying no to good thoughts to make room for great ones.",
    "The people who are crazy enough to think deeply can change the world.",
    "Simplicity in thought is the ultimate sophistication.",
    "Your best thinking comes from connecting things others don't see as related.",
    "Don't let the noise of shallow thoughts drown out your inner wisdom.",
    "Quality thinking is more important than quantity. Think different."
  ];

  public static getInstance(): ThinkingCoach {
    if (!ThinkingCoach.instance) {
      ThinkingCoach.instance = new ThinkingCoach();
    }
    return ThinkingCoach.instance;
  }

  constructor() {
    this.loadProfile();
  }

  /**
   * 🎯 Initialize or update user's coaching profile
   * Jobs: "Understanding the individual is key to great mentorship"
   */
  public async initializeProfile(userId: string, thoughtHistory?: any[]): Promise<CoachingProfile> {
    if (this.profile && this.profile.userId === userId) {
      return this.profile;
    }

    // Analyze thought history to understand user
    const analysis = thoughtHistory ? await this.analyzeThinkingStyle(thoughtHistory) : null;
    
    this.profile = {
      userId,
      thinkingLevel: analysis?.level || 'beginner',
      strengths: analysis?.strengths || [],
      growthAreas: analysis?.growthAreas || ['clarity', 'depth', 'synthesis'],
      preferredGuidanceStyle: 'inspiring', // Jobs default
      currentGoals: this.generateInitialGoals(analysis),
      achievements: [],
      lastCoachingSession: Date.now()
    };

    this.saveProfile();
    return this.profile;
  }

  /**
   * 🎓 Get personalized guidance for current thinking
   * Jobs: "A good mentor knows when to guide and when to challenge"
   */
  public async getRealtimeGuidance(
    currentThought: string, 
    qualityScore: number,
    context?: any
  ): Promise<GuidanceSuggestion | null> {
    if (!this.profile || !currentThought.trim()) return null;

    // Analyze current thinking
    const analysis = this.analyzeCurrentThinking(currentThought, qualityScore);
    
    // Determine guidance type based on analysis
    if (analysis.needsClarity) {
      return {
        type: 'question',
        content: "What's the core insight you're trying to express? Strip away everything else.",
        context: 'Your thought has potential, but it needs more focus.',
        urgency: 'immediate',
        targetSkill: 'clarity'
      };
    }

    if (analysis.showsProgress) {
      return {
        type: 'encouragement',
        content: "You're thinking more clearly! Now push deeper - what's beneath this insight?",
        context: 'Quality improving',
        urgency: 'soon',
        targetSkill: 'depth'
      };
    }

    if (analysis.readyForChallenge) {
      return {
        type: 'challenge',
        content: "Excellent thinking! Now flip it - what if the opposite were true?",
        context: 'High quality thought detected',
        urgency: 'whenever',
        targetSkill: 'critical-thinking'
      };
    }

    // Default gentle guidance
    if (qualityScore < 60) {
      return {
        type: 'tip',
        content: "Take a breath. What's the one thing you really want to say?",
        context: 'Helping you find clarity',
        urgency: 'immediate'
      };
    }

    return null;
  }

  /**
   * 🎯 Generate personalized training plan
   * Jobs: "Great products are built with great discipline"
   */
  public generateTrainingPlan(
    duration: 'week' | 'month' | 'quarter'
  ): TrainingExercise[] {
    if (!this.profile) return [];

    const exercises: TrainingExercise[] = [];
    const daysCount = duration === 'week' ? 7 : duration === 'month' ? 30 : 90;

    // Focus on growth areas
    this.profile.growthAreas.forEach(area => {
      exercises.push(...this.createExercisesForSkill(area, daysCount));
    });

    // Add some strength-building exercises
    this.profile.strengths.forEach(strength => {
      exercises.push(...this.createAdvancedExercisesForSkill(strength, Math.floor(daysCount / 3)));
    });

    // Sort by a mix of difficulty and variety
    return this.optimizeExerciseSchedule(exercises, daysCount);
  }

  /**
   * ✨ Check and celebrate achievements
   * Jobs: "Celebrating the journey is as important as the destination"
   */
  public checkAchievements(
    thoughtHistory: any[],
    recentQualityScores: number[]
  ): Achievement[] {
    const newAchievements: Achievement[] = [];

    // Check quality streaks
    const highQualityStreak = this.checkQualityStreak(recentQualityScores);
    if (highQualityStreak >= 5 && !this.hasAchievement('quality_streak_5')) {
      newAchievements.push({
        id: 'quality_streak_5',
        type: 'streak',
        title: 'Consistent Thinker',
        description: '5 high-quality thoughts in a row!',
        icon: '🔥',
        unlockedAt: Date.now(),
        celebration: {
          type: 'animation',
          content: 'streak_fire',
          visualEffect: 'confetti'
        }
      });
    }

    // Check breakthrough moments
    const breakthroughs = this.detectBreakthroughs(thoughtHistory);
    if (breakthroughs.length > 0 && !this.hasAchievement('first_breakthrough')) {
      newAchievements.push({
        id: 'first_breakthrough',
        type: 'milestone',
        title: 'Breakthrough Thinker',
        description: 'You\'ve had your first major insight!',
        icon: '💡',
        unlockedAt: Date.now(),
        celebration: {
          type: 'quote',
          content: this.JOBS_QUOTES[0],
          visualEffect: 'sparkles'
        }
      });
    }

    // Save new achievements
    if (newAchievements.length > 0 && this.profile) {
      this.profile.achievements.push(...newAchievements);
      this.saveProfile();
    }

    return newAchievements;
  }

  /**
   * 📊 Generate thinking health report
   * Jobs: "What gets measured gets improved"
   */
  public generateHealthReport(
    thoughtHistory: any[],
    qualityHistory: number[],
    period: 'week' | 'month'
  ): ThinkingHealthReport {
    const now = Date.now();
    const periodMs = period === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
    const startDate = now - periodMs;

    // Filter thoughts within period
    const periodThoughts = thoughtHistory.filter(t => t.timestamp >= startDate);
    const periodQualities = qualityHistory.slice(-periodThoughts.length);

    return {
      period,
      overallHealth: this.calculateOverallHealth(periodQualities),
      strengths: this.identifyStrengths(periodThoughts),
      improvements: this.identifyImprovements(periodThoughts, periodQualities),
      insights: this.generateHealthInsights(periodThoughts, periodQualities),
      recommendations: this.generateRecommendations(periodThoughts, periodQualities),
      nextSteps: this.suggestNextSteps()
    };
  }

  /**
   * 🎮 Start interactive coaching session
   * Jobs: "The best interfaces respond to you"
   */
  public startCoachingSession(type: CoachingSession['type']): CoachingSession {
    const session: CoachingSession = {
      id: this.generateSessionId(),
      timestamp: Date.now(),
      type,
      content: this.generateSessionContent(type),
      impact: 'neutral'
    };

    this.currentSession = session;
    return session;
  }

  // 🛠️ Private helper methods

  private analyzeThinkingStyle(thoughts: any[]): {
    level: CoachingProfile['thinkingLevel'];
    strengths: string[];
    growthAreas: string[];
  } {
    // Simplified analysis - would be more sophisticated in production
    const avgQuality = thoughts.reduce((sum, t) => sum + (t.qualityScore || 50), 0) / thoughts.length;
    
    let level: CoachingProfile['thinkingLevel'] = 'beginner';
    if (avgQuality > 80) level = 'advanced';
    else if (avgQuality > 65) level = 'intermediate';
    
    const strengths = [];
    const growthAreas = ['clarity', 'depth'];
    
    if (avgQuality > 70) strengths.push('consistency');
    if (thoughts.some(t => t.category === 'insight')) strengths.push('insights');
    
    return { level, strengths, growthAreas };
  }

  private generateInitialGoals(analysis: any): ThinkingGoal[] {
    const goals: ThinkingGoal[] = [
      {
        id: 'clarity_master',
        type: 'clarity',
        title: 'Master of Clarity',
        description: 'Express complex ideas with Apple-like simplicity',
        targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        progress: 0,
        milestones: [
          {
            id: 'clarity_1',
            title: 'First Clear Thought',
            description: 'Achieve clarity score above 80',
            requiredScore: 80
          },
          {
            id: 'clarity_2',
            title: 'Consistency',
            description: '5 clear thoughts in a row',
            requiredScore: 85
          }
        ],
        status: 'active'
      }
    ];

    return goals;
  }

  private analyzeCurrentThinking(thought: string, quality: number): {
    needsClarity: boolean;
    showsProgress: boolean;
    readyForChallenge: boolean;
  } {
    return {
      needsClarity: quality < 60 || thought.length > 300,
      showsProgress: quality > 70 && quality < 85,
      readyForChallenge: quality > 85
    };
  }

  private createExercisesForSkill(skill: string, count: number): TrainingExercise[] {
    const exercises: TrainingExercise[] = [];
    
    if (skill === 'clarity') {
      exercises.push({
        id: `clarity_ex_${Date.now()}`,
        title: 'One Sentence Wisdom',
        description: 'Express your deepest insight from today in exactly one sentence.',
        type: 'challenge',
        difficulty: 'medium',
        targetSkills: ['clarity', 'synthesis'],
        estimatedTime: 5,
        rewards: ['Clarity points +10']
      });
    }

    if (skill === 'depth') {
      exercises.push({
        id: `depth_ex_${Date.now()}`,
        title: 'Five Whys',
        description: 'Take your last thought and ask "why" five times to go deeper.',
        type: 'reflection',
        difficulty: 'medium',
        targetSkills: ['depth', 'critical-thinking'],
        estimatedTime: 10,
        rewards: ['Depth points +15']
      });
    }

    return exercises;
  }

  private createAdvancedExercisesForSkill(skill: string, count: number): TrainingExercise[] {
    // Create mastery-level exercises for strengths
    return [];
  }

  private optimizeExerciseSchedule(exercises: TrainingExercise[], days: number): TrainingExercise[] {
    // Distribute exercises optimally across the period
    return exercises.slice(0, Math.min(exercises.length, days * 2));
  }

  private checkQualityStreak(scores: number[]): number {
    let streak = 0;
    for (let i = scores.length - 1; i >= 0; i--) {
      if (scores[i] >= 75) streak++;
      else break;
    }
    return streak;
  }

  private detectBreakthroughs(thoughts: any[]): any[] {
    return thoughts.filter(t => t.qualityScore > 90 || t.category === 'breakthrough');
  }

  private hasAchievement(id: string): boolean {
    return this.profile?.achievements.some(a => a.id === id) || false;
  }

  private calculateOverallHealth(qualities: number[]): number {
    if (qualities.length === 0) return 50;
    const avg = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
    const consistency = this.calculateConsistency(qualities);
    return Math.round(avg * 0.7 + consistency * 0.3);
  }

  private calculateConsistency(qualities: number[]): number {
    if (qualities.length < 2) return 50;
    const variance = this.calculateVariance(qualities);
    return Math.max(0, 100 - variance);
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length);
  }

  private identifyStrengths(thoughts: any[]): string[] {
    // Analyze patterns to identify strengths
    return ['Consistent thinking', 'Growing clarity'];
  }

  private identifyImprovements(thoughts: any[], qualities: number[]): string[] {
    return ['Deeper exploration needed', 'Connect more ideas'];
  }

  private generateHealthInsights(thoughts: any[], qualities: number[]): string[] {
    const insights: string[] = [];
    
    if (qualities.length > 0) {
      const trend = this.calculateTrend(qualities);
      if (trend > 0) {
        insights.push('Your thinking quality is improving! 📈');
      }
    }

    return insights;
  }

  private calculateTrend(numbers: number[]): number {
    if (numbers.length < 2) return 0;
    const firstHalf = numbers.slice(0, Math.floor(numbers.length / 2));
    const secondHalf = numbers.slice(Math.floor(numbers.length / 2));
    const firstAvg = firstHalf.reduce((sum, n) => sum + n, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, n) => sum + n, 0) / secondHalf.length;
    return secondAvg - firstAvg;
  }

  private generateRecommendations(thoughts: any[], qualities: number[]): string[] {
    return [
      'Try the "One Sentence Wisdom" exercise daily',
      'Explore connections between your recent thoughts'
    ];
  }

  private suggestNextSteps(): string[] {
    return [
      'Set a goal to improve clarity by 10% this week',
      'Challenge yourself with a complex topic'
    ];
  }

  private generateSessionContent(type: CoachingSession['type']): string {
    const contents = {
      guidance: "Let's explore what you're thinking. What's the core idea you're grappling with?",
      challenge: "Time for a thinking challenge! Can you explain quantum physics to a 5-year-old?",
      reflection: "Look back at your thoughts this week. What pattern do you notice?",
      celebration: "Congratulations! You've reached a new level of thinking clarity! 🎉"
    };
    return contents[type];
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadProfile(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.profile = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load coaching profile:', error);
    }
  }

  private saveProfile(): void {
    try {
      if (this.profile) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profile));
      }
    } catch (error) {
      console.warn('Could not save coaching profile:', error);
    }
  }
}

// Type definitions for external use
export interface Achievement {
  id: string;
  type: 'milestone' | 'streak' | 'breakthrough' | 'mastery';
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;
  celebration?: CelebrationMoment;
}

export interface ThinkingHealthReport {
  period: 'week' | 'month';
  overallHealth: number; // 0-100
  strengths: string[];
  improvements: string[];
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
}

export default ThinkingCoach;