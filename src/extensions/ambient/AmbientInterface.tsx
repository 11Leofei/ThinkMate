/**
 * 🍎 Ambient Interface - Jobs' Living, Breathing Design
 * "The interface should feel alive, responding to the world around you."
 * 
 * Like iPhone's dynamic wallpapers - subtle, beautiful, contextually intelligent.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContextualAdaptation, { EnvironmentContext, AmbientExperience, ContextualSuggestion } from './ContextualAdaptation';

interface AmbientInterfaceProps {
  children: React.ReactNode;
  enableAdaptiveTheme?: boolean;
  showContextualSuggestions?: boolean;
  className?: string;
}

const AmbientInterface: React.FC<AmbientInterfaceProps> = ({
  children,
  enableAdaptiveTheme = true,
  showContextualSuggestions = true,
  className = ''
}) => {
  const [adaptation] = useState(() => ContextualAdaptation.getInstance());
  const [context, setContext] = useState<EnvironmentContext | null>(null);
  const [experience, setExperience] = useState<AmbientExperience | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPrompts, setCurrentPrompts] = useState<string[]>([]);

  useEffect(() => {
    updateAmbientExperience();
    
    // Update context every 5 minutes
    const interval = setInterval(updateAmbientExperience, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const updateAmbientExperience = () => {
    const currentContext = adaptation.getCurrentContext();
    const ambientExperience = adaptation.generateAmbientExperience();
    const prompts = adaptation.getMoodBasedPrompts();
    
    setContext(currentContext);
    setExperience(ambientExperience);
    setCurrentPrompts(prompts);
  };

  const handleEnergyUpdate = (energy: EnvironmentContext['userEnergy']) => {
    adaptation.updateUserEnergy(energy);
    updateAmbientExperience();
  };

  if (!context || !experience) {
    return <div className={className}>{children}</div>;
  }

  const themeStyles = enableAdaptiveTheme ? {
    '--primary-color': experience.theme.colors.primary,
    '--secondary-color': experience.theme.colors.secondary,
    '--background-color': experience.theme.colors.background,
    '--surface-color': experience.theme.colors.surface,
    '--text-color': experience.theme.colors.text,
    '--accent-color': experience.theme.colors.accent,
  } as React.CSSProperties : {};

  return (
    <div 
      className={`relative transition-all duration-1000 ease-in-out ${className}`}
      style={themeStyles}
    >
      {/* Ambient Background Effects */}
      <AmbientBackground experience={experience} />
      
      {/* Context Indicator */}
      <ContextIndicator 
        context={context} 
        experience={experience}
        onEnergyUpdate={handleEnergyUpdate}
      />
      
      {/* Contextual Suggestions */}
      {showContextualSuggestions && (
        <ContextualSuggestionsPanel 
          suggestions={experience.suggestions}
          prompts={currentPrompts}
          show={showSuggestions}
          onToggle={setShowSuggestions}
        />
      )}
      
      {/* Main Content with Adaptive Styling */}
      <motion.div
        layout
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative z-10"
        style={{
          backgroundColor: enableAdaptiveTheme ? experience.theme.colors.surface : undefined,
          color: enableAdaptiveTheme ? experience.theme.colors.text : undefined
        }}
      >
        {children}
      </motion.div>
      
      {/* Breathing Guide (when needed) */}
      {experience.breathingPattern && (
        <BreathingGuide pattern={experience.breathingPattern} />
      )}
    </div>
  );
};

/**
 * 🌊 Ambient Background Effects
 */
const AmbientBackground: React.FC<{ experience: AmbientExperience }> = ({ experience }) => {
  const getMoodAnimation = () => {
    switch (experience.theme.mood) {
      case 'energetic':
        return {
          animate: { 
            background: [
              `linear-gradient(45deg, ${experience.theme.colors.primary}20, ${experience.theme.colors.secondary}20)`,
              `linear-gradient(135deg, ${experience.theme.colors.secondary}20, ${experience.theme.colors.primary}20)`,
              `linear-gradient(45deg, ${experience.theme.colors.primary}20, ${experience.theme.colors.secondary}20)`
            ]
          },
          transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        };
      case 'calm':
        return {
          animate: { 
            background: [
              `radial-gradient(circle at 30% 30%, ${experience.theme.colors.primary}10, transparent 50%)`,
              `radial-gradient(circle at 70% 70%, ${experience.theme.colors.secondary}10, transparent 50%)`,
              `radial-gradient(circle at 30% 30%, ${experience.theme.colors.primary}10, transparent 50%)`
            ]
          },
          transition: { duration: 15, repeat: Infinity, ease: "easeInOut" }
        };
      case 'focused':
        return {
          animate: { 
            background: `linear-gradient(180deg, ${experience.theme.colors.background}, ${experience.theme.colors.surface})`
          }
        };
      default:
        return {
          animate: { 
            background: `linear-gradient(45deg, ${experience.theme.colors.background}, ${experience.theme.colors.surface})`
          }
        };
    }
  };

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      {...getMoodAnimation()}
    >
      {/* Floating Particles for certain moods */}
      {experience.theme.mood === 'contemplative' && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full opacity-30"
              style={{ backgroundColor: experience.theme.colors.accent }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

/**
 * 🏷️ Context Indicator
 */
const ContextIndicator: React.FC<{
  context: EnvironmentContext;
  experience: AmbientExperience;
  onEnergyUpdate: (energy: EnvironmentContext['userEnergy']) => void;
}> = ({ context, experience, onEnergyUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getContextIcon = () => {
    if (context.weather?.condition === 'rainy') return '🌧️';
    if (context.weather?.condition === 'sunny') return '☀️';
    if (context.weather?.condition === 'cloudy') return '☁️';
    if (context.time.period === 'dawn') return '🌅';
    if (context.time.period === 'morning') return '🌄';
    if (context.time.period === 'evening') return '🌆';
    if (context.time.period === 'night') return '🌙';
    return '🌍';
  };

  return (
    <motion.div
      className="fixed top-4 right-4 z-20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDetails(!showDetails)}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-lg shadow-lg"
        style={{ backgroundColor: `${experience.theme.colors.primary}20` }}
      >
        {getContextIcon()}
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute top-14 right-0 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20"
          >
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  🎨 {experience.theme.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {experience.theme.inspiration}
                </p>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span>Time:</span>
                  <span className="capitalize">{context.time.period}</span>
                </div>
                {context.weather && (
                  <div className="flex items-center justify-between">
                    <span>Weather:</span>
                    <span className="capitalize">{context.weather.condition}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Season:</span>
                  <span className="capitalize">{context.season}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  How's your energy?
                </label>
                <div className="flex space-x-1 mt-1">
                  {(['low', 'medium', 'high'] as const).map((energy) => (
                    <motion.button
                      key={energy}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEnergyUpdate(energy)}
                      className={`px-2 py-1 text-xs rounded ${
                        context.userEnergy === energy
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {energy}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * 💡 Contextual Suggestions Panel
 */
const ContextualSuggestionsPanel: React.FC<{
  suggestions: ContextualSuggestion[];
  prompts: string[];
  show: boolean;
  onToggle: (show: boolean) => void;
}> = ({ suggestions, prompts, show, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'prompts'>('suggestions');

  if (suggestions.length === 0 && prompts.length === 0) return null;

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggle(!show)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        {show ? '×' : '💡'}
      </motion.button>

      {/* Suggestions Panel */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-4 bottom-20 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'suggestions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                💡 Suggestions
              </button>
              <button
                onClick={() => setActiveTab('prompts')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'prompts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ❓ Prompts
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {activeTab === 'suggestions' && (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        suggestion.urgency === 'high' ? 'bg-orange-50 border-orange-200' :
                        suggestion.urgency === 'medium' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">{suggestion.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900">
                            {suggestion.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {suggestion.description}
                          </p>
                          {suggestion.action && (
                            <p className="text-xs text-blue-600 mt-1 italic">
                              {suggestion.action}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'prompts' && (
                <div className="space-y-3">
                  {prompts.map((prompt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                    >
                      <p className="text-sm text-purple-800">
                        {prompt}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * 🫁 Breathing Guide
 */
const BreathingGuide: React.FC<{
  pattern: { inhale: number; hold: number; exhale: number; pause: number; };
}> = ({ pattern }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [timeLeft, setTimeLeft] = useState(pattern.inhale);

  const toggleGuide = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === 'inhale') {
            setPhase('hold');
            return pattern.hold;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return pattern.exhale;
          } else if (phase === 'exhale') {
            setPhase('pause');
            return pattern.pause;
          } else {
            setPhase('inhale');
            return pattern.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, phase, pattern]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleGuide}
        className="fixed bottom-4 left-4 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
      >
        🫁
      </motion.button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed left-4 bottom-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700 z-20"
          >
            <div className="text-center">
              <motion.div
                animate={{
                  scale: phase === 'inhale' ? [1, 1.3] : 
                         phase === 'hold' ? 1.3 :
                         phase === 'exhale' ? [1.3, 1] : 1
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="w-16 h-16 bg-green-400 rounded-full mx-auto mb-3 flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">{timeLeft}</span>
              </motion.div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {phase === 'pause' ? 'rest' : phase}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AmbientInterface;