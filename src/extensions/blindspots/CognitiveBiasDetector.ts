/**
 * 🍎 Cognitive Bias Detector - Jobs' Gentle Wisdom
 * "The greatest enemy of knowledge is not ignorance, it is the illusion of knowledge."
 * 
 * Like iPhone's gentle notifications - helpful without being preachy.
 */

export interface BiasDetection {
  type: BiasType;
  confidence: number;        // 0-100, how confident we are
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: string[];        // Phrases/patterns that triggered detection
  gentleSuggestion: string;  // Jobs-style helpful nudge
  expandingQuestions: string[]; // Questions to broaden perspective
}

export type BiasType = 
  | 'confirmation_bias'      // Seeking info that confirms existing beliefs
  | 'anchoring_bias'         // Over-relying on first piece of info
  | 'availability_heuristic' // Judging probability by ease of recall
  | 'black_white_thinking'   // All-or-nothing reasoning
  | 'emotional_reasoning'    // Letting emotions override logic
  | 'hasty_generalization'   // Drawing broad conclusions from limited data
  | 'echo_chamber'           // Only considering similar perspectives
  | 'sunk_cost_fallacy'      // Continuing because of past investment
  | 'perfectionism_trap'     // Letting perfect be enemy of good
  | 'analysis_paralysis'     // Overthinking without action;

export interface PerspectiveExpansion {
  originalThought: string;
  biasDetected: BiasType;
  alternativeFrames: string[];    // Different ways to view the situation
  counterQuestions: string[];     // Questions to challenge assumptions
  broadeningSuggestions: string[]; // Ways to expand thinking
}

export interface ThinkingPattern {
  userId: string;
  commonBiases: BiasType[];
  strengthAreas: string[];    // Where user thinks well
  growthOpportunities: string[]; // Areas for improvement
  recentProgress: string[];   // Recent improvements noticed
}

class CognitiveBiasDetector {
  private static instance: CognitiveBiasDetector;
  private biasPatterns: Map<BiasType, RegExp[]> = new Map();
  private userPatterns: ThinkingPattern | null = null;
  private readonly STORAGE_KEY = 'thinkmate_bias_patterns';

  public static getInstance(): CognitiveBiasDetector {
    if (!CognitiveBiasDetector.instance) {
      CognitiveBiasDetector.instance = new CognitiveBiasDetector();
    }
    return CognitiveBiasDetector.instance;
  }

  constructor() {
    this.initializeBiasPatterns();
    this.loadUserPatterns();
  }

  /**
   * 🔍 Analyze thought for cognitive biases
   * Jobs: "Think different" - gently encourage different perspectives
   */
  public analyzeThought(content: string): BiasDetection[] {
    const detections: BiasDetection[] = [];
    
    for (const [biasType, patterns] of this.biasPatterns) {
      const detection = this.detectBias(content, biasType, patterns);
      if (detection && detection.confidence > 60) { // Only surface confident detections
        detections.push(detection);
      }
    }

    // Update user patterns
    this.updateUserPatterns(detections);

    // Sort by confidence and return top 2 to avoid overwhelming
    return detections
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
  }

  /**
   * 🌱 Generate perspective expansion suggestions
   * Jobs: "Stay hungry, stay foolish" - encourage intellectual curiosity
   */
  public expandPerspective(content: string, detectedBias?: BiasType): PerspectiveExpansion | null {
    const biases = detectedBias ? [detectedBias] : this.analyzeThought(content).map(d => d.type);
    
    if (biases.length === 0) return null;

    const primaryBias = biases[0];
    
    return {
      originalThought: content,
      biasDetected: primaryBias,
      alternativeFrames: this.generateAlternativeFrames(content, primaryBias),
      counterQuestions: this.generateCounterQuestions(content, primaryBias),
      broadeningSuggestions: this.generateBroadeningsSuggestions(content, primaryBias)
    };
  }

  /**
   * 📊 Get user's thinking pattern analysis
   * Jobs: "Know thyself" - self-awareness drives growth
   */
  public getUserThinkingPattern(): ThinkingPattern | null {
    return this.userPatterns;
  }

  /**
   * 💡 Generate daily bias awareness insight
   * Jobs: "Innovation distinguishes between a leader and a follower"
   */
  public getDailyBiasInsight(): string {
    const insights = [
      "🤔 Question your first instinct today - it might be an assumption in disguise.",
      "🔍 Look for evidence that contradicts your current belief about something.",
      "👥 Seek out a perspective that's completely different from yours.",
      "⚖️ Before deciding, ask: 'What would someone who disagrees with me say?'",
      "🌍 Consider how someone from a different culture might view this situation.",
      "🎯 Focus on what you could be wrong about, not what you're sure of.",
      "📚 Learn something today that challenges what you thought you knew.",
      "🔄 Take a break from analysis and let your intuition speak.",
      "🎨 Approach this problem like a creative artist, not just a logical analyst.",
      "🌱 Embrace being a beginner - what don't you understand yet?"
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }

  // 🛠️ Private helper methods - Jobs' attention to implementation details

  private initializeBiasPatterns(): void {
    // Confirmation Bias
    this.biasPatterns.set('confirmation_bias', [
      /proves? (that|what) I (thought|said|believed)/i,
      /exactly what I expected/i,
      /confirms my (theory|belief|suspicion)/i,
      /just as I (thought|suspected)/i,
      /this shows I was right/i
    ]);

    // Anchoring Bias
    this.biasPatterns.set('anchoring_bias', [
      /first impression was/i,
      /initially (thought|felt)/i,
      /my original (idea|thought)/i,
      /started with the assumption/i,
      /based on what I first (heard|saw)/i
    ]);

    // Availability Heuristic
    this.biasPatterns.set('availability_heuristic', [
      /I remember (hearing|seeing) this before/i,
      /happens all the time/i,
      /always seems like/i,
      /everyone I know/i,
      /just (heard|saw|read) about this/i
    ]);

    // Black & White Thinking
    this.biasPatterns.set('black_white_thinking', [
      /always|never|everyone|no one|everything|nothing/i,
      /either .* or .*/i,
      /completely (right|wrong|good|bad)/i,
      /total(ly)? (success|failure)/i,
      /absolutely (must|cannot)/i
    ]);

    // Emotional Reasoning
    this.biasPatterns.set('emotional_reasoning', [
      /I feel like this means/i,
      /my gut says/i,
      /feels (right|wrong) so it must be/i,
      /I'm (angry|sad|excited) so/i,
      /this makes me (feel|think) that/i
    ]);

    // Hasty Generalization
    this.biasPatterns.set('hasty_generalization', [
      /this proves that all/i,
      /people always/i,
      /this shows that (everyone|everything)/i,
      /based on this (example|instance)/i,
      /if this happened once/i
    ]);

    // Echo Chamber
    this.biasPatterns.set('echo_chamber', [
      /everyone (agrees|thinks|says)/i,
      /all my (friends|colleagues) think/i,
      /everyone I talk to/i,
      /consensus is/i,
      /we all agree that/i
    ]);

    // Sunk Cost Fallacy
    this.biasPatterns.set('sunk_cost_fallacy', [
      /already invested so much/i,
      /can't give up now after/i,
      /too much (time|money|effort) spent/i,
      /gone this far so/i,
      /wasted if I don't continue/i
    ]);

    // Perfectionism Trap
    this.biasPatterns.set('perfectionism_trap', [
      /has to be perfect/i,
      /not good enough unless/i,
      /can't start until/i,
      /need to get it exactly right/i,
      /won't be worth it if it's not perfect/i
    ]);

    // Analysis Paralysis
    this.biasPatterns.set('analysis_paralysis', [
      /need more information before/i,
      /still analyzing all the/i,
      /can't decide because/i,
      /too many (options|variables)/i,
      /keep thinking about it but/i
    ]);
  }

  private detectBias(content: string, biasType: BiasType, patterns: RegExp[]): BiasDetection | null {
    const matches: string[] = [];
    let totalMatches = 0;

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        matches.push(match[0]);
        totalMatches++;
      }
    }

    if (totalMatches === 0) return null;

    // Calculate confidence based on matches and content length
    const baseConfidence = Math.min(90, (totalMatches / patterns.length) * 100);
    const lengthAdjustment = Math.min(10, content.length / 50); // Longer content = more confidence
    const confidence = Math.round(baseConfidence + lengthAdjustment);

    return {
      type: biasType,
      confidence,
      severity: this.calculateSeverity(confidence, totalMatches),
      description: this.getBiasDescription(biasType),
      evidence: matches,
      gentleSuggestion: this.getGentleSuggestion(biasType),
      expandingQuestions: this.getExpandingQuestions(biasType)
    };
  }

  private calculateSeverity(confidence: number, matches: number): 'low' | 'medium' | 'high' {
    if (confidence > 80 || matches > 2) return 'high';
    if (confidence > 65 || matches > 1) return 'medium';
    return 'low';
  }

  private getBiasDescription(biasType: BiasType): string {
    const descriptions = {
      confirmation_bias: "Looking for information that confirms what you already believe",
      anchoring_bias: "Heavily influenced by the first piece of information encountered",
      availability_heuristic: "Judging likelihood based on how easily examples come to mind",
      black_white_thinking: "Seeing situations in extremes without considering middle ground",
      emotional_reasoning: "Letting emotions drive conclusions rather than evidence",
      hasty_generalization: "Drawing broad conclusions from limited examples",
      echo_chamber: "Only considering perspectives similar to your own",
      sunk_cost_fallacy: "Continuing something because of past investment rather than future value",
      perfectionism_trap: "Letting the pursuit of perfection prevent progress",
      analysis_paralysis: "Overthinking without taking action"
    };

    return descriptions[biasType];
  }

  private getGentleSuggestion(biasType: BiasType): string {
    const suggestions = {
      confirmation_bias: "💭 What evidence might challenge this view? Sometimes the most valuable insights come from unexpected sources.",
      anchoring_bias: "🔄 Take a step back - if you learned about this differently, might your perspective change?",
      availability_heuristic: "📊 Consider: are recent examples skewing your view? The full picture might be more nuanced.",
      black_white_thinking: "🌈 What might exist in the middle ground? Reality often has more shades than we first see.",
      emotional_reasoning: "⚖️ Your feelings are valid and important - and there might be other angles worth exploring too.",
      hasty_generalization: "🔍 This example is interesting - what other cases might tell a different story?",
      echo_chamber: "👂 What would someone who completely disagrees say? Their view might reveal blind spots.",
      sunk_cost_fallacy: "🎯 Focus on where you're going, not where you've been. What does the future landscape look like?",
      perfectionism_trap: "🚀 Progress beats perfection every time. What's the smallest step you could take right now?",
      analysis_paralysis: "⚡ Sometimes action creates clarity better than more thinking. What's one small experiment you could try?"
    };

    return suggestions[biasType];
  }

  private getExpandingQuestions(biasType: BiasType): string[] {
    const questions = {
      confirmation_bias: [
        "What evidence would change my mind about this?",
        "Who would disagree with me and why?",
        "What am I not seeing here?"
      ],
      anchoring_bias: [
        "If I learned about this completely fresh, what would I think?",
        "What other starting points could I consider?",
        "How might this look from a different angle?"
      ],
      availability_heuristic: [
        "What examples am I not remembering?",
        "Is this really as common as it feels?",
        "What data would give me a fuller picture?"
      ],
      black_white_thinking: [
        "What's between these extremes?",
        "How could both sides be partially right?",
        "What nuances am I missing?"
      ],
      emotional_reasoning: [
        "What would I think about this when calm?",
        "What facts support or challenge this feeling?",
        "How might someone neutral see this?"
      ],
      hasty_generalization: [
        "How many examples do I actually have?",
        "What counter-examples exist?",
        "What don't I know yet?"
      ],
      echo_chamber: [
        "Who thinks differently about this?",
        "What perspectives am I not hearing?",
        "Where can I find different viewpoints?"
      ],
      sunk_cost_fallacy: [
        "If I started fresh today, what would I choose?",
        "What are the future costs and benefits?",
        "What would I advise a friend in this situation?"
      ],
      perfectionism_trap: [
        "What's good enough for now?",
        "How can I improve iteratively?",
        "What's the real risk of imperfection here?"
      ],
      analysis_paralysis: [
        "What decision would I make with current information?",
        "What's the cost of not deciding?",
        "What can I learn by trying something small?"
      ]
    };

    return questions[biasType] || [];
  }

  private generateAlternativeFrames(content: string, biasType: BiasType): string[] {
    // Generate alternative ways to frame the same situation
    const frames = [
      "From a different cultural perspective...",
      "If I were advising a friend in this situation...",
      "Looking at this through a scientist's lens...",
      "Considering the long-term implications...",
      "From the perspective of someone who disagrees..."
    ];

    return frames.slice(0, 3); // Return top 3 relevant frames
  }

  private generateCounterQuestions(content: string, biasType: BiasType): string[] {
    // Generate questions that specifically challenge the detected bias
    return this.getExpandingQuestions(biasType);
  }

  private generateBroadeningsSuggestions(content: string, biasType: BiasType): string[] {
    const suggestions = [
      "Seek out three different perspectives on this topic",
      "Find data or research that might challenge your view",
      "Talk to someone who would naturally disagree",
      "Consider how this might look in 10 years",
      "Explore what you might be wrong about"
    ];

    return suggestions.slice(0, 3);
  }

  private updateUserPatterns(detections: BiasDetection[]): void {
    if (!this.userPatterns) {
      this.userPatterns = {
        userId: 'current_user',
        commonBiases: [],
        strengthAreas: [],
        growthOpportunities: [],
        recentProgress: []
      };
    }

    // Track common biases
    detections.forEach(detection => {
      if (!this.userPatterns!.commonBiases.includes(detection.type)) {
        this.userPatterns!.commonBiases.push(detection.type);
      }
    });

    // Keep only recent patterns (last 10)
    this.userPatterns.commonBiases = this.userPatterns.commonBiases.slice(-10);

    this.saveUserPatterns();
  }

  private loadUserPatterns(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.userPatterns = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load bias patterns:', error);
    }
  }

  private saveUserPatterns(): void {
    try {
      if (this.userPatterns) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.userPatterns));
      }
    } catch (error) {
      console.warn('Could not save bias patterns:', error);
    }
  }
}

export default CognitiveBiasDetector;