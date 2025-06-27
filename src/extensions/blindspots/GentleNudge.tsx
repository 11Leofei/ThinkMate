/**
 * 🍎 Gentle Nudge Component - Jobs' Thoughtful Intervention
 * "The best products don't interrupt, they invite."
 * 
 * Like iPhone's subtle notifications - helpful guidance without being intrusive.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CognitiveBiasDetector, { BiasDetection, PerspectiveExpansion } from './CognitiveBiasDetector';

interface GentleNudgeProps {
  thoughtContent?: string;
  onExpand?: (expansion: PerspectiveExpansion) => void;
  className?: string;
  autoShow?: boolean; // Show automatically when bias detected
}

const GentleNudge: React.FC<GentleNudgeProps> = ({
  thoughtContent = '',
  onExpand,
  className = '',
  autoShow = true
}) => {
  const [detector] = useState(() => CognitiveBiasDetector.getInstance());
  const [detections, setDetections] = useState<BiasDetection[]>([]);
  const [showNudge, setShowNudge] = useState(false);
  const [currentDetection, setCurrentDetection] = useState<BiasDetection | null>(null);
  const [dailyInsight, setDailyInsight] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (thoughtContent && autoShow) {
      analyzeForBiases();
    }
    
    // Set daily insight
    setDailyInsight(detector.getDailyBiasInsight());
  }, [thoughtContent, autoShow, detector]);

  const analyzeForBiases = () => {
    const newDetections = detector.analyzeThought(thoughtContent);
    setDetections(newDetections);
    
    if (newDetections.length > 0 && !hasInteracted) {
      setCurrentDetection(newDetections[0]);
      setShowNudge(true);
    }
  };

  const handleExplorePerspective = () => {
    if (!currentDetection) return;

    const expansion = detector.expandPerspective(thoughtContent, currentDetection.type);
    if (expansion && onExpand) {
      onExpand(expansion);
    }
    
    setHasInteracted(true);
    setShowNudge(false);
  };

  const handleDismiss = () => {
    setHasInteracted(true);
    setShowNudge(false);
  };

  // Show daily insight if no current nudge
  if (!showNudge && dailyInsight && !hasInteracted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <span className="text-lg">🧠</span>
          <div className="flex-1">
            <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">
              Daily Thinking Insight
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {dailyInsight}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setHasInteracted(true)}
            className="text-purple-400 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-300"
          >
            ×
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {showNudge && currentDetection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-orange-200 dark:border-orange-800 overflow-hidden ${className}`}
        >
          {/* Header with bias type indicator */}
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 px-4 py-3 border-b border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BiasIcon biasType={currentDetection.type} />
                <div>
                  <div className="font-medium text-orange-800 dark:text-orange-200 text-sm">
                    Thinking Pattern Noticed
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    {Math.round(currentDetection.confidence)}% confidence
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full bg-orange-200 dark:bg-orange-700 hover:bg-orange-300 dark:hover:bg-orange-600 flex items-center justify-center text-orange-600 dark:text-orange-300 text-sm transition-colors"
              >
                ×
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Gentle description */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-4"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {currentDetection.description}
              </p>
              {currentDetection.evidence.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Noticed in: "{currentDetection.evidence[0]}"
                </div>
              )}
            </div>

            {/* Gentle suggestion */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4"
            >
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {currentDetection.gentleSuggestion}
              </p>
            </div>

            {/* Expanding questions preview */}
            {currentDetection.expandingQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Questions to explore:
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{currentDetection.expandingQuestions[0]}"
                </div>
                {currentDetection.expandingQuestions.length > 1 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    +{currentDetection.expandingQuestions.length - 1} more questions
                  </div>
                )}
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex space-x-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExplorePerspective}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🔍 Explore Different Angles
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Thanks
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 🎨 Bias Icon Component - Visual representation of different biases
 */
const BiasIcon: React.FC<{ biasType: string }> = ({ biasType }) => {
  const iconMap = {
    confirmation_bias: '🔍',
    anchoring_bias: '⚓',
    availability_heuristic: '🧠',
    black_white_thinking: '⚫⚪',
    emotional_reasoning: '❤️',
    hasty_generalization: '⚡',
    echo_chamber: '📢',
    sunk_cost_fallacy: '💸',
    perfectionism_trap: '💎',
    analysis_paralysis: '🤔'
  };

  return (
    <span className="text-lg">
      {iconMap[biasType as keyof typeof iconMap] || '🧠'}
    </span>
  );
};

/**
 * 🌱 Perspective Expansion Component
 * Shows when user chooses to explore different angles
 */
interface PerspectiveExpansionProps {
  expansion: PerspectiveExpansion;
  onClose?: () => void;
  className?: string;
}

export const PerspectiveExpansion: React.FC<PerspectiveExpansionProps> = ({
  expansion,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'frames' | 'questions' | 'suggestions'>('frames');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">🌍 Expanding Your Perspective</h3>
            <p className="text-blue-100 text-sm">Different ways to see the same situation</p>
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
            >
              ×
            </motion.button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {[
            { key: 'frames', label: 'Alternative Frames', icon: '🖼️' },
            { key: 'questions', label: 'Counter Questions', icon: '❓' },
            { key: 'suggestions', label: 'Broadening Ideas', icon: '💡' }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'frames' && (
            <motion.div
              key="frames"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {expansion.alternativeFrames.map((frame, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    {frame}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {expansion.counterQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                >
                  <p className="text-purple-800 dark:text-purple-200 text-sm">
                    {question}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {expansion.broadeningSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    {suggestion}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GentleNudge;