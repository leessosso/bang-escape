'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Clock, RotateCcw } from 'lucide-react';
import { FINAL_CODE, GAME_DURATION_SEC } from '@/lib/constants';
import { playSound } from '@/lib/sounds';

interface MissionCompleteProps {
  startedAt: number;
  completedAt: number;
  onNextTeam: () => void;
}

function formatTime(sec: number) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function MissionComplete({ startedAt, completedAt, onNextTeam }: MissionCompleteProps) {
  const elapsed = Math.floor((completedAt - startedAt) / 1000);
  const remaining = Math.max(0, GAME_DURATION_SEC - elapsed);

  useEffect(() => {
    playSound.success();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/95"
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

      <div className="relative z-10 w-full max-w-2xl px-8 space-y-8 text-center">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs tracking-[0.5em] text-green-700 mb-2">// OPERATION COMPLETE</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-[0.3em] text-glow animate-glitch">
            MISSION COMPLETE
          </h1>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Elapsed time */}
          <div className="hud-widget p-4 flex flex-col items-center gap-2">
            <Clock size={18} className="text-green-600" />
            <p className="text-green-700 text-xs tracking-widest">ELAPSED TIME</p>
            <p className="text-green-400 text-glow text-3xl font-black tabular-nums">
              {formatTime(elapsed)}
            </p>
          </div>

          {/* Time remaining */}
          <div className="hud-widget p-4 flex flex-col items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-green-700 text-xs tracking-widest">TIME REMAINING</p>
            <p className={`text-3xl font-black tabular-nums ${
              remaining > 120 ? 'text-green-400 text-glow' : 'text-yellow-400'
            }`}>
              {formatTime(remaining)}
            </p>
          </div>
        </motion.div>

        {/* Final code */}
        <motion.div
          className="border-2 border-green-500 bg-green-950/20 py-4 px-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          style={{ boxShadow: '0 0 20px rgba(0,255,65,0.2)' }}
        >
          <p className="text-green-700 text-xs tracking-[0.4em] mb-1">FINAL ESCAPE CODE</p>
          <p className="text-green-400 text-glow text-6xl font-black tracking-[0.6em] animate-glitch">
            {FINAL_CODE}
          </p>
          <p className="text-green-700 text-xs tracking-widest mt-2">
            위 코드를 담당자에게 제출하라
          </p>
        </motion.div>

        {/* Next team button */}
        <motion.button
          onClick={onNextTeam}
          className="w-full flex items-center justify-center gap-3 py-4 border-2 border-green-400
                     text-green-400 text-glow text-xl font-bold tracking-[0.3em]
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
          className="text-green-800 text-xs tracking-widest"
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
