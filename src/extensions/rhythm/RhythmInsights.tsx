/**
 * 🍎 Rhythm Insights Component - Jobs' Intuitive UI
 * "The best interface is no interface - show what matters, hide what doesn't."
 * 
 * Like iPhone's Screen Time insights - beautiful, meaningful, actionable.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThinkingRhythmDetector, { RhythmPattern } from './ThinkingRhythmDetector';
import OptimalTimingService, { TimingRecommendation, EnergyForecast } from './OptimalTimingService';

interface RhythmInsightsProps {
  className?: string;
  showDetailed?: boolean;
}

const RhythmInsights: React.FC<RhythmInsightsProps> = ({ 
  className = '', 
  showDetailed = false 
}) => {
  const [rhythmDetector] = useState(() => ThinkingRhythmDetector.getInstance());
  const [timingService] = useState(() => OptimalTimingService.getInstance());
  const [pattern, setPattern] = useState<RhythmPattern | null>(null);
  const [recommendations, setRecommendations] = useState<TimingRecommendation[]>([]);
  const [forecast, setForecast] = useState<EnergyForecast | null>(null);
  const [currentState, setCurrentState] = useState(rhythmDetector.getCurrentState());

  useEffect(() => {
    const updateData = () => {
      setPattern(rhythmDetector.analyzeRhythm());
      setRecommendations(timingService.getCurrentRecommendations());
      setForecast(timingService.generateEnergyForecast());
      setCurrentState(rhythmDetector.getCurrentState());
    };

    updateData();
    
    // Update every minute for live timing
    const interval = setInterval(updateData, 60000);
    return () => clearInterval(interval);
  }, [rhythmDetector, timingService]);

  if (!pattern && recommendations.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-2xl mb-2">🧠</div>
          <div className="text-sm">Learning your thinking patterns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Energy Level - Like iPhone battery widget */}
      {forecast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Thinking Energy
            </h3>
            <EnergyLevelIndicator level={forecast.currentLevel} />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {forecast.recommendation}
          </p>

          {forecast.todaysPeakHours.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-500">Next peak:</span>
              <div className="flex space-x-1">
                {forecast.todaysPeakHours.slice(0, 3).map(hour => (
                  <span 
                    key={hour}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                  >
                    {hour}:00
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Live Recommendations - Jobs' proactive assistance */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {recommendations.slice(0, 2).map((rec, index) => (
            <RecommendationCard key={index} recommendation={rec} />
          ))}
        </motion.div>
      )}

      {/* Current Session Status */}
      {currentState.isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-800 dark:text-green-200">
                Thinking Session Active
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {currentState.sessionDuration} min • {currentState.thoughtCount} thoughts • {currentState.intensity} intensity
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Detailed Pattern Analysis */}
      {showDetailed && pattern && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Your Thinking Pattern
          </h4>
          
          <div className="space-y-4">
            {/* Cognitive Type */}
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cognitive Type
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="capitalize px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                  {pattern.cognitiveType}
                </span>
                <span className="text-xs text-gray-500">
                  {pattern.confidenceLevel}% confidence
                </span>
              </div>
            </div>

            {/* Best Hours */}
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Peak Thinking Hours
              </div>
              <div className="flex flex-wrap gap-1">
                {pattern.bestHours.map(hour => (
                  <span 
                    key={hour}
                    className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded"
                  >
                    {hour}:00
                  </span>
                ))}
              </div>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Avg Session
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(pattern.averageSessionLength)}m
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Optimal Break
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(pattern.optimalBreakTime)}m
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timing Tips */}
      <TimingTips />
    </div>
  );
};

/**
 * 🎯 Energy Level Indicator - Visual feedback like iPhone battery
 */
const EnergyLevelIndicator: React.FC<{ level: string }> = ({ level }) => {
  const getEnergyConfig = (level: string) => {
    switch (level) {
      case 'peak':
        return { color: 'bg-green-500', emoji: '🚀', width: '100%' };
      case 'high':
        return { color: 'bg-blue-500', emoji: '⚡', width: '75%' };
      case 'medium':
        return { color: 'bg-yellow-500', emoji: '🔋', width: '50%' };
      case 'low':
        return { color: 'bg-red-500', emoji: '🪫', width: '25%' };
      default:
        return { color: 'bg-gray-500', emoji: '🤔', width: '0%' };
    }
  };

  const config = getEnergyConfig(level);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-lg">{config.emoji}</span>
      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: config.width }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${config.color} rounded-full`}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
        {level}
      </span>
    </div>
  );
};

/**
 * 💡 Recommendation Card - Jobs' helpful suggestions
 */
const RecommendationCard: React.FC<{ recommendation: TimingRecommendation }> = ({ recommendation }) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      case 'low': return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
      default: return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'start_session': return '🎯';
      case 'take_break': return '☕';
      case 'deep_work': return '🧠';
      case 'reflection': return '🤔';
      case 'energy_boost': return '⚡';
      default: return '💡';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border rounded-lg p-3 ${getUrgencyColor(recommendation.urgency)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getTypeIcon(recommendation.type)}</span>
          <div>
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {recommendation.message}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {recommendation.suggestedAction}
            </div>
            {recommendation.minutesUntil && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                In {recommendation.minutesUntil} minutes
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {recommendation.confidence}%
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 📚 Timing Tips - Jobs' educational moments
 */
const TimingTips: React.FC = () => {
  const [timingService] = useState(() => OptimalTimingService.getInstance());
  const [tips, setTips] = useState<string[]>([]);

  useEffect(() => {
    setTips(timingService.getTimingTips());
  }, [timingService]);

  if (tips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
    >
      <div className="font-medium text-purple-800 dark:text-purple-200 mb-2">
        💡 Timing Insight
      </div>
      <div className="space-y-1">
        {tips.slice(0, 2).map((tip, index) => (
          <div key={index} className="text-sm text-purple-700 dark:text-purple-300">
            {tip}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RhythmInsights;