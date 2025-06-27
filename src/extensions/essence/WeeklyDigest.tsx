/**
 * 🍎 Weekly Digest Component - Jobs' Magical Moments
 * "The details are not the details. They make the design."
 * 
 * Like iOS Screen Time summary - beautiful, insightful, surprisingly delightful.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EssenceExtractor, { EssenceCollection, ThoughtEssence } from './EssenceExtractor';

interface WeeklyDigestProps {
  className?: string;
  autoShow?: boolean; // Show automatically on Sundays
}

const WeeklyDigest: React.FC<WeeklyDigestProps> = ({ 
  className = '', 
  autoShow = false 
}) => {
  const [extractor] = useState(() => EssenceExtractor.getInstance());
  const [collection, setCollection] = useState<EssenceCollection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDigest, setShowDigest] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'breakthroughs' | 'patterns' | 'stats'>('overview');

  useEffect(() => {
    // Auto-show on Sunday if enabled
    if (autoShow && new Date().getDay() === 0) {
      loadWeeklyDigest();
    }
  }, [autoShow, extractor]);

  const loadWeeklyDigest = async () => {
    setIsLoading(true);
    try {
      const weeklyCollection = await extractor.extractWeeklyEssence();
      setCollection(weeklyCollection);
      setShowDigest(true);
    } catch (error) {
      console.error('Failed to generate weekly digest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center justify-center p-8 ${className}`}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Distilling your weekly insights...
          </div>
        </div>
      </motion.div>
    );
  }

  if (!showDigest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 ${className}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">📖</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Weekly Thinking Digest
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Discover the hidden gems in your week of thinking
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadWeeklyDigest}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Generate This Week's Digest
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (!collection) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      >
        {/* Header with close button */}
        <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDigest(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
          >
            ×
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-2">{collection.title}</h2>
            <p className="text-blue-100 text-sm">
              {new Date(collection.startDate).toLocaleDateString()} - {new Date(collection.endDate).toLocaleDateString()}
            </p>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'breakthroughs', label: 'Breakthroughs', icon: '💡' },
              { key: 'patterns', label: 'Patterns', icon: '🔍' },
              { key: 'stats', label: 'Stats', icon: '📈' }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                onClick={() => setCurrentView(tab.key as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  currentView === tab.key
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
        <div className="p-6">
          <AnimatePresence mode="wait">
            {currentView === 'overview' && (
              <OverviewTab key="overview" collection={collection} />
            )}
            {currentView === 'breakthroughs' && (
              <BreakthroughsTab key="breakthroughs" breakthroughs={collection.breakthroughs} />
            )}
            {currentView === 'patterns' && (
              <PatternsTab key="patterns" patterns={collection.patterns} />
            )}
            {currentView === 'stats' && (
              <StatsTab key="stats" stats={collection.stats} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * 📊 Overview Tab - The big picture
 */
const OverviewTab: React.FC<{ collection: EssenceCollection }> = ({ collection }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    {/* Summary */}
    <div className="text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
      >
        {collection.summary}
      </motion.p>
    </div>

    {/* Key Themes */}
    {collection.keyThemes.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          🎯 Key Themes This Week
        </h4>
        <div className="flex flex-wrap gap-2">
          {collection.keyThemes.map((theme, index) => (
            <motion.span
              key={theme}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
            >
              {theme}
            </motion.span>
          ))}
        </div>
      </motion.div>
    )}

    {/* Top Insights Preview */}
    <div className="grid md:grid-cols-2 gap-4">
      {/* Best Breakthrough */}
      {collection.breakthroughs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
            💡 Top Breakthrough
          </h5>
          <p className="text-sm text-green-700 dark:text-green-300">
            {collection.breakthroughs[0].essenceText}
          </p>
        </motion.div>
      )}

      {/* Key Pattern */}
      {collection.patterns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            🔍 Key Pattern
          </h5>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {collection.patterns[0].essenceText}
          </p>
        </motion.div>
      )}
    </div>
  </motion.div>
);

/**
 * 💡 Breakthroughs Tab - Eureka moments
 */
const BreakthroughsTab: React.FC<{ breakthroughs: ThoughtEssence[] }> = ({ breakthroughs }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-4"
  >
    {breakthroughs.length === 0 ? (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-3">🌱</div>
        <p>No major breakthroughs this week.</p>
        <p className="text-sm mt-1">Sometimes growth happens slowly and quietly.</p>
      </div>
    ) : (
      breakthroughs.map((breakthrough, index) => (
        <motion.div
          key={breakthrough.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">💡</span>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Breakthrough #{index + 1}
              </span>
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              Impact: {breakthrough.impactScore}%
            </div>
          </div>
          <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
            {breakthrough.essenceText}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 opacity-75">
            {new Date(breakthrough.timestamp).toLocaleDateString()}
          </p>
        </motion.div>
      ))
    )}
  </motion.div>
);

/**
 * 🔍 Patterns Tab - Recurring insights
 */
const PatternsTab: React.FC<{ patterns: ThoughtEssence[] }> = ({ patterns }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-4"
  >
    {patterns.length === 0 ? (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-3">🔍</div>
        <p>No clear patterns emerged this week.</p>
        <p className="text-sm mt-1">Keep thinking - patterns need time to surface.</p>
      </div>
    ) : (
      patterns.map((pattern, index) => (
        <motion.div
          key={pattern.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔍</span>
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Pattern #{index + 1}
              </span>
            </div>
            <div className="flex space-x-1">
              {pattern.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-purple-800 dark:text-purple-200 font-medium">
            {pattern.essenceText}
          </p>
        </motion.div>
      ))
    )}
  </motion.div>
);

/**
 * 📈 Stats Tab - Numbers that tell stories
 */
const StatsTab: React.FC<{ stats: EssenceCollection['stats'] }> = ({ stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    {/* Key Numbers */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
      >
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {stats.totalThoughts}
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-200">Thoughts</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
      >
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.qualityGrowth > 0 ? '+' : ''}{stats.qualityGrowth}%
        </div>
        <div className="text-sm text-green-800 dark:text-green-200">Quality Growth</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
      >
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {stats.mostActiveHour}:00
        </div>
        <div className="text-sm text-purple-800 dark:text-purple-200">Peak Hour</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
      >
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {stats.thinkingStreak}
        </div>
        <div className="text-sm text-orange-800 dark:text-orange-200">Day Streak</div>
      </motion.div>
    </div>

    {/* Deepest Day Highlight */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
    >
      <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">
        🌟 Deepest Thinking Day
      </h4>
      <p className="text-indigo-700 dark:text-indigo-300">
        {stats.deepestDay} was when your thoughts reached their highest quality.
      </p>
    </motion.div>
  </motion.div>
);

export default WeeklyDigest;