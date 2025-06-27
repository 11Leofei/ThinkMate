/**
 * 🍎 Perspective Expander Service - Jobs' Mind Opening Magic
 * "Think different isn't just a slogan, it's a way of being."
 * 
 * Like iPhone's predictive text - anticipate what the mind needs to grow.
 */

import CognitiveBiasDetector, { BiasType, PerspectiveExpansion } from './CognitiveBiasDetector';

export interface PerspectiveChallenge {
  title: string;
  description: string;
  exercises: PerspectiveExercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string; // "5 minutes", "10 minutes", etc.
}

export interface PerspectiveExercise {
  type: 'role_play' | 'devil_advocate' | 'time_shift' | 'cultural_lens' | 'data_seek';
  prompt: string;
  example?: string;
  followUpQuestions: string[];
}

export interface ThinkingStretch {
  originalThought: string;
  stretchDirection: 'broader' | 'deeper' | 'opposite' | 'future' | 'past';
  stretchPrompt: string;
  guidingQuestions: string[];
  inspirationSources: string[];
}

class PerspectiveExpander {
  private static instance: PerspectiveExpander;
  private detector: CognitiveBiasDetector;

  public static getInstance(): PerspectiveExpander {
    if (!PerspectiveExpander.instance) {
      PerspectiveExpander.instance = new PerspectiveExpander();
    }
    return PerspectiveExpander.instance;
  }

  constructor() {
    this.detector = CognitiveBiasDetector.getInstance();
  }

  /**
   * 🎯 Generate daily perspective challenge
   * Jobs: "Stay hungry, stay foolish" - daily intellectual adventure
   */
  public generateDailyChallenge(): PerspectiveChallenge {
    const challenges = [
      {
        title: "The Devil's Advocate Hour",
        description: "Spend time arguing against something you strongly believe",
        difficulty: 'intermediate' as const,
        estimatedTime: "15 minutes",
        exercises: [
          {
            type: 'devil_advocate' as const,
            prompt: "Pick a strong opinion you hold and argue the opposite side for 10 minutes",
            example: "If you believe social media is harmful, argue why it's beneficial",
            followUpQuestions: [
              "What valid points did you discover?",
              "Which opposing arguments surprised you?",
              "How has your original view evolved?"
            ]
          }
        ]
      },
      {
        title: "Time Traveler's Perspective",
        description: "View today's problems through the lens of different time periods",
        difficulty: 'beginner' as const,
        estimatedTime: "10 minutes",
        exercises: [
          {
            type: 'time_shift' as const,
            prompt: "How would someone from 100 years ago view a current challenge you're facing?",
            example: "How would someone from 1924 think about remote work dilemmas?",
            followUpQuestions: [
              "What would they prioritize differently?",
              "What wisdom from the past applies?",
              "What seems trivial from that perspective?"
            ]
          }
        ]
      },
      {
        title: "Cultural Kaleidoscope",
        description: "Examine situations through different cultural lenses",
        difficulty: 'intermediate' as const,
        estimatedTime: "12 minutes",
        exercises: [
          {
            type: 'cultural_lens' as const,
            prompt: "How might someone from a completely different culture approach your current situation?",
            example: "How might a Japanese vs. Brazilian vs. Scandinavian perspective differ?",
            followUpQuestions: [
              "What values would they prioritize?",
              "What solutions would they suggest?",
              "What assumptions would they question?"
            ]
          }
        ]
      },
      {
        title: "Data Detective Challenge",
        description: "Question your assumptions by seeking contradicting evidence",
        difficulty: 'advanced' as const,
        estimatedTime: "20 minutes",
        exercises: [
          {
            type: 'data_seek' as const,
            prompt: "Find three pieces of evidence that challenge something you're certain about",
            example: "If you think morning workouts are best, find evidence for evening workouts",
            followUpQuestions: [
              "What evidence was most surprising?",
              "How strong is the contradicting case?",
              "What nuances did you miss before?"
            ]
          }
        ]
      },
      {
        title: "Role Reversal Reality",
        description: "Step into the shoes of someone who disagrees with you",
        difficulty: 'beginner' as const,
        estimatedTime: "8 minutes",
        exercises: [
          {
            type: 'role_play' as const,
            prompt: "Embody someone who has the opposite view and think through their reasoning",
            example: "If you love cities, think as someone who prefers rural life",
            followUpQuestions: [
              "What experiences shaped their view?",
              "Where is their logic sound?",
              "What do they value that you might overlook?"
            ]
          }
        ]
      }
    ];

    // Return random challenge, or could be based on user's bias patterns
    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  /**
   * 🧩 Create thinking stretch for specific thought
   * Jobs: "Innovation comes from saying no to 1,000 things"
   */
  public createThinkingStretch(thought: string): ThinkingStretch {
    const stretchDirections: Array<ThinkingStretch['stretchDirection']> = [
      'broader', 'deeper', 'opposite', 'future', 'past'
    ];

    const direction = stretchDirections[Math.floor(Math.random() * stretchDirections.length)];

    return {
      originalThought: thought,
      stretchDirection: direction,
      stretchPrompt: this.generateStretchPrompt(thought, direction),
      guidingQuestions: this.generateStretchQuestions(direction),
      inspirationSources: this.generateInspirationSources(direction)
    };
  }

  /**
   * 🌈 Generate perspective expansion specifically for detected bias
   */
  public expandAroundBias(thought: string, biasType: BiasType): PerspectiveExpansion | null {
    return this.detector.expandPerspective(thought, biasType);
  }

  /**
   * 🎨 Create custom perspective exercise
   */
  public createCustomExercise(
    thoughtContent: string,
    focusArea: 'empathy' | 'creativity' | 'logic' | 'wisdom'
  ): PerspectiveExercise {
    const exercises = {
      empathy: {
        type: 'role_play' as const,
        prompt: "Imagine you're someone deeply affected by this situation. How do they feel and think?",
        followUpQuestions: [
          "What emotions would they experience?",
          "What would be their biggest concerns?",
          "How would their daily life be impacted?"
        ]
      },
      creativity: {
        type: 'cultural_lens' as const,
        prompt: "If you were a creative artist, how would you express this situation through art?",
        followUpQuestions: [
          "What metaphors capture the essence?",
          "What unexpected connections do you see?",
          "How could you make this beautiful or inspiring?"
        ]
      },
      logic: {
        type: 'data_seek' as const,
        prompt: "What data or evidence would you need to be completely confident in this thinking?",
        followUpQuestions: [
          "What assumptions need verification?",
          "Where might the logic have gaps?",
          "What would a scientist question?"
        ]
      },
      wisdom: {
        type: 'time_shift' as const,
        prompt: "How would the wisest person you know approach this situation?",
        followUpQuestions: [
          "What long-term perspective would they bring?",
          "What principles would guide them?",
          "What would they see that you're missing?"
        ]
      }
    };

    return exercises[focusArea];
  }

  /**
   * 📚 Get perspective reading suggestions
   */
  public getSuggestedReading(biasType?: BiasType): string[] {
    const generalSuggestions = [
      "Thinking, Fast and Slow by Daniel Kahneman",
      "The Righteous Mind by Jonathan Haidt",
      "Predictably Irrational by Dan Ariely",
      "Mindset by Carol Dweck",
      "The Black Swan by Nassim Nicholas Taleb"
    ];

    const biasSpecificSuggestions = {
      confirmation_bias: [
        "The Trouble with Physics by Lee Smolin",
        "The Structure of Scientific Revolutions by Thomas Kuhn"
      ],
      black_white_thinking: [
        "Nuance by Yamiche Alcindor",
        "The Righteous Mind by Jonathan Haidt"
      ],
      emotional_reasoning: [
        "Emotional Intelligence by Daniel Goleman",
        "Thinking, Fast and Slow by Daniel Kahneman"
      ],
      echo_chamber: [
        "The Filter Bubble by Eli Pariser",
        "Republic.com 2.0 by Cass Sunstein"
      ]
    };

    if (biasType && biasSpecificSuggestions[biasType]) {
      return [...biasSpecificSuggestions[biasType], ...generalSuggestions.slice(0, 2)];
    }

    return generalSuggestions.slice(0, 3);
  }

  /**
   * 🌍 Generate cross-cultural perspective prompts
   */
  public generateCulturalPerspectives(situation: string): string[] {
    return [
      `How might someone from a collectivist culture (like Japan or Korea) approach this?`,
      `What would an indigenous wisdom tradition say about this?`,
      `How would someone from a high-context culture interpret this differently?`,
      `What perspective would someone from a different economic background bring?`,
      `How might this look through the lens of a different generation?`
    ];
  }

  // 🛠️ Private helper methods

  private generateStretchPrompt(thought: string, direction: ThinkingStretch['stretchDirection']): string {
    const prompts = {
      broader: `How does this thought connect to larger systems, patterns, or universal truths?`,
      deeper: `What fundamental assumptions or root causes lie beneath this thought?`,
      opposite: `What would someone with the completely opposite view say, and why might they be right?`,
      future: `How might someone 50 years in the future view this thought and situation?`,
      past: `What wisdom from history or traditional cultures would apply to this thinking?`
    };

    return prompts[direction];
  }

  private generateStretchQuestions(direction: ThinkingStretch['stretchDirection']): string[] {
    const questions = {
      broader: [
        "What larger patterns does this connect to?",
        "How does this apply to other areas of life?",
        "What universal principles are at play?"
      ],
      deeper: [
        "What's really driving this situation?",
        "What am I not seeing beneath the surface?",
        "What would a therapist or philosopher ask?"
      ],
      opposite: [
        "What would my biggest critic say?",
        "In what ways could I be completely wrong?",
        "What evidence contradicts this view?"
      ],
      future: [
        "How will this matter in 10 years?",
        "What will future generations think of this?",
        "How might technology change this perspective?"
      ],
      past: [
        "How did people handle this before modern times?",
        "What ancient wisdom applies here?",
        "What would our ancestors think of this problem?"
      ]
    };

    return questions[direction];
  }

  private generateInspirationSources(direction: ThinkingStretch['stretchDirection']): string[] {
    const sources = {
      broader: [
        "Systems thinking literature",
        "Philosophy of interconnectedness",
        "Ecology and network science"
      ],
      deeper: [
        "Depth psychology",
        "Root cause analysis methods",
        "Contemplative traditions"
      ],
      opposite: [
        "Debate and dialectic methods",
        "Contrarian thinkers",
        "Alternative perspectives"
      ],
      future: [
        "Science fiction",
        "Future studies",
        "Technology trend analysis"
      ],
      past: [
        "Historical wisdom traditions",
        "Ancient philosophy",
        "Traditional cultures"
      ]
    };

    return sources[direction];
  }
}

export default PerspectiveExpander;