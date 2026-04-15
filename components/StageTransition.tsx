'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface StageTransitionProps {
  stageKey: number;
  children: React.ReactNode;
}

export default function StageTransition({ stageKey, children }: StageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stageKey}
        className="w-full h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
