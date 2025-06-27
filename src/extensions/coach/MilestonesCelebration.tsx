/**
 * 🍎 Milestones Celebration - Jobs' Achievement Recognition
 * "Celebrate the small wins. They lead to big victories."
 * 
 * Like unlocking achievements in iOS, but for your thinking journey.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ThinkingCoach, { Achievement, CelebrationMoment } from './ThinkingCoach';

interface MilestonesCelebrationProps {
  userId: string;
  thoughtHistory: any[];
  qualityScores: number[];
  onAchievementUnlock?: (achievement: Achievement) => void;
  className?: string;
}

const MilestonesCelebration: React.FC<MilestonesCelebrationProps> = ({
  userId,
  thoughtHistory,
  qualityScores,
  onAchievementUnlock,
  className = ''
}) => {
  const [coach] = useState(() => ThinkingCoach.getInstance());
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [showAchievementPanel, setShowAchievementPanel] = useState(false);

  useEffect(() => {
    checkForNewAchievements();
  }, [thoughtHistory, qualityScores]);

  const checkForNewAchievements = async () => {
    const newAchievements = coach.checkAchievements(thoughtHistory, qualityScores);
    
    if (newAchievements.length > 0) {
      // Celebrate each achievement with a delay
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          celebrateAchievement(achievement);
        }, index * 4000); // 4 seconds between celebrations
      });
      
      setRecentAchievements(prev => [...newAchievements, ...prev].slice(0, 10));
    }
  };

  const celebrateAchievement = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
    setShowCelebration(true);
    onAchievementUnlock?.(achievement);

    // Trigger celebration effects
    if (achievement.celebration) {
      triggerCelebrationEffects(achievement.celebration);
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  const triggerCelebrationEffects = (celebration: CelebrationMoment) => {
    // Visual effects
    if (celebration.visualEffect === 'confetti') {
      fireConfetti();
    } else if (celebration.visualEffect === 'sparkles') {
      createSparkles();
    }

    // Sound effects (if implemented)
    if (celebration.soundEffect) {
      playSound(celebration.soundEffect);
    }
  };

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const createSparkles = () => {
    // Create DOM sparkles animation
    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    document.body.appendChild(sparkleContainer);

    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.animationDelay = `${Math.random() * 2}s`;
      sparkleContainer.appendChild(sparkle);
    }

    setTimeout(() => {
      document.body.removeChild(sparkleContainer);
    }, 3000);
  };

  const playSound = (soundName: string) => {
    // Sound implementation would go here
    console.log(`Playing sound: ${soundName}`);
  };

  const getAchievementRarity = (achievement: Achievement): string => {
    if (achievement.type === 'mastery') return 'Legendary';
    if (achievement.type === 'breakthrough') return 'Epic';
    if (achievement.type === 'milestone') return 'Rare';
    return 'Common';
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'Legendary': return 'from-yellow-400 to-orange-500';
      case 'Epic': return 'from-purple-400 to-pink-500';
      case 'Rare': return 'from-blue-400 to-indigo-500';
      default: return 'from-green-400 to-teal-500';
    }
  };

  return (
    <>
      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {showCelebration && currentAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              {/* Glow Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(getAchievementRarity(currentAchievement))} rounded-3xl blur-xl`}
              />

              {/* Achievement Card */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
                {/* Rarity Badge */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r ${getRarityColor(getAchievementRarity(currentAchievement))} text-white text-xs font-bold rounded-full shadow-lg`}
                >
                  {getAchievementRarity(currentAchievement)}
                </motion.div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
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
                    className="text-8xl mb-4 inline-block"
                  >
                    {currentAchievement.icon}
                  </motion.div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Achievement Unlocked!
                  </h2>
                  <h3 className={`text-xl font-semibold bg-gradient-to-r ${getRarityColor(getAchievementRarity(currentAchievement))} bg-clip-text text-transparent mb-3`}>
                    {currentAchievement.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {currentAchievement.description}
                  </p>

                  {/* Quote or special message */}
                  {currentAchievement.celebration?.type === 'quote' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg italic text-sm text-gray-700 dark:text-gray-300"
                    >
                      "{currentAchievement.celebration.content}"
                    </motion.div>
                  )}

                  {/* Timestamp */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xs text-gray-500 mt-4"
                  >
                    Unlocked on {new Date(currentAchievement.unlockedAt).toLocaleString()}
                  </motion.p>
                </motion.div>

                {/* Share Button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => setShowCelebration(false)}
                >
                  Continue Your Journey
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Panel Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAchievementPanel(!showAchievementPanel)}
        className={`fixed top-24 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-3 shadow-lg z-30 ${className}`}
      >
        <span className="text-xl">🏆</span>
        {recentAchievements.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {recentAchievements.length}
          </motion.span>
        )}
      </motion.button>

      {/* Achievement Panel */}
      <AnimatePresence>
        {showAchievementPanel && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-40 right-8 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden z-30"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
              <h3 className="font-semibold flex items-center justify-between">
                <span>🏆 Your Achievements</span>
                <button
                  onClick={() => setShowAchievementPanel(false)}
                  className="text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </h3>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              {recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => celebrateAchievement(achievement)}
                    >
                      <span className="text-2xl flex-shrink-0">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(getAchievementRarity(achievement))} text-white`}>
                        {getAchievementRarity(achievement)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-3 block">🎯</span>
                  <p className="text-sm">Start your thinking journey to unlock achievements!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle Animation Styles */}
      <style jsx global>{`
        .sparkle-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 60;
        }
        
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          animation: sparkle-fall 3s linear forwards;
        }
        
        @keyframes sparkle-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .sparkle::before,
        .sparkle::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 50%;
        }
        
        .sparkle::before {
          transform: rotate(45deg);
        }
        
        .sparkle::after {
          transform: rotate(-45deg);
        }
      `}</style>
    </>
  );
};

export default MilestonesCelebration;