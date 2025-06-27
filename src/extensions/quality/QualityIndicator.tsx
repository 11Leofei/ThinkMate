/**
 * 🍎 Quality Indicator Component - Jobs' Design Philosophy
 * "Simplicity is the ultimate sophistication."
 * 
 * Like iPhone battery indicator - instant understanding, zero confusion.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QualityScoreService, { QualityInsight } from './QualityScoreService';

interface QualityIndicatorProps {
  score?: number;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const QualityIndicator: React.FC<QualityIndicatorProps> = ({
  score,
  showDetails = false,
  size = 'medium',
  className = ''
}) => {
  const [qualityService] = useState(() => QualityScoreService.getInstance());
  const [displayScore, setDisplayScore] = useState(score || 0);
  const [insights, setInsights] = useState<QualityInsight[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    if (score !== undefined) {
      setDisplayScore(score);
    }
  }, [score]);

  useEffect(() => {
    if (showDetails) {
      setInsights(qualityService.getQualityInsights());
    }
  }, [qualityService, showDetails]);

  const qualityInfo = qualityService.getQualityDescription(displayScore);
  
  // Size configurations - Jobs loved consistency
  const sizeConfig = {
    small: { size: 24, strokeWidth: 3, fontSize: 'text-xs' },
    medium: { size: 32, strokeWidth: 3, fontSize: 'text-sm' },
    large: { size: 48, strokeWidth: 4, fontSize: 'text-base' }
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Jobs' color psychology - emotional connection through color
  const getQualityColor = (score: number): string => {
    if (score >= 85) return '#34D399'; // Emerald - Exceptional
    if (score >= 70) return '#60A5FA'; // Blue - Good  
    if (score >= 55) return '#FBBF24'; // Amber - Developing
    return '#F87171'; // Red - Needs work
  };

  const qualityColor = getQualityColor(displayScore);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main Quality Circle - Like iPhone battery indicator */}
      <div 
        className="relative cursor-pointer group"
        onClick={() => showDetails && setShowInsights(!showInsights)}
      >
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          
          {/* Progress circle with animation */}
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="transparent"
            stroke={qualityColor}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ 
              duration: 1.2,
              ease: "easeOut",
              delay: 0.2
            }}
            className="drop-shadow-sm"
          />
        </svg>

        {/* Score display - Clean, readable, Jobs-approved */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className={`font-semibold text-gray-700 dark:text-gray-200 ${config.fontSize}`}
          >
            {Math.round(displayScore)}
          </motion.span>
        </div>

        {/* Emoji indicator for emotional connection */}
        {size !== 'small' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="absolute -bottom-1 -right-1 text-xs"
          >
            {qualityInfo.emoji}
          </motion.div>
        )}

        {/* Hover tooltip - Jobs loved helpful details */}
        {showDetails && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            <div className="font-medium">{qualityInfo.level}</div>
            <div className="text-gray-300 dark:text-gray-600">{qualityInfo.description}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
          </div>
        )}
      </div>

      {/* Insights Panel - Jobs' attention to detail */}
      <AnimatePresence>
        {showInsights && insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-20"
          >
            <div className="space-y-3">
              {insights.slice(0, 2).map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    insight.type === 'achievement' ? 'bg-green-400' :
                    insight.type === 'strength' ? 'bg-blue-400' :
                    insight.type === 'improvement' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {insight.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 📊 Quality Dashboard Component - For detailed view
 * Jobs: "Details are not details. They make the design."
 */
interface QualityDashboardProps {
  className?: string;
}

export const QualityDashboard: React.FC<QualityDashboardProps> = ({ className = '' }) => {
  const [qualityService] = useState(() => QualityScoreService.getInstance());
  const [profile, setProfile] = useState(qualityService.getQualityProfile());
  const [insights, setInsights] = useState(qualityService.getQualityInsights());

  useEffect(() => {
    const updateData = () => {
      setProfile(qualityService.getQualityProfile());
      setInsights(qualityService.getQualityInsights());
    };

    // Refresh data periodically
    const interval = setInterval(updateData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [qualityService]);

  const trendIcon = profile.recentTrend === 'up' ? '↗️' : profile.recentTrend === 'down' ? '↘️' : '→';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header with main score */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Thinking Quality
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your cognitive performance at a glance
          </p>
        </div>
        <QualityIndicator 
          score={profile.currentScore} 
          size="large" 
          showDetails={true}
        />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {profile.peak}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Peak Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {profile.average}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center">
            {trendIcon}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Trend</div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Recent Insights</h4>
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {insight.title}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {insight.description}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default QualityIndicator;