'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, RotateCcw } from 'lucide-react';
import { playSound } from '@/lib/sounds';

interface MissionCompleteProps {
  onNextTeam: () => void;
}

export default function MissionComplete({ onNextTeam }: MissionCompleteProps) {
  useEffect(() => {
    playSound.success();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-300 flex flex-col items-center justify-center bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-4 border border-green-700 pointer-events-none"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <motion.div
        className="absolute inset-6 border border-green-900 pointer-events-none"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
      />

      <div className="relative z-10 tablet-dialog px-8 space-y-8 text-center">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="tablet-label text-green-600 mb-2">{'// OPERATION COMPLETE'}</p>
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-[0.18em] text-glow animate-glitch">
            MISSION COMPLETE
          </h1>
        </motion.div>

        {/* Mission status */}
        <motion.div
          className="hud-widget p-4 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-green-600 tablet-fine-text">MISSION STATUS</p>
          <p className="text-green-400 text-glow text-3xl font-black tracking-[0.12em]">
            SUCCESS
          </p>
        </motion.div>

        {/* Next team button */}
        <motion.button
          onClick={onNextTeam}
          className="w-full min-h-14 flex items-center justify-center gap-3 py-4 border-2 border-green-400
                     text-green-400 text-glow text-xl font-bold tracking-[0.14em]
                     hover:bg-green-400 hover:text-black transition-all duration-200 active:scale-95"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Users size={22} />
          NEXT TEAM START
          <RotateCcw size={18} />
        </motion.button>

        <motion.p
          className="text-green-600 text-sm tracking-[0.08em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          버튼을 누르면 모든 진행 상황이 초기화됩니다
        </motion.p>
      </div>
    </motion.div>
  );
}
