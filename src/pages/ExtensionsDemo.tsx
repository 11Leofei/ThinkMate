/**
 * 🍎 Extensions Demo - Showcase all ThinkMate extensions
 * A simplified demonstration page for all 8 revolutionary extensions
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Import all extensions
import QualityIndicator from '../extensions/quality/QualityIndicator';
import QualityScoreService from '../extensions/quality/QualityScoreService';
import RhythmInsights from '../extensions/rhythm/RhythmInsights';
import ThinkingRhythmDetector from '../extensions/rhythm/ThinkingRhythmDetector';
import WeeklyDigest from '../extensions/essence/WeeklyDigest';
import MomentOfClarity from '../extensions/essence/MomentOfClarity';
import GentleNudge from '../extensions/blindspots/GentleNudge';
import TimeMachine from '../extensions/timemachine/TimeMachine';
import MemoryResurrector from '../extensions/timemachine/MemoryResurrector';
import GravityField from '../extensions/gravity/GravityField';
import ThoughtGravityEngine from '../extensions/gravity/ThoughtGravityEngine';
import AmbientInterface from '../extensions/ambient/AmbientInterface';
import RealtimeGuidance from '../extensions/coach/RealtimeGuidance';
import PersonalizedTrainingPlan from '../extensions/coach/PersonalizedTrainingPlan';
import MilestonesCelebration from '../extensions/coach/MilestonesCelebration';
import ThinkingHealthReport from '../extensions/coach/ThinkingHealthReport';

// Mock data for demonstration
const mockThoughts = [
  { 
    id: '1', 
    content: 'Innovation comes from connecting disparate ideas', 
    timestamp: Date.now() - 3600000,
    qualityScore: 85,
    category: 'insight' as const
  },
  {
    id: '2',
    content: 'The best products anticipate user needs before they realize them',
    timestamp: Date.now() - 7200000,
    qualityScore: 92,
    category: 'insight' as const
  },
  {
    id: '3',
    content: 'Simplicity is the ultimate sophistication',
    timestamp: Date.now() - 10800000,
    qualityScore: 78,
    category: 'idea' as const
  }
];

const ExtensionsDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [currentThought, setCurrentThought] = useState('');
  const [currentQuality, setCurrentQuality] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [thoughtHistory, setThoughtHistory] = useState(mockThoughts);
  const [qualityScores, setQualityScores] = useState([85, 92, 78, 88, 75, 90]);

  // Initialize services
  const [qualityService] = useState(() => QualityScoreService.getInstance());
  const [rhythmDetector] = useState(() => ThinkingRhythmDetector.getInstance());
  const [memoryResurrector] = useState(() => MemoryResurrector.getInstance());
  const [gravityEngine] = useState(() => ThoughtGravityEngine.getInstance());

  useEffect(() => {
    // Initialize services with mock data
    rhythmDetector.startSession();
    mockThoughts.forEach(thought => {
      memoryResurrector.storeMemory(thought.content, thought.qualityScore || 50);
      gravityEngine.addThought(thought.content, thought.qualityScore || 50, thought.category);
    });

    return () => {
      rhythmDetector.endSession();
    };
  }, []);

  const handleThoughtChange = async (value: string) => {
    setCurrentThought(value);
    setIsTyping(value.length > 0);

    if (value.length > 20) {
      const quality = await qualityService.processThought(value);
      setCurrentQuality(quality.overall);
      rhythmDetector.recordThought(quality.overall);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: '🍎' },
    { id: 'quality', label: 'Quality System', icon: '💎' },
    { id: 'rhythm', label: 'Rhythm Detection', icon: '🎵' },
    { id: 'essence', label: 'Essence Extraction', icon: '✨' },
    { id: 'blindspots', label: 'Bias Detection', icon: '🧠' },
    { id: 'timemachine', label: 'Time Machine', icon: '⏰' },
    { id: 'gravity', label: 'Gravity Field', icon: '🌌' },
    { id: 'ambient', label: 'Ambient UI', icon: '🎨' },
    { id: 'coach', label: 'Thinking Coach', icon: '🎯' }
  ];

  return (
    <AmbientInterface>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
              <span>🍎</span>
              <span>ThinkMate Extensions Demo</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Experience all 8 revolutionary thinking enhancements
            </p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto py-2">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Demo Input Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Try it yourself
            </h2>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <QualityIndicator score={currentQuality} size="large" />
              </div>
              <div className="flex-1">
                <textarea
                  value={currentThought}
                  onChange={(e) => handleThoughtChange(e.target.value)}
                  placeholder="Start typing a thought to see real-time analysis..."
                  className="w-full h-24 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:border-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <div className="mt-2 text-sm text-gray-500">
                  Quality Score: {currentQuality}/100
                </div>
              </div>
            </div>
          </div>

          {/* Section Content */}
          <div className="space-y-8">
            {activeSection === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose dark:prose-invert max-w-none"
              >
                <h2>Welcome to ThinkMate Extensions</h2>
                <p>
                  Following Steve Jobs' vision of creating magical user experiences, 
                  we've built 8 groundbreaking extensions that transform thinking from 
                  a task into a delightful journey.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {sections.slice(1).map((section) => (
                    <motion.div
                      key={section.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 cursor-pointer"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <div className="text-3xl mb-3">{section.icon}</div>
                      <h3 className="text-lg font-semibold mb-2">{section.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to explore this extension
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeSection === 'quality' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  💎 Thought Quality System
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time quality analysis of your thoughts - like iPhone battery health for your mind.
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Current Thought Quality</h3>
                      <QualityIndicator score={currentQuality} size="large" showDetails={true} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Quality Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Clarity</span>
                          <span className="font-medium">{Math.round(currentQuality * 0.9)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Depth</span>
                          <span className="font-medium">{Math.round(currentQuality * 0.85)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Originality</span>
                          <span className="font-medium">{Math.round(currentQuality * 0.8)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coherence</span>
                          <span className="font-medium">{Math.round(currentQuality * 0.95)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'rhythm' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  🎵 Cognitive Rhythm Detection
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Discovers your optimal thinking times and cognitive patterns.
                </p>
                <RhythmInsights showDetailed={true} />
              </motion.div>
            )}

            {activeSection === 'essence' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ✨ Essence Extraction
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Creates beautiful summaries of your thinking journey.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WeeklyDigest autoShow={false} />
                  <MomentOfClarity thoughts={thoughtHistory} autoTrigger={false} />
                </div>
              </motion.div>
            )}

            {activeSection === 'blindspots' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  🧠 Cognitive Bias Detection
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Gently expands your perspective without judgment.
                </p>
                <GentleNudge 
                  thoughtContent={currentThought || "I think all successful people are just lucky"}
                  autoShow={true}
                />
              </motion.div>
            )}

            {activeSection === 'timemachine' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ⏰ Memory Resurrection
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Time machine for your thoughts - intelligently connects past insights.
                </p>
                <TimeMachine 
                  currentThought={currentThought}
                  autoTrigger={true}
                />
              </motion.div>
            )}

            {activeSection === 'gravity' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  🌌 Thought Gravity Field
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Visualizes invisible connections between ideas using physics simulation.
                </p>
                <GravityField 
                  autoSimulate={true}
                  showInsights={true}
                  className="h-96"
                />
              </motion.div>
            )}

            {activeSection === 'ambient' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  🎨 Ambient Intelligence
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  The entire interface adapts to time, weather, and your energy. 
                  Notice how the theme changes throughout the day!
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <p className="text-blue-800 dark:text-blue-200">
                    This entire demo is wrapped in AmbientInterface - 
                    the colors and suggestions adapt to your context.
                  </p>
                </div>
              </motion.div>
            )}

            {activeSection === 'coach' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  🎯 Thinking Coach System
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your personal AI thinking mentor - like having Steve Jobs guide your growth.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PersonalizedTrainingPlan 
                    userId="demo-user"
                    onStartExercise={(exercise) => console.log('Starting exercise:', exercise)}
                  />
                  
                  <ThinkingHealthReport
                    userId="demo-user"
                    thoughtHistory={thoughtHistory}
                    qualityScores={qualityScores}
                    period="week"
                  />
                </div>

                <RealtimeGuidance
                  currentThought={currentThought}
                  qualityScore={currentQuality}
                  isTyping={isTyping}
                />

                <MilestonesCelebration
                  userId="demo-user"
                  thoughtHistory={thoughtHistory}
                  qualityScores={qualityScores}
                />
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </AmbientInterface>
  );
};

export default ExtensionsDemo;