import React from 'react';
import { useStore } from '../store/StoreContext';
import { MotionConfig } from 'motion/react';

export function MotionWrapper({ children }: { children: React.ReactNode }) {
  const { userStats } = useStore();
  
  return (
    <MotionConfig reducedMotion={userStats.optimizationMode ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
