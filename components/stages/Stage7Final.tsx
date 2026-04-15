'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, CheckCircle } from 'lucide-react';
import { FINAL_CODE } from '@/lib/constants';
import { playSound } from '@/lib/sounds';

const NOISE_CHARS = '█▓▒░▀▄■□▪▫◆◇○●◉⊕⊗╬╫╪░▒▓';

function NoiseChar() {
  const [char, setChar] = useState('█');
  useEffect(() => {
    const id = setInterval(() => {
      setChar(NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)]);
    }, 60);
    return () => clearInterval(id);
  }, []);
  return <span className="opacity-60">{char}</span>;
}

function StaticNoise({ cols, rows }: { cols: number; rows: number }) {
  return (
    <div className="font-mono text-green-900 leading-none text-xs overflow-hidden select-none">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex">
          {Array.from({ length: cols }).map((_, c) => (
            <NoiseChar key={c} />
          ))}
        </div>
      ))}
    </div>
  );
}

function GlitchCode({ code }: { code: string }) {
  const [display, setDisplay] = useState('????');
  const [phase, setPhase] = useState<'noise' | 'reveal' | 'stable'>('noise');

  useEffect(() => {
    let step = 0;
    const total = 30;
    const id = setInterval(() => {
      step++;
      if (step < total * 0.6) {
        // 노이즈 단계
        setDisplay(
          code
            .split('')
            .map(() => String(Math.floor(Math.random() * 10)))
            .join('')
        );
        setPhase('noise');
      } else if (step < total) {
        // 점진적 공개
        const revealed = Math.floor(((step - total * 0.6) / (total * 0.4)) * code.length);
        setDisplay(
          code
            .split('')
            .map((c, i) => (i < revealed ? c : String(Math.floor(Math.random() * 10))))
            .join('')
        );
        setPhase('reveal');
      } else {
        setDisplay(code);
        setPhase('stable');
        clearInterval(id);
        playSound.unlock();
      }
    }, 80);
    return () => clearInterval(id);
  }, [code]);

  return (
    <motion.div
      className={`text-8xl sm:text-9xl font-black tracking-[0.3em] tabular-nums
                  ${phase === 'stable' ? 'text-glow animate-glitch' : 'text-green-700'}
                  transition-colors duration-300`}
      animate={phase === 'stable' ? {
        textShadow: [
          '0 0 10px #00ff41, 0 0 20px #00ff41',
          '0 0 20px #00ff41, 0 0 40px #00ff41, 0 0 60px #00ff41',
          '0 0 10px #00ff41, 0 0 20px #00ff41',
        ],
      } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      {display}
    </motion.div>
  );
}

interface Stage3Props {
  onComplete: () => void;
}

export default function Stage3Final({ onComplete }: Stage3Props) {
  const [phase, setPhase] = useState<'cctv' | 'reveal' | 'done'>('cctv');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 2500);
    const t2 = setTimeout(() => setPhase('done'), 6000);
    const t3 = setTimeout(() => onComplete(), 7200); // 코드 공개 후 MissionComplete 진입
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs tracking-[0.4em] text-green-600">STAGE 03 // FINAL RECOVERY</p>
        <h2 className="text-3xl font-bold tracking-[0.25em] text-glow">CCTV RESTORATION</h2>
      </div>

      {/* CCTV Monitor frame */}
      <div className="relative border-4 border-green-800 bg-black overflow-hidden"
           style={{
             width: 'min(480px, 90vw)',
             aspectRatio: '4/3',
             boxShadow: '0 0 30px rgba(0,255,65,0.2), inset 0 0 20px rgba(0,0,0,0.8)',
           }}>

        {/* Monitor header bar */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-green-950/80 border-b border-green-900
                        flex items-center px-3 gap-2 z-20">
          <Tv size={12} className="text-green-600" />
          <span className="text-green-600 text-[10px] tracking-widest">CAM-07 // RECOVERY MODE</span>
          <span className="ml-auto text-green-800 text-[10px] animate-blink">● REC</span>
        </div>

        {/* Phase: CCTV static noise */}
        <AnimatePresence>
          {phase === 'cctv' && (
            <motion.div
              key="noise"
              className="absolute inset-0 pt-7 flex items-center justify-center"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="animate-noise w-full h-full overflow-hidden">
                <StaticNoise cols={60} rows={30} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-green-600 text-xs tracking-widest animate-pulse">
                    RECOVERING SIGNAL...
                  </p>
                  <div className="flex gap-1 justify-center">
                    {[0,1,2,3,4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase: reveal */}
        <AnimatePresence>
          {(phase === 'reveal' || phase === 'done') && (
            <motion.div
              key="reveal"
              className="absolute inset-0 pt-7 flex flex-col items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Background subtle noise */}
              <div className="absolute inset-0 opacity-10">
                <StaticNoise cols={40} rows={20} />
              </div>

              <div className="relative z-10 text-center space-y-3">
                <p className="text-green-600 text-xs tracking-[0.4em]">
                  DECRYPTING RECOVERY CODE...
                </p>
                <GlitchCode code={FINAL_CODE} />
                <AnimatePresence>
                  {phase === 'done' && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-500 text-sm tracking-[0.3em]"
                    >
                      SYSTEM RESTORED
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanline overlay on monitor */}
        <div className="absolute inset-0 pointer-events-none z-10"
             style={{
               background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)'
             }} />
      </div>

      {/* Transitioning indicator */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-green-600 text-xs tracking-widest"
          >
            <CheckCircle size={14} />
            <span className="animate-pulse">UPLOADING RECOVERY REPORT...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
