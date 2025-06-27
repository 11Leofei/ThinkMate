/**
 * 🍎 Gravity Field Visualization - Jobs' Physics Made Beautiful
 * "Make the invisible forces visible, and make them beautiful."
 * 
 * Like iOS spring animations - natural physics with magical aesthetics.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThoughtGravityEngine, { GravityInsight } from './ThoughtGravityEngine';

interface GravityFieldProps {
  className?: string;
  onNodeSelect?: (nodeId: string) => void;
  showInsights?: boolean;
  autoSimulate?: boolean;
}

const GravityField: React.FC<GravityFieldProps> = ({
  className = '',
  onNodeSelect,
  showInsights = true,
  autoSimulate = true
}) => {
  const [gravityEngine] = useState(() => ThoughtGravityEngine.getInstance());
  const [visualData, setVisualData] = useState(gravityEngine.getVisualizationData());
  const [insights, setInsights] = useState<GravityInsight[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (autoSimulate) {
      startSimulation();
    }

    return () => {
      stopSimulation();
    };
  }, [autoSimulate]);

  const startSimulation = useCallback(() => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    
    const animate = () => {
      gravityEngine.simulateGravity();
      setVisualData(gravityEngine.getVisualizationData());
      setInsights(gravityEngine.getGravityInsights());
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [gravityEngine, isSimulating]);

  const stopSimulation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsSimulating(false);
  }, []);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };

  const addTestThought = () => {
    const testThoughts = [
      "Innovation comes from connecting disparate ideas",
      "The best products anticipate user needs",
      "Simplicity is the ultimate sophistication", 
      "Focus means saying no to good ideas",
      "Design is how it works, not how it looks"
    ];
    
    const randomThought = testThoughts[Math.floor(Math.random() * testThoughts.length)];
    const randomQuality = 70 + Math.random() * 30;
    
    gravityEngine.addThought(randomThought, randomQuality, 'insight');
    setVisualData(gravityEngine.getVisualizationData());
  };

  return (
    <div className={`bg-gray-900 dark:bg-gray-950 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">🌌 Thought Gravity Field</h3>
            <p className="text-purple-100 text-sm">Watch your ideas attract and form constellations</p>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addTestThought}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
            >
              ✨ Add Thought
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isSimulating ? stopSimulation : startSimulation}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isSimulating 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isSimulating ? '⏸️ Pause' : '▶️ Simulate'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Gravity Field Visualization */}
      <div className="relative" style={{ height: '400px' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 400"
          className="absolute inset-0"
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Clusters */}
          {visualData.clusters.map((cluster, index) => (
            <motion.circle
              key={`cluster-${index}`}
              cx={cluster.x}
              cy={cluster.y}
              r={cluster.radius}
              fill="rgba(147, 51, 234, 0.1)"
              stroke="rgba(147, 51, 234, 0.3)"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          ))}

          {/* Connections */}
          {visualData.edges.map((edge, index) => {
            const sourceNode = visualData.nodes.find(n => n.id === edge.source);
            const targetNode = visualData.nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;

            const opacity = edge.strength / 100;
            const strokeWidth = Math.max(1, edge.strength / 25);

            return (
              <motion.line
                key={`edge-${index}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={getConnectionColor(edge.type)}
                strokeWidth={strokeWidth}
                opacity={opacity}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.05 }}
              />
            );
          })}

          {/* Thought Nodes */}
          {visualData.nodes.map((node, index) => (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              {/* Node glow effect */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size + 4}
                fill={node.color}
                opacity="0.3"
                filter="blur(3px)"
              />
              
              {/* Main node */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={node.color}
                stroke={selectedNode === node.id ? '#FBBF24' : 'rgba(255,255,255,0.2)'}
                strokeWidth={selectedNode === node.id ? 3 : 1}
                style={{ cursor: 'pointer' }}
                onClick={() => handleNodeClick(node.id)}
                whileHover={{ 
                  scale: 1.2,
                  filter: 'brightness(1.2)'
                }}
                whileTap={{ scale: 0.9 }}
              />
              
              {/* Node category indicator */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {getCategoryIcon(node.category)}
              </text>

              {/* Node label on hover */}
              <AnimatePresence>
                {selectedNode === node.id && (
                  <motion.g
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <rect
                      x={node.x - 60}
                      y={node.y - node.size - 25}
                      width="120"
                      height="20"
                      rx="10"
                      fill="rgba(0,0,0,0.8)"
                      stroke="rgba(255,255,255,0.2)"
                    />
                    <text
                      x={node.x}
                      y={node.y - node.size - 15}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="10"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.label}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </motion.g>
          ))}
        </svg>

        {/* Overlay stats */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white rounded-lg p-3">
          <div className="text-sm">
            <div>💫 Thoughts: {visualData.nodes.length}</div>
            <div>🔗 Connections: {visualData.edges.length}</div>
            <div>🧩 Clusters: {visualData.clusters.length}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white rounded-lg p-3">
          <div className="text-xs space-y-1">
            <div className="font-medium mb-2">Connection Types:</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-blue-400"></div>
              <span>Semantic</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-green-400"></div>
              <span>Temporal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-purple-400"></div>
              <span>Emotional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      {showInsights && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-700"
        >
          <h4 className="text-white font-medium mb-3">🔮 Gravity Insights</h4>
          <div className="space-y-2">
            {insights.slice(0, 2).map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-3 border border-blue-500/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-blue-200 font-medium text-sm">
                      {getInsightIcon(insight.type)} {insight.description}
                    </div>
                    <div className="text-blue-300 text-xs mt-1">
                      {insight.actionSuggestion}
                    </div>
                  </div>
                  <div className="text-xs text-blue-400 ml-2">
                    {insight.significance}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Helper functions for visualization
const getCategoryIcon = (category: string): string => {
  const icons = {
    insight: '💡',
    question: '❓',
    idea: '🌟',
    observation: '👁️',
    connection: '🔗'
  };
  return icons[category as keyof typeof icons] || '💭';
};

const getConnectionColor = (type: string): string => {
  const colors = {
    semantic: '#60A5FA',    // Blue
    temporal: '#34D399',    // Green
    emotional: '#A78BFA',   // Purple
    causal: '#F87171',      // Red
    analogical: '#FBBF24'   // Yellow
  };
  return colors[type as keyof typeof colors] || '#9CA3AF';
};

const getInsightIcon = (type: string): string => {
  const icons = {
    new_cluster: '🧩',
    strong_connection: '🔗',
    isolated_thought: '🏝️',
    gravity_shift: '🌊'
  };
  return icons[type as keyof typeof icons] || '💫';
};

export default GravityField;