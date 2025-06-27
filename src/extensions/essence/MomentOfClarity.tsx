/**
 * 🍎 Moment of Clarity Component - Jobs' Spotlight Feature
 * "Focus means saying no to the hundred other good ideas."
 * 
 * Like iPhone's Live Photos - capture the magical moment when insight strikes.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EssenceExtractor, { ThoughtEssence } from './EssenceExtractor';

interface MomentOfClarityProps {
  thoughts?: any[]; // Recent thoughts to analyze
  className?: string;
  autoTrigger?: boolean; // Auto-show when breakthrough detected
}

const MomentOfClarity: React.FC<MomentOfClarityProps> = ({
  thoughts = [],
  className = '',
  autoTrigger = true
}) => {
  const [extractor] = useState(() => EssenceExtractor.getInstance());
  const [crownJewel, setCrownJewel] = useState<ThoughtEssence | null>(null);
  const [showMoment, setShowMoment] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (autoTrigger && thoughts.length > 0) {
      detectClarityMoment();
    }
  }, [thoughts, autoTrigger, extractor]);

  const detectClarityMoment = async () => {
    if (thoughts.length === 0) return;

    setIsAnalyzing(true);
    try {
      const jewel = await extractor.findCrownJewel(thoughts);
      if (jewel && jewel.impactScore > 85) { // Only show exceptional thoughts
        setCrownJewel(jewel);
        setShowMoment(true);
      }
    } catch (error) {
      console.error('Failed to detect clarity moment:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const manualTrigger = async () => {
    if (thoughts.length === 0) {
      // Get recent thoughts from storage
      try {
        const stored = localStorage.getItem('thinkmate_thoughts');
        const recentThoughts = stored ? JSON.parse(stored).slice(-10) : [];
        const jewel = await extractor.findCrownJewel(recentThoughts);
        if (jewel) {
          setCrownJewel(jewel);
          setShowMoment(true);
        }
      } catch (error) {
        console.error('Failed to find crown jewel:', error);
      }
    } else {
      detectClarityMoment();
    }
  };

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center justify-center p-4 ${className}`}
      >
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-4xl mb-2"
          >
            💎
          </motion.div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Searching for your moment of clarity...
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {/* Trigger Button */}
      {!showMoment && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={manualTrigger}
          className="w-full p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">💎</span>
            <div className="text-left">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">
                Find Your Crown Jewel
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                Discover your most impactful thought
              </div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Clarity Moment Display */}
      <AnimatePresence>
        {showMoment && crownJewel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.6
            }}
            className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg overflow-hidden"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-200/30 dark:bg-yellow-600/20 rounded-full"
              />
              <motion.div
                animate={{ 
                  rotate: [360, 0],
                  scale: [1.1, 1, 1.1]
                }}
                transition={{ 
                  duration: 15, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute -bottom-5 -left-5 w-16 h-16 bg-orange-200/30 dark:bg-orange-600/20 rounded-full"
              />
            </div>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMoment(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors z-10"
            >
              ×
            </motion.button>

            {/* Crown Jewel Content */}
            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-6xl mb-3"
                >
                  💎
                </motion.div>
                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  Your Crown Jewel
                </h2>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  This thought shines brightest in your mental treasury
                </p>
              </motion.div>

              {/* Impact Score Visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="relative">
                  <svg width="120" height="120" className="transform -rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-yellow-200 dark:text-yellow-800"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 50}
                      initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 50 * (1 - crownJewel.impactScore / 100)
                      }}
                      transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
                      className="text-yellow-500 dark:text-yellow-400 drop-shadow-sm"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, type: "spring", damping: 15 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                        {crownJewel.impactScore}
                      </div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        Impact
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* The Thought Itself */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 border border-yellow-300 dark:border-yellow-700"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <span className="text-2xl">
                    {crownJewel.category === 'breakthrough' ? '💡' :
                     crownJewel.category === 'wisdom' ? '🦉' :
                     crownJewel.category === 'pattern' ? '🔍' :
                     crownJewel.category === 'question' ? '❓' : '🔗'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300 text-sm capitalize mb-1">
                      {crownJewel.category}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(crownJewel.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-medium mb-4"
                >
                  "{crownJewel.essenceText}"
                </motion.p>

                {/* Tags */}
                {crownJewel.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="flex flex-wrap gap-2"
                  >
                    {crownJewel.tags.map((tag, index) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.6 + index * 0.1 }}
                        className="px-3 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm rounded-full"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Celebration Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="text-center mt-6"
              >
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                  🌟 This thought represents your thinking at its finest 🌟
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  Save it, share it, let it inspire your next breakthrough
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="flex justify-center space-x-3 mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigator.clipboard.writeText(`"${crownJewel.essenceText}" - My moment of clarity`);
                    // Could show a toast notification here
                  }}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  📋 Copy
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMoment(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  ✨ Treasure It
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MomentOfClarity;