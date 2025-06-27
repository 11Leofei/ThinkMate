/**
 * 🍎 Realtime Guidance - Jobs' Gentle Thinking Mentor
 * "The best teachers are invisible until you need them."
 * 
 * Like having a wise mentor whispering insights as you think.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThinkingCoach, { GuidanceSuggestion } from './ThinkingCoach';

interface RealtimeGuidanceProps {
  currentThought: string;
  qualityScore: number;
  isTyping: boolean;
  onGuidanceInteraction?: (guidance: GuidanceSuggestion, action: 'applied' | 'dismissed') => void;
  className?: string;
}

const RealtimeGuidance: React.FC<RealtimeGuidanceProps> = ({
  currentThought,
  qualityScore,
  isTyping,
  onGuidanceInteraction,
  className = ''
}) => {
  const [coach] = useState(() => ThinkingCoach.getInstance());
  const [currentGuidance, setCurrentGuidance] = useState<GuidanceSuggestion | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [guidanceHistory, setGuidanceHistory] = useState<GuidanceSuggestion[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounce guidance requests while typing
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (isTyping && currentThought.length > 30) {
      debounceTimer.current = setTimeout(async () => {
        const guidance = await coach.getRealtimeGuidance(currentThought, qualityScore);
        if (guidance && shouldShowGuidance(guidance)) {
          setCurrentGuidance(guidance);
          setShowGuidance(true);
          setIsMinimized(false);
        }
      }, 2000); // Wait 2 seconds of no typing
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [currentThought, qualityScore, isTyping, coach]);

  const shouldShowGuidance = (guidance: GuidanceSuggestion): boolean => {
    // Don't show same guidance repeatedly
    const recentGuidance = guidanceHistory.slice(-3);
    return !recentGuidance.some(g => g.content === guidance.content);
  };

  const handleApplyGuidance = () => {
    if (currentGuidance) {
      setGuidanceHistory(prev => [...prev, currentGuidance]);
      onGuidanceInteraction?.(currentGuidance, 'applied');
      setShowGuidance(false);
      
      // Show subtle confirmation
      setTimeout(() => {
        setCurrentGuidance({
          type: 'encouragement',
          content: '✨ Great! Keep going with that insight.',
          context: 'Guidance applied',
          urgency: 'immediate'
        });
        setShowGuidance(true);
        setTimeout(() => setShowGuidance(false), 3000);
      }, 500);
    }
  };

  const handleDismissGuidance = () => {
    if (currentGuidance) {
      onGuidanceInteraction?.(currentGuidance, 'dismissed');
      setShowGuidance(false);
    }
  };

  const getGuidanceIcon = (type: GuidanceSuggestion['type']): string => {
    const icons = {
      tip: '💡',
      question: '❓',
      challenge: '🎯',
      encouragement: '✨'
    };
    return icons[type] || '💭';
  };

  const getGuidanceColor = (type: GuidanceSuggestion['type']): string => {
    const colors = {
      tip: 'from-blue-500 to-blue-600',
      question: 'from-purple-500 to-purple-600',
      challenge: 'from-orange-500 to-orange-600',
      encouragement: 'from-green-500 to-green-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getUrgencyAnimation = (urgency: GuidanceSuggestion['urgency']) => {
    if (urgency === 'immediate') {
      return {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 2, repeat: Infinity }
      };
    }
    return {};
  };

  return (
    <AnimatePresence>
      {showGuidance && currentGuidance && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20 }}
          className={`fixed bottom-24 right-8 z-40 ${className}`}
          {...getUrgencyAnimation(currentGuidance.urgency)}
        >
          {/* Main Guidance Card */}
          <motion.div
            layout
            className={`
              bg-gradient-to-br ${getGuidanceColor(currentGuidance.type)}
              text-white rounded-2xl shadow-2xl
              ${isMinimized ? 'w-16 h-16' : 'max-w-sm'}
              overflow-hidden backdrop-blur-sm
              border border-white/20
            `}
          >
            {!isMinimized ? (
              <>
                {/* Header */}
                <div className="px-5 py-4 border-b border-white/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="text-2xl"
                      >
                        {getGuidanceIcon(currentGuidance.type)}
                      </motion.div>
                      <div>
                        <h3 className="font-semibold capitalize">
                          {currentGuidance.type === 'tip' ? 'Thinking Tip' :
                           currentGuidance.type === 'question' ? 'Reflective Question' :
                           currentGuidance.type === 'challenge' ? 'Thinking Challenge' :
                           'Encouragement'}
                        </h3>
                        <p className="text-xs opacity-80">{currentGuidance.context}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMinimized(true)}
                      className="text-white/60 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-white leading-relaxed"
                  >
                    {currentGuidance.content}
                  </motion.p>

                  {currentGuidance.targetSkill && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-3 inline-flex items-center space-x-1 text-xs bg-white/20 px-2 py-1 rounded-full"
                    >
                      <span>🎯</span>
                      <span>Building: {currentGuidance.targetSkill}</span>
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-3 bg-black/10 flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDismissGuidance}
                    className="text-sm text-white/70 hover:text-white"
                  >
                    Maybe later
                  </motion.button>

                  {currentGuidance.type !== 'encouragement' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplyGuidance}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors"
                    >
                      {currentGuidance.type === 'question' ? 'Reflect' :
                       currentGuidance.type === 'challenge' ? 'Accept' :
                       'Apply'}
                    </motion.button>
                  )}
                </div>
              </>
            ) : (
              /* Minimized State */
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMinimized(false)}
                className="w-full h-full flex items-center justify-center text-2xl"
              >
                {getGuidanceIcon(currentGuidance.type)}
              </motion.button>
            )}
          </motion.div>

          {/* Floating Particles Effect */}
          {!isMinimized && currentGuidance.type === 'encouragement' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ 
                    x: 0, 
                    y: 0,
                    opacity: 0.6
                  }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 100,
                    y: -(Math.random() * 50 + 50),
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  style={{
                    left: '50%',
                    bottom: '20%'
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 🎯 Guidance Indicator - Shows when coach has insights
 */
export const GuidanceIndicator: React.FC<{
  hasGuidance: boolean;
  onClick?: () => void;
}> = ({ hasGuidance, onClick }) => {
  if (!hasGuidance) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white z-30"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1
        }}
      >
        💡
      </motion.div>
      
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 bg-purple-400 rounded-full"
        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.button>
  );
};

export default RealtimeGuidance;