/**
 * Lazy-loaded components for performance optimization
 * Import these instead of direct imports for heavy components
 */

import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

// Loading component
const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center p-8"
  >
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
      />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </motion.div>
);

// Lazy loaded components
export const LazyGravityField = lazy(() => 
  import('./gravity/GravityField')
);

export const LazyThinkingHealthReport = lazy(() => 
  import('./coach/ThinkingHealthReport')
);

export const LazyPersonalizedTrainingPlan = lazy(() => 
  import('./coach/PersonalizedTrainingPlan')
);

export const LazyJobsMasterpiece = lazy(() => 
  import('./JobsMasterpiece')
);

// Wrapper components with Suspense
export const GravityFieldWithSuspense: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading Gravity Field..." />}>
    <LazyGravityField {...props} />
  </Suspense>
);

export const ThinkingHealthReportWithSuspense: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback message="Generating Health Report..." />}>
    <LazyThinkingHealthReport {...props} />
  </Suspense>
);

export const PersonalizedTrainingPlanWithSuspense: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback message="Preparing Training Plan..." />}>
    <LazyPersonalizedTrainingPlan {...props} />
  </Suspense>
);

export const JobsMasterpieceWithSuspense: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback message="Initializing ThinkMate Extensions..." />}>
    <LazyJobsMasterpiece {...props} />
  </Suspense>
);