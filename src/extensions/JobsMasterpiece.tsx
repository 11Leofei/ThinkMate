/**
 * 🍎 Jobs' Masterpiece - The Ultimate ThinkMate Experience
 * "This isn't just about adding features. This is about creating magic."
 * 
 * The culmination of all extensions working in perfect harmony.
 * Like the iPhone - simple on the surface, sophisticated underneath.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all our revolutionary extensions
import QualityIndicator, { QualityDashboard } from './quality/QualityIndicator';
import QualityScoreService from './quality/QualityScoreService';
import RhythmInsights from './rhythm/RhythmInsights';
import ThinkingRhythmDetector from './rhythm/ThinkingRhythmDetector';
import WeeklyDigest from './essence/WeeklyDigest';
import MomentOfClarity from './essence/MomentOfClarity';
import TimeMachine from './timemachine/TimeMachine';
import MemoryResurrector from './timemachine/MemoryResurrector';
import GravityField from './gravity/GravityField';
import ThoughtGravityEngine from './gravity/ThoughtGravityEngine';
import GentleNudge from './blindspots/GentleNudge';
import CognitiveBiasDetector from './blindspots/CognitiveBiasDetector';
import AmbientInterface from './ambient/AmbientInterface';

interface JobsMasterpieceProps {
  className?: string;
}

interface ThoughtInput {
  content: string;
  timestamp: number;
  qualityScore?: number;
}

const JobsMasterpiece: React.FC<JobsMasterpieceProps> = ({ className = '' }) => {
  // Core state management
  const [currentThought, setCurrentThought] = useState('');
  const [thoughtHistory, setThoughtHistory] = useState<ThoughtInput[]>([]);
  const [activeView, setActiveView] = useState<'input' | 'insights' | 'connections' | 'timemachine'>('input');
  const [showMagicMoments, setShowMagicMoments] = useState(false);

  // Service instances - Jobs loved singletons for consistency
  const [qualityService] = useState(() => QualityScoreService.getInstance());
  const [rhythmDetector] = useState(() => ThinkingRhythmDetector.getInstance());
  const [memoryResurrector] = useState(() => MemoryResurrector.getInstance());
  const [gravityEngine] = useState(() => ThoughtGravityEngine.getInstance());
  const [biasDetector] = useState(() => CognitiveBiasDetector.getInstance());

  // Real-time states
  const [currentQuality, setCurrentQuality] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [magicMoments, setMagicMoments] = useState<any[]>([]);

  const thoughtInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initialize the magic - start rhythm detection
    rhythmDetector.startSession();
    
    return () => {
      rhythmDetector.endSession();
    };
  }, []);

  /**
   * 🎯 Handle thought input with Jobs-level intelligence
   */
  const handleThoughtChange = async (value: string) => {
    setCurrentThought(value);
    setIsTyping(value.length > 0);

    // Real-time quality analysis (like spell-check, but for thinking)
    if (value.length > 20) {
      const quality = await qualityService.processThought(value);
      setCurrentQuality(quality.overall);
      
      // Record in rhythm detector
      rhythmDetector.recordThought(quality.overall);
      
      // Check for magic moments
      await detectMagicMoments(value, quality.overall);
    }
  };

  /**
   * ✨ Detect and celebrate magic moments
   */
  const detectMagicMoments = async (content: string, quality: number) => {
    const moments = [];

    // High quality thought moment
    if (quality > 85) {
      moments.push({
        type: 'quality_breakthrough',
        message: '🌟 Exceptional thinking detected!',
        action: () => setShowMagicMoments(true)
      });
    }

    // Memory resurrection moment
    const memories = await memoryResurrector.resurrectRelevantMemories(content);
    if (memories.length > 0) {
      moments.push({
        type: 'memory_connection',
        message: `💫 Connected to ${memories.length} past insights`,
        action: () => setActiveView('timemachine')
      });
    }

    // Bias detection moment
    const biases = biasDetector.analyzeThought(content);
    if (biases.length > 0 && biases[0].confidence > 70) {
      moments.push({
        type: 'perspective_expansion',
        message: '🔍 Alternative perspective available',
        action: () => setShowMagicMoments(true)
      });
    }

    setMagicMoments(moments);
  };

  /**
   * 💎 Save thought with full ceremony
   */
  const saveThought = async () => {
    if (!currentThought.trim()) return;

    const thought: ThoughtInput = {
      content: currentThought,
      timestamp: Date.now(),
      qualityScore: currentQuality
    };

    // Store in all systems simultaneously
    setThoughtHistory(prev => [thought, ...prev]);
    
    // Store in memory resurrector
    memoryResurrector.storeMemory(thought.content, currentQuality);
    
    // Add to gravity field
    gravityEngine.addThought(thought.content, currentQuality);
    
    // Clear input with satisfaction animation
    setCurrentThought('');
    setCurrentQuality(0);
    setIsTyping(false);
    
    // Brief celebration
    setShowMagicMoments(true);
    setTimeout(() => setShowMagicMoments(false), 2000);

    // Focus back on input - Jobs loved smooth workflows
    setTimeout(() => thoughtInputRef.current?.focus(), 100);
  };

  /**
   * ⌨️ Handle keyboard shortcuts - Jobs loved keyboard efficiency
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          saveThought();
          break;
        case '1':
          e.preventDefault();
          setActiveView('input');
          break;
        case '2':
          e.preventDefault();
          setActiveView('insights');
          break;
        case '3':
          e.preventDefault();
          setActiveView('connections');
          break;
        case '4':
          e.preventDefault();
          setActiveView('timemachine');
          break;
      }
    }
  };

  return (
    <AmbientInterface className={className}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-1000">
        
        {/* Magic Moments Overlay */}
        <AnimatePresence>
          {showMagicMoments && (
            <MagicMomentsOverlay 
              moments={magicMoments}
              onClose={() => setShowMagicMoments(false)}
            />
          )}
        </AnimatePresence>

        {/* Navigation - Jobs loved clear, simple navigation */}
        <JobsNavigation 
          activeView={activeView}
          onViewChange={setActiveView}
          thoughtCount={thoughtHistory.length}
        />

        {/* Main Content Area */}
        <div className="container mx-auto px-4 pt-20 pb-8">
          <AnimatePresence mode="wait">
            
            {/* Primary Input View - The heart of ThinkMate */}
            {activeView === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* Hero Input Area */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
                  <div className="flex items-start space-x-4">
                    
                    {/* Quality Indicator */}
                    <div className="flex-shrink-0 pt-2">
                      <QualityIndicator 
                        score={currentQuality}
                        size="large"
                        showDetails={true}
                      />
                    </div>

                    {/* Main Input */}
                    <div className="flex-1">
                      <textarea
                        ref={thoughtInputRef}
                        value={currentThought}
                        onChange={(e) => handleThoughtChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What's on your mind? Let your thoughts flow..."
                        className="w-full h-32 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:border-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        autoFocus
                      />
                      
                      {/* Input Footer */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {isTyping && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center space-x-1"
                            >
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                              <span>Analyzing quality...</span>
                            </motion.span>
                          )}
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={saveThought}
                          disabled={!currentThought.trim()}
                          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                        >
                          Save Thought ⌘⏎
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Assistants */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Gentle Nudge */}
                  <GentleNudge 
                    thoughtContent={currentThought}
                    autoShow={true}
                  />
                  
                  {/* Rhythm Insights */}
                  <RhythmInsights showDetailed={false} />
                  
                  {/* Moment of Clarity */}
                  <MomentOfClarity 
                    thoughts={thoughtHistory}
                    autoTrigger={true}
                  />
                  
                  {/* Time Machine Trigger */}
                  <TimeMachine 
                    currentThought={currentThought}
                    autoTrigger={false}
                  />
                </div>
              </motion.div>
            )}

            {/* Insights Dashboard */}
            {activeView === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <QualityDashboard />
                  <RhythmInsights showDetailed={true} />
                  <WeeklyDigest autoShow={false} />
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">🏆 Thinking Achievements</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-200">Quality Streaks</div>
                          <div className="text-sm text-green-600 dark:text-green-400">3 high-quality thoughts in a row</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-2xl">🔗</span>
                        <div>
                          <div className="font-medium text-blue-800 dark:text-blue-200">Connection Master</div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">Found 15 thought connections</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Connections View */}
            {activeView === 'connections' && (
              <motion.div
                key="connections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto"
              >
                <GravityField 
                  autoSimulate={true}
                  showInsights={true}
                  className="h-96"
                />
              </motion.div>
            )}

            {/* Time Machine View */}
            {activeView === 'timemachine' && (
              <motion.div
                key="timemachine"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <TimeMachine 
                  currentThought={currentThought}
                  autoTrigger={false}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Floating Action Insights */}
        <FloatingInsights 
          thoughtHistory={thoughtHistory}
          currentQuality={currentQuality}
        />
      </div>
    </AmbientInterface>
  );
};

/**
 * 🧭 Jobs Navigation - Clean, purposeful, beautiful
 */
const JobsNavigation: React.FC<{
  activeView: string;
  onViewChange: (view: any) => void;
  thoughtCount: number;
}> = ({ activeView, onViewChange, thoughtCount }) => {
  const navItems = [
    { id: 'input', label: 'Think', icon: '💭', shortcut: '⌘1' },
    { id: 'insights', label: 'Insights', icon: '📊', shortcut: '⌘2' },
    { id: 'connections', label: 'Connections', icon: '🌌', shortcut: '⌘3' },
    { id: 'timemachine', label: 'Memories', icon: '⏰', shortcut: '⌘4' }
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="font-bold text-xl text-gray-900 dark:text-gray-100"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ThinkMate
            </span>
            <span className="text-xs text-gray-500 ml-2">by Jobs</span>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === item.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                <span className="text-xs opacity-60">{item.shortcut}</span>
              </motion.button>
            ))}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{thoughtCount} thoughts</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="System active" />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

/**
 * ✨ Magic Moments Overlay - Celebrate breakthroughs
 */
const MagicMomentsOverlay: React.FC<{
  moments: any[];
  onClose: () => void;
}> = ({ moments, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
      >
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            ✨
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Magic Moment!
          </h2>
          
          {moments.length > 0 && (
            <div className="space-y-3 mb-6">
              {moments.map((moment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    {moment.message}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Continue Thinking
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * 🎈 Floating Insights - Subtle, helpful, delightful
 */
const FloatingInsights: React.FC<{
  thoughtHistory: ThoughtInput[];
  currentQuality: number;
}> = ({ thoughtHistory, currentQuality }) => {
  const [showFloatingTip, setShowFloatingTip] = useState(false);
  const [tipContent, setTipContent] = useState('');

  useEffect(() => {
    if (thoughtHistory.length > 0) {
      const avgQuality = thoughtHistory.slice(0, 5).reduce((sum, t) => sum + (t.qualityScore || 0), 0) / Math.min(5, thoughtHistory.length);
      
      if (avgQuality > 80) {
        setTipContent('🌟 Your thinking quality is exceptional today!');
        setShowFloatingTip(true);
        setTimeout(() => setShowFloatingTip(false), 3000);
      }
    }
  }, [thoughtHistory]);

  return (
    <AnimatePresence>
      {showFloatingTip && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-40"
        >
          {tipContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobsMasterpiece;