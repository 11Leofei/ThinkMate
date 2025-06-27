/**
 * 🍎 Personalized Training Plan - Jobs' Thinking Fitness Program
 * "Your mind needs training like your body. This is your gym."
 * 
 * Like Apple Fitness+ but for your thinking abilities.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThinkingCoach, { TrainingExercise, ThinkingGoal, CoachingProfile } from './ThinkingCoach';

interface PersonalizedTrainingPlanProps {
  userId: string;
  onStartExercise?: (exercise: TrainingExercise) => void;
  onUpdateGoal?: (goal: ThinkingGoal) => void;
  className?: string;
}

const PersonalizedTrainingPlan: React.FC<PersonalizedTrainingPlanProps> = ({
  userId,
  onStartExercise,
  onUpdateGoal,
  className = ''
}) => {
  const [coach] = useState(() => ThinkingCoach.getInstance());
  const [profile, setProfile] = useState<CoachingProfile | null>(null);
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<'week' | 'month' | 'quarter'>('week');
  const [activeTab, setActiveTab] = useState<'exercises' | 'goals' | 'progress'>('exercises');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    initializeTraining();
  }, [userId]);

  useEffect(() => {
    generatePlan();
  }, [selectedDuration]);

  const initializeTraining = async () => {
    const userProfile = await coach.initializeProfile(userId);
    setProfile(userProfile);
    generatePlan();
  };

  const generatePlan = () => {
    const trainingPlan = coach.generateTrainingPlan(selectedDuration);
    setExercises(trainingPlan);
  };

  const handleStartExercise = (exercise: TrainingExercise) => {
    onStartExercise?.(exercise);
    
    // Mark as started with animation
    const exerciseCard = document.getElementById(`exercise-${exercise.id}`);
    if (exerciseCard) {
      exerciseCard.classList.add('exercise-started');
    }
  };

  const handleCompleteExercise = (exerciseId: string) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
    // Celebrate completion
    const exerciseCard = document.getElementById(`exercise-${exerciseId}`);
    if (exerciseCard) {
      exerciseCard.classList.add('exercise-completed');
    }
  };

  const getDifficultyColor = (difficulty: TrainingExercise['difficulty']): string => {
    const colors = {
      easy: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-blue-100 text-blue-700 border-blue-200',
      hard: 'bg-orange-100 text-orange-700 border-orange-200',
      master: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[difficulty];
  };

  const getGoalProgress = (goal: ThinkingGoal): { percentage: number; color: string } => {
    const percentage = Math.min(100, goal.progress);
    let color = 'from-gray-400 to-gray-500';
    
    if (percentage >= 80) color = 'from-green-400 to-green-600';
    else if (percentage >= 60) color = 'from-blue-400 to-blue-600';
    else if (percentage >= 40) color = 'from-yellow-400 to-yellow-600';
    else if (percentage >= 20) color = 'from-orange-400 to-orange-600';
    
    return { percentage, color };
  };

  if (!profile) {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center justify-center p-8 text-gray-500"
      >
        Preparing your personalized training plan...
      </motion.div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <span>🎯</span>
              <span>Your Thinking Training Plan</span>
            </h2>
            <p className="text-indigo-100 mt-1">
              Level: <span className="font-semibold capitalize">{profile.thinkingLevel}</span>
            </p>
          </div>
          
          {/* Duration Selector */}
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((duration) => (
              <motion.button
                key={duration}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDuration(duration)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedDuration === duration
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {duration === 'week' ? 'Weekly' : 
                 duration === 'month' ? 'Monthly' : 'Quarterly'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          {(['exercises', 'goals', 'progress'] as const).map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {tab === 'exercises' ? '🏃 Exercises' :
               tab === 'goals' ? '🎯 Goals' : '📊 Progress'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Exercises Tab */}
          {activeTab === 'exercises' && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Today's Exercises
                </h3>
                <span className="text-sm text-gray-500">
                  {completedExercises.size} / {exercises.length} completed
                </span>
              </div>

              {exercises.slice(0, 5).map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  id={`exercise-${exercise.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    border rounded-xl p-5 transition-all cursor-pointer
                    ${completedExercises.has(exercise.id)
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                    }
                  `}
                  onClick={() => !completedExercises.has(exercise.id) && handleStartExercise(exercise)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {exercise.type === 'prompt' ? '✍️' :
                           exercise.type === 'challenge' ? '🎯' :
                           exercise.type === 'reflection' ? '🤔' : '🔗'}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {exercise.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {exercise.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {exercise.estimatedTime} min
                        </span>
                        {exercise.targetSkills.map((skill, i) => (
                          <span key={i} className="text-xs text-indigo-600 dark:text-indigo-400">
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {completedExercises.has(exercise.id) ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-3xl"
                      >
                        ✅
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-indigo-600 hover:text-indigo-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartExercise(exercise);
                        }}
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
              >
                <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
                  🏆 Your Training Stats
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {completedExercises.size}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {Math.round((completedExercises.size / exercises.length) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      🔥{Math.max(1, completedExercises.size)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {profile.currentGoals.map((goal, index) => {
                const progress = getGoalProgress(goal);
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                          <span>{goal.type === 'clarity' ? '💎' :
                                 goal.type === 'depth' ? '🌊' :
                                 goal.type === 'creativity' ? '🎨' :
                                 goal.type === 'critical-thinking' ? '🔍' : '🔗'}</span>
                          <span>{goal.title}</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {goal.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.status === 'active' ? 'bg-green-100 text-green-700' :
                        goal.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {goal.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium">{progress.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${progress.color} rounded-full`}
                        />
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="space-y-2">
                      {goal.milestones.slice(0, 2).map((milestone) => (
                        <div
                          key={milestone.id}
                          className={`flex items-center space-x-2 text-sm ${
                            milestone.achievedAt ? 'text-green-600' : 'text-gray-500'
                          }`}
                        >
                          <span>{milestone.achievedAt ? '✅' : '⭕'}</span>
                          <span className={milestone.achievedAt ? 'line-through' : ''}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Target Date */}
                    <div className="mt-3 text-xs text-gray-500">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add New Goal */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 text-center hover:border-indigo-400 transition-colors"
              >
                <span className="text-2xl">➕</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Set a new thinking goal
                </p>
              </motion.button>
            </motion.div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Strengths */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  💪 Your Strengths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.strengths.map((strength, index) => (
                    <motion.span
                      key={strength}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                    >
                      {strength}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Growth Areas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🌱 Growth Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.growthAreas.map((area, index) => (
                    <motion.span
                      key={area}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm"
                    >
                      {area}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  🏆 Recent Achievements
                </h3>
                {profile.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {profile.achievements.slice(-3).reverse().map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className="font-medium text-purple-900 dark:text-purple-100">
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            {achievement.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Complete exercises to unlock achievements! 🎯
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PersonalizedTrainingPlan;