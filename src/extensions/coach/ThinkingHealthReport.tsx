/**
 * 🍎 Thinking Health Report - Jobs' Mental Fitness Dashboard
 * "Your mind's health is as important as your body's. Let's measure it beautifully."
 * 
 * Like Apple Health app, but for your cognitive wellbeing.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThinkingCoach, { ThinkingHealthReport as HealthReport } from './ThinkingCoach';

interface ThinkingHealthReportProps {
  userId: string;
  thoughtHistory: any[];
  qualityScores: number[];
  period?: 'week' | 'month';
  onInsightClick?: (insight: string) => void;
  className?: string;
}

const ThinkingHealthReport: React.FC<ThinkingHealthReportProps> = ({
  userId,
  thoughtHistory,
  qualityScores,
  period = 'week',
  onInsightClick,
  className = ''
}) => {
  const [coach] = useState(() => ThinkingCoach.getInstance());
  const [report, setReport] = useState<HealthReport | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  useEffect(() => {
    generateReport();
  }, [thoughtHistory, qualityScores, selectedPeriod]);

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Simulate generation time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const healthReport = coach.generateHealthReport(
      thoughtHistory,
      qualityScores,
      selectedPeriod
    );
    
    setReport(healthReport);
    setIsGenerating(false);
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 60) return 'from-blue-400 to-blue-600';
    if (score >= 40) return 'from-yellow-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  const getHealthEmoji = (score: number): string => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '💪';
    if (score >= 40) return '📈';
    return '💡';
  };

  const getHealthDescription = (score: number): string => {
    if (score >= 80) return 'Excellent thinking health!';
    if (score >= 60) return 'Good progress, keep it up!';
    if (score >= 40) return 'Room for improvement';
    return 'Time to focus on your thinking';
  };

  if (isGenerating) {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center ${className}`}
      >
        <div className="text-4xl mb-4">🧠</div>
        <p className="text-gray-600 dark:text-gray-400">Analyzing your thinking patterns...</p>
      </motion.div>
    );
  }

  if (!report) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <span>🧠</span>
            <span>Thinking Health Report</span>
          </h2>
          
          {/* Period Selector */}
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-1">
            {(['week', 'month'] as const).map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === p
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {p === 'week' ? 'Weekly' : 'Monthly'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Overall Health Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center"
        >
          <div className="relative inline-block">
            <motion.div
              className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur"
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-bold"
                >
                  {report.overallHealth}
                </motion.div>
                <div className="text-xs opacity-80">Overall</div>
              </div>
            </motion.div>
            
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-32 h-32">
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="url(#health-gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(report.overallHealth / 100) * 377} 377`}
                initial={{ strokeDashoffset: 377 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                transform="rotate(-90 64 64)"
              />
              <defs>
                <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4"
          >
            <div className="text-3xl mb-1">{getHealthEmoji(report.overallHealth)}</div>
            <p className="text-lg">{getHealthDescription(report.overallHealth)}</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Report Sections */}
      <div className="p-6 space-y-4">
        {/* Insights Section */}
        <ReportSection
          title="💡 Key Insights"
          icon="💡"
          isExpanded={expandedSection === 'insights'}
          onToggle={() => setExpandedSection(expandedSection === 'insights' ? null : 'insights')}
        >
          <div className="space-y-3">
            {report.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                onClick={() => onInsightClick?.(insight)}
              >
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
              </motion.div>
            ))}
          </div>
        </ReportSection>

        {/* Strengths Section */}
        <ReportSection
          title="💪 Your Strengths"
          icon="💪"
          isExpanded={expandedSection === 'strengths'}
          onToggle={() => setExpandedSection(expandedSection === 'strengths' ? null : 'strengths')}
        >
          <div className="grid grid-cols-2 gap-3">
            {report.strengths.map((strength, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700"
              >
                <div className="text-2xl mb-2">✨</div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {strength}
                </p>
              </motion.div>
            ))}
          </div>
        </ReportSection>

        {/* Areas for Improvement */}
        <ReportSection
          title="🌱 Growth Opportunities"
          icon="🌱"
          isExpanded={expandedSection === 'improvements'}
          onToggle={() => setExpandedSection(expandedSection === 'improvements' ? null : 'improvements')}
        >
          <div className="space-y-3">
            {report.improvements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-orange-600 dark:text-orange-400">📈</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{improvement}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xs px-2 py-1 bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-200 rounded"
                >
                  Practice
                </motion.button>
              </motion.div>
            ))}
          </div>
        </ReportSection>

        {/* Recommendations */}
        <ReportSection
          title="🎯 Personalized Recommendations"
          icon="🎯"
          isExpanded={expandedSection === 'recommendations'}
          onToggle={() => setExpandedSection(expandedSection === 'recommendations' ? null : 'recommendations')}
        >
          <div className="space-y-3">
            {report.recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-400"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-purple-600 dark:text-purple-400 text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {recommendation}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ReportSection>

        {/* Next Steps */}
        <ReportSection
          title="🚀 Your Next Steps"
          icon="🚀"
          isExpanded={expandedSection === 'nextsteps'}
          onToggle={() => setExpandedSection(expandedSection === 'nextsteps' ? null : 'nextsteps')}
        >
          <div className="space-y-3">
            {report.nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
                >
                  {index + 1}
                </motion.div>
                <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{step}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Start →
                </motion.button>
              </motion.div>
            ))}
          </div>
        </ReportSection>

        {/* Download Report Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center space-x-2"
        >
          <span>📥</span>
          <span>Download Full Report</span>
        </motion.button>
      </div>
    </div>
  );
};

/**
 * 🗂️ Report Section Component
 */
const ReportSection: React.FC<{
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, isExpanded, onToggle, children }) => {
  return (
    <motion.div
      layout
      className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
    >
      <motion.button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ThinkingHealthReport;