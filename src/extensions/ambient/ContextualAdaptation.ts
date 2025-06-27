/**
 * 🍎 Contextual Adaptation Engine - Jobs' Environmental Intelligence
 * "The interface should breathe with your environment and mood."
 * 
 * Like iPhone's automatic display adaptation - seamless, intelligent, unnoticed.
 */

export interface EnvironmentContext {
  time: {
    hour: number;
    period: 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'deep-night';
    weekday: boolean;
  };
  weather?: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'clear' | 'unknown';
    temperature?: number;
    description: string;
  };
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  ambientLight: 'bright' | 'moderate' | 'dim' | 'dark';
  userEnergy: 'high' | 'medium' | 'low' | 'unknown';
}

export interface AdaptiveTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  mood: 'energetic' | 'calm' | 'focused' | 'contemplative' | 'cozy' | 'dramatic';
  inspiration: string; // What inspired this theme
}

export interface ContextualSuggestion {
  type: 'thinking_mode' | 'break_suggestion' | 'environment_tip' | 'mood_booster';
  title: string;
  description: string;
  action?: string;
  urgency: 'low' | 'medium' | 'high';
  icon: string;
}

export interface AmbientExperience {
  theme: AdaptiveTheme;
  suggestions: ContextualSuggestion[];
  soundscape?: {
    type: 'rain' | 'forest' | 'cafe' | 'ocean' | 'fireplace' | 'silence';
    volume: number;
  };
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
}

class ContextualAdaptation {
  private static instance: ContextualAdaptation;
  private currentContext: EnvironmentContext;
  private readonly STORAGE_KEY = 'thinkmate_context_preferences';
  private weatherCache: { data: any; timestamp: number } | null = null;

  public static getInstance(): ContextualAdaptation {
    if (!ContextualAdaptation.instance) {
      ContextualAdaptation.instance = new ContextualAdaptation();
    }
    return ContextualAdaptation.instance;
  }

  constructor() {
    this.currentContext = this.detectCurrentContext();
    this.initializeContextDetection();
  }

  /**
   * 🌍 Get current environmental context
   * Jobs: "The computer should understand your world"
   */
  public getCurrentContext(): EnvironmentContext {
    return { ...this.currentContext };
  }

  /**
   * 🎨 Generate adaptive theme based on context
   * Jobs: "Beauty adapts to the moment"
   */
  public generateAdaptiveTheme(): AdaptiveTheme {
    const context = this.currentContext;
    
    // Time-based theme selection
    if (context.time.period === 'dawn') {
      return {
        name: 'Dawn Awakening',
        colors: {
          primary: '#F472B6',     // Rose
          secondary: '#FED7AA',   // Peach
          background: '#FEF3F2',  // Warm white
          surface: '#FFF7ED',     // Cream
          text: '#7C2D12',        // Warm brown
          accent: '#EA580C'       // Orange
        },
        mood: 'energetic',
        inspiration: 'The gentle energy of dawn breaking'
      };
    }

    if (context.time.period === 'morning') {
      return {
        name: 'Morning Clarity',
        colors: {
          primary: '#3B82F6',     // Blue
          secondary: '#DBEAFE',   // Light blue
          background: '#F8FAFC',  // Clean white
          surface: '#FFFFFF',     // Pure white
          text: '#1E293B',        // Dark slate
          accent: '#0EA5E9'       // Sky blue
        },
        mood: 'focused',
        inspiration: 'Clear morning light and fresh possibilities'
      };
    }

    if (context.time.period === 'afternoon') {
      return context.weather?.condition === 'sunny' ? {
        name: 'Sunny Focus',
        colors: {
          primary: '#EAB308',     // Yellow
          secondary: '#FEF3C7',   // Light yellow
          background: '#FFFBEB',  // Warm white
          surface: '#FEF9C3',     // Cream yellow
          text: '#92400E',        // Amber brown
          accent: '#F59E0B'       // Amber
        },
        mood: 'energetic',
        inspiration: 'Bright afternoon sunshine energizing your thoughts'
      } : {
        name: 'Cloudy Contemplation',
        colors: {
          primary: '#6B7280',     // Gray
          secondary: '#E5E7EB',   // Light gray
          background: '#F9FAFB',  // Soft white
          surface: '#F3F4F6',     // Gray white
          text: '#374151',        // Dark gray
          accent: '#4B5563'       // Medium gray
        },
        mood: 'contemplative',
        inspiration: 'Soft cloudy light perfect for deep reflection'
      };
    }

    if (context.time.period === 'evening') {
      return {
        name: 'Golden Hour',
        colors: {
          primary: '#F59E0B',     // Amber
          secondary: '#FED7AA',   // Peach
          background: '#451A03',  // Dark brown
          surface: '#78350F',     // Brown
          text: '#FEF3C7',        // Light amber
          accent: '#FBBF24'       // Golden
        },
        mood: 'cozy',
        inspiration: 'Warm golden light of evening reflection'
      };
    }

    if (context.time.period === 'night') {
      return {
        name: 'Night Wisdom',
        colors: {
          primary: '#8B5CF6',     // Purple
          secondary: '#3730A3',   // Indigo
          background: '#1E1B4B',  // Dark indigo
          surface: '#312E81',     // Indigo
          text: '#E0E7FF',        // Light purple
          accent: '#A855F7'       // Purple
        },
        mood: 'contemplative',
        inspiration: 'Deep night thoughts and starlit wisdom'
      };
    }

    // Season-based adjustments
    if (context.season === 'winter') {
      return {
        name: 'Winter Serenity',
        colors: {
          primary: '#0EA5E9',     // Sky blue
          secondary: '#BAE6FD',   // Light blue
          background: '#0F172A',  // Dark slate
          surface: '#1E293B',     // Slate
          text: '#F1F5F9',        // Light slate
          accent: '#38BDF8'       // Blue
        },
        mood: 'calm',
        inspiration: 'The serene clarity of winter'
      };
    }

    // Default theme
    return {
      name: 'Adaptive Harmony',
      colors: {
        primary: '#6366F1',     // Indigo
        secondary: '#E0E7FF',   // Light indigo
        background: '#FFFFFF',  // White
        surface: '#F8FAFC',     // Gray white
        text: '#1E293B',        // Dark slate
        accent: '#8B5CF6'       // Purple
      },
      mood: 'focused',
      inspiration: 'Balanced harmony for any moment'
    };
  }

  /**
   * 💡 Generate contextual suggestions
   * Jobs: "Anticipate needs, don't just respond to them"
   */
  public generateContextualSuggestions(): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];
    const context = this.currentContext;

    // Time-based suggestions
    if (context.time.period === 'morning' && context.time.weekday) {
      suggestions.push({
        type: 'thinking_mode',
        title: 'Morning Planning Mode',
        description: 'Perfect time to set intentions and plan your day\'s thinking priorities',
        action: 'Try strategic thinking or goal setting',
        urgency: 'medium',
        icon: '🌅'
      });
    }

    if (context.time.period === 'afternoon' && context.time.hour >= 14 && context.time.hour <= 16) {
      suggestions.push({
        type: 'break_suggestion',
        title: 'Afternoon Dip Break',
        description: 'Your energy naturally dips now. Perfect time for a mindful break',
        action: 'Take a 10-minute walk or breathing exercise',
        urgency: 'high',
        icon: '☕'
      });
    }

    if (context.time.period === 'evening') {
      suggestions.push({
        type: 'thinking_mode',
        title: 'Evening Reflection',
        description: 'Golden hour is perfect for reflecting on insights and connections',
        action: 'Review today\'s thoughts and find patterns',
        urgency: 'medium',
        icon: '🌆'
      });
    }

    // Weather-based suggestions
    if (context.weather?.condition === 'rainy') {
      suggestions.push({
        type: 'mood_booster',
        title: 'Rainy Day Focus',
        description: 'The sound of rain enhances concentration and introspection',
        action: 'Perfect conditions for deep thinking',
        urgency: 'low',
        icon: '🌧️'
      });
    }

    if (context.weather?.condition === 'sunny') {
      suggestions.push({
        type: 'environment_tip',
        title: 'Sunny Energy Boost',
        description: 'Bright light naturally boosts creativity and positive thinking',
        action: 'Consider brainstorming or creative exploration',
        urgency: 'low',
        icon: '☀️'
      });
    }

    // Energy-based suggestions
    if (context.userEnergy === 'low') {
      suggestions.push({
        type: 'break_suggestion',
        title: 'Energy Restoration',
        description: 'Your energy seems low. Time to recharge before thinking',
        action: 'Try gentle movement or a short meditation',
        urgency: 'high',
        icon: '🔋'
      });
    }

    // Seasonal suggestions
    if (context.season === 'autumn') {
      suggestions.push({
        type: 'thinking_mode',
        title: 'Autumn Wisdom',
        description: 'The season of reflection - perfect for synthesizing and reviewing',
        action: 'Look for patterns in your thinking journey',
        urgency: 'low',
        icon: '🍂'
      });
    }

    if (context.season === 'spring') {
      suggestions.push({
        type: 'thinking_mode',
        title: 'Spring Growth',
        description: 'Season of new beginnings - ideal for planting new ideas',
        action: 'Explore fresh perspectives and novel connections',
        urgency: 'low',
        icon: '🌱'
      });
    }

    return suggestions.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  /**
   * 🎵 Generate ambient experience
   * Jobs: "Technology should enhance, not distract"
   */
  public generateAmbientExperience(): AmbientExperience {
    const theme = this.generateAdaptiveTheme();
    const suggestions = this.generateContextualSuggestions();
    
    return {
      theme,
      suggestions: suggestions.slice(0, 3), // Top 3 suggestions
      soundscape: this.recommendSoundscape(),
      breathingPattern: this.recommendBreathingPattern()
    };
  }

  /**
   * 🌡️ Update user energy level
   */
  public updateUserEnergy(energy: EnvironmentContext['userEnergy']): void {
    this.currentContext.userEnergy = energy;
    this.saveContext();
  }

  /**
   * 🎭 Get mood-based writing prompts
   */
  public getMoodBasedPrompts(): string[] {
    const context = this.currentContext;
    const prompts: string[] = [];

    if (context.time.period === 'morning') {
      prompts.push(
        "What intentions do you want to set for today's thinking?",
        "What question has been quietly waiting for your attention?",
        "If you could solve one problem today, what would it be?"
      );
    }

    if (context.time.period === 'evening') {
      prompts.push(
        "What surprised you about your thinking today?",
        "Which idea from today deserves more exploration?",
        "What pattern are you beginning to notice in your thoughts?"
      );
    }

    if (context.weather?.condition === 'rainy') {
      prompts.push(
        "Like the rain, what thoughts keep returning to you?",
        "What needs gentle, persistent attention like rain on earth?",
        "In this quiet moment, what wisdom emerges?"
      );
    }

    if (context.season === 'autumn') {
      prompts.push(
        "What ideas are ready to be harvested from your thinking?",
        "What old beliefs might you need to let go of?",
        "How has your perspective changed over time?"
      );
    }

    return prompts.length > 0 ? prompts : [
      "What's on your mind right now?",
      "What would you like to explore?",
      "What question intrigues you today?"
    ];
  }

  // 🛠️ Private helper methods

  private detectCurrentContext(): EnvironmentContext {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      time: {
        hour,
        period: this.getTimePeriod(hour),
        weekday: now.getDay() >= 1 && now.getDay() <= 5
      },
      season: this.getSeason(now.getMonth()),
      ambientLight: this.detectAmbientLight(hour),
      userEnergy: 'unknown'
    };
  }

  private getTimePeriod(hour: number): EnvironmentContext['time']['period'] {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 19) return 'dusk';
    if (hour >= 19 && hour < 22) return 'evening';
    if (hour >= 22 || hour < 2) return 'night';
    return 'deep-night';
  }

  private getSeason(month: number): EnvironmentContext['season'] {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  private detectAmbientLight(hour: number): EnvironmentContext['ambientLight'] {
    if (hour >= 6 && hour <= 18) return 'bright';
    if (hour >= 19 && hour <= 21) return 'moderate';
    if (hour >= 22 || hour <= 5) return 'dark';
    return 'dim';
  }

  private recommendSoundscape(): AmbientExperience['soundscape'] {
    const context = this.currentContext;
    
    if (context.weather?.condition === 'rainy') {
      return { type: 'rain', volume: 30 };
    }
    
    if (context.time.period === 'evening' || context.time.period === 'night') {
      return { type: 'fireplace', volume: 20 };
    }
    
    if (context.season === 'summer') {
      return { type: 'forest', volume: 25 };
    }
    
    return { type: 'silence', volume: 0 };
  }

  private recommendBreathingPattern(): AmbientExperience['breathingPattern'] {
    const context = this.currentContext;
    
    if (context.userEnergy === 'low') {
      return { inhale: 4, hold: 2, exhale: 6, pause: 2 }; // Calming pattern
    }
    
    if (context.time.period === 'morning') {
      return { inhale: 4, hold: 4, exhale: 4, pause: 4 }; // Energizing pattern
    }
    
    return { inhale: 4, hold: 7, exhale: 8, pause: 0 }; // Relaxing pattern
  }

  private initializeContextDetection(): void {
    // Update context every 30 minutes
    setInterval(() => {
      this.currentContext = this.detectCurrentContext();
      this.saveContext();
    }, 30 * 60 * 1000);

    // Try to get weather data
    this.updateWeatherContext();
  }

  private async updateWeatherContext(): Promise<void> {
    // Check if we have recent weather data
    if (this.weatherCache && Date.now() - this.weatherCache.timestamp < 60 * 60 * 1000) {
      return; // Use cached data
    }

    try {
      // This would normally call a weather API
      // For now, simulate weather detection
      const mockWeather = this.getMockWeather();
      this.currentContext.weather = mockWeather;
      
      this.weatherCache = {
        data: mockWeather,
        timestamp: Date.now()
      };
      
      this.saveContext();
    } catch (error) {
      console.warn('Could not fetch weather data:', error);
    }
  }

  private getMockWeather(): EnvironmentContext['weather'] {
    const conditions = ['sunny', 'cloudy', 'rainy', 'clear'] as const;
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    const descriptions = {
      sunny: 'Bright and energizing',
      cloudy: 'Soft and contemplative',
      rainy: 'Gentle and focusing',
      clear: 'Crisp and clarifying'
    };
    
    return {
      condition,
      temperature: 20 + Math.random() * 15, // 20-35°C
      description: descriptions[condition]
    };
  }

  private saveContext(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        userEnergy: this.currentContext.userEnergy,
        lastUpdate: Date.now()
      }));
    } catch (error) {
      console.warn('Could not save context:', error);
    }
  }

  private loadContext(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.userEnergy) {
          this.currentContext.userEnergy = data.userEnergy;
        }
      }
    } catch (error) {
      console.warn('Could not load context:', error);
    }
  }
}

export default ContextualAdaptation;