/**
 * 🍎 Time Machine Component - Jobs' Temporal Interface
 * "The past isn't gone. It's waiting to inspire your future."
 * 
 * Like iPhone's Photos memories - beautiful, emotional, perfectly timed.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MemoryResurrector, { ResurrectionMoment, MemoryCluster, ThoughtMemory } from './MemoryResurrector';

interface TimeMachineProps {
  currentThought?: string;
  onMemorySelect?: (memory: ThoughtMemory) => void;
  className?: string;
  autoTrigger?: boolean;
}

const TimeMachine: React.FC<TimeMachineProps> = ({
  currentThought = '',
  onMemorySelect,
  className = '',
  autoTrigger = true
}) => {
  const [resurrector] = useState(() => MemoryResurrector.getInstance());
  const [resurrectionMoments, setResurrectionMoments] = useState<ResurrectionMoment[]>([]);
  const [memoryClusters, setMemoryClusters] = useState<MemoryCluster[]>([]);
  const [forgottenGems, setForgottenGems] = useState<ThoughtMemory[]>([]);
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [activeTab, setActiveTab] = useState<'moments' | 'clusters' | 'gems'>('moments');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (currentThought && autoTrigger && currentThought.length > 20) {
      analyzeForMemories();
    }
  }, [currentThought, autoTrigger]);

  const analyzeForMemories = async () => {
    setIsAnalyzing(true);
    try {
      const moments = await resurrector.resurrectRelevantMemories(currentThought);
      setResurrectionMoments(moments);
      
      if (moments.length > 0) {
        setShowTimeMachine(true);
      }
    } catch (error) {
      console.error('Failed to analyze memories:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadAllMemories = () => {
    setMemoryClusters(resurrector.getMemoryClusters());
    setForgottenGems(resurrector.getForgottenGems());
    setShowTimeMachine(true);
  };

  const handleMemoryClick = (memory: ThoughtMemory) => {
    if (onMemorySelect) {
      onMemorySelect(memory);
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
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-4xl mb-2"
          >
            ⏰
          </motion.div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Searching through the corridors of time...
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {/* Trigger Button */}
      {!showTimeMachine && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadAllMemories}
          className="w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <motion.span 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              ⏰
            </motion.span>
            <div className="text-left">
              <div className="font-medium text-indigo-800 dark:text-indigo-200">
                Open Time Machine
              </div>
              <div className="text-sm text-indigo-600 dark:text-indigo-400">
                Rediscover your forgotten insights
              </div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Time Machine Interface */}
      <AnimatePresence>
        {showTimeMachine && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-2"
                  >
                    🕰️ Time Machine
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-indigo-100"
                  >
                    Your thoughts across time, beautifully connected
                  </motion.p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowTimeMachine(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                >
                  ×
                </motion.button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex">
                {[
                  { key: 'moments', label: 'Resurrection Moments', icon: '✨', count: resurrectionMoments.length },
                  { key: 'clusters', label: 'Memory Clusters', icon: '🧩', count: memoryClusters.length },
                  { key: 'gems', label: 'Forgotten Gems', icon: '💎', count: forgottenGems.length }
                ].map((tab) => (
                  <motion.button
                    key={tab.key}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'moments' && (
                  <ResurrectionMomentsTab 
                    key="moments" 
                    moments={resurrectionMoments}
                    onMemorySelect={handleMemoryClick}
                  />
                )}
                {activeTab === 'clusters' && (
                  <MemoryClustersTab 
                    key="clusters" 
                    clusters={memoryClusters}
                    onMemorySelect={handleMemoryClick}
                  />
                )}
                {activeTab === 'gems' && (
                  <ForgottenGemsTab 
                    key="gems" 
                    gems={forgottenGems}
                    onMemorySelect={handleMemoryClick}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * ✨ Resurrection Moments Tab - When past meets present
 */
const ResurrectionMomentsTab: React.FC<{
  moments: ResurrectionMoment[];
  onMemorySelect?: (memory: ThoughtMemory) => void;
}> = ({ moments, onMemorySelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-4"
  >
    {moments.length === 0 ? (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-3">🕳️</div>
        <p>No relevant memories found for your current thought.</p>
        <p className="text-sm mt-1">Keep thinking - your memory bank is growing!</p>
      </div>
    ) : (
      moments.map((moment, index) => (
        <motion.div
          key={moment.resurrectedMemory.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onMemorySelect && onMemorySelect(moment.resurrectedMemory)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {moment.type === 'serendipity' ? '🎯' :
                 moment.type === 'evolution' ? '📈' :
                 moment.type === 'pattern' ? '🔄' : '💎'}
              </span>
              <div>
                <div className="font-medium text-yellow-800 dark:text-yellow-200 capitalize">
                  {moment.type.replace('_', ' ')}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  {new Date(moment.resurrectedMemory.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
              {Math.round(moment.resurrectedMemory.connectionStrength)}% match
            </div>
          </div>

          <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2 italic">
            "{moment.resurrectedMemory.content.substring(0, 150)}..."
          </p>

          <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            {moment.connectionReason}
          </div>

          <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 rounded p-2">
            💡 {moment.suggestedAction}
          </div>
        </motion.div>
      ))
    )}
  </motion.div>
);

/**
 * 🧩 Memory Clusters Tab - Thematic collections
 */
const MemoryClustersTab: React.FC<{
  clusters: MemoryCluster[];
  onMemorySelect?: (memory: ThoughtMemory) => void;
}> = ({ clusters, onMemorySelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-4"
  >
    {clusters.length === 0 ? (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-3">🧩</div>
        <p>No memory clusters found yet.</p>
        <p className="text-sm mt-1">Clusters form when you have multiple thoughts on similar themes.</p>
      </div>
    ) : (
      clusters.map((cluster, index) => (
        <motion.div
          key={cluster.theme}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              🧩 {cluster.theme}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {cluster.memories.length} memories
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                cluster.significance === 'high' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                cluster.significance === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {cluster.significance} impact
              </span>
            </div>
          </div>

          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            {cluster.emotionalJourney} • {cluster.timeSpan}
          </p>

          <div className="space-y-2">
            {cluster.memories.slice(0, 2).map((memory, memIndex) => (
              <motion.div
                key={memory.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => onMemorySelect && onMemorySelect(memory)}
                className="p-2 bg-white dark:bg-gray-700 rounded border border-blue-100 dark:border-blue-800 cursor-pointer"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  "{memory.content.substring(0, 100)}..."
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(memory.timestamp).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
            {cluster.memories.length > 2 && (
              <div className="text-xs text-blue-600 dark:text-blue-400 text-center">
                +{cluster.memories.length - 2} more memories in this cluster
              </div>
            )}
          </div>
        </motion.div>
      ))
    )}
  </motion.div>
);

/**
 * 💎 Forgotten Gems Tab - High-quality old memories
 */
const ForgottenGemsTab: React.FC<{
  gems: ThoughtMemory[];
  onMemorySelect?: (memory: ThoughtMemory) => void;
}> = ({ gems, onMemorySelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-4"
  >
    {gems.length === 0 ? (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-3">💎</div>
        <p>No forgotten gems yet.</p>
        <p className="text-sm mt-1">High-quality thoughts from over a month ago will appear here.</p>
      </div>
    ) : (
      gems.map((gem, index) => (
        <motion.div
          key={gem.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onMemorySelect && onMemorySelect(gem)}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg"
              >
                💎
              </motion.span>
              <div>
                <div className="font-medium text-purple-800 dark:text-purple-200">
                  Forgotten Gem
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  {new Date(gem.timestamp).toLocaleDateString()} • {gem.context}
                </div>
              </div>
            </div>
            <div className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
              Quality: {gem.qualityScore}
            </div>
          </div>

          <p className="text-purple-800 dark:text-purple-200 font-medium italic">
            "{gem.content}"
          </p>

          {gem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {gem.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      ))
    )}
  </motion.div>
);

export default TimeMachine;