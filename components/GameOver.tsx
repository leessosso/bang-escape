'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GameOverProps {
  onRestart: () => void;
}

export default function GameOver({ onRestart }: GameOverProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-8 px-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <AlertTriangle size={80} className="text-red-500 mx-auto text-glow-red" />
        </motion.div>

        <div>
          <p className="text-red-500 text-glow-red text-2xl tracking-[0.3em] font-bold mb-2">
            MISSION FAILED
          </p>
          <p className="text-red-400 text-4xl font-bold tracking-[0.4em] animate-glitch">
            TIME EXPIRED
          </p>
        </div>

        <div className="border border-red-800 p-4 text-left space-y-1 text-sm text-red-400 max-w-md mx-auto">
          <p className="text-red-500 font-bold mb-2">// ERROR LOG</p>
          <p>&gt; CCTV recovery process terminated</p>
          <p>&gt; All data streams disconnected</p>
          <p>&gt; System entering lockdown mode...</p>
          <p className="animate-blink">&gt; _</p>
        </div>

        <button
          onClick={onRestart}
          className="flex items-center gap-3 mx-auto px-8 py-4 border-2 border-green-500
                     text-green-400 text-glow text-lg tracking-widest font-bold
                     hover:bg-green-500 hover:text-black transition-all duration-200
                     active:scale-95"
        >
          <RefreshCw size={20} />
          RESTART MISSION
        </button>
      </div>
    </motion.div>
  );
}
