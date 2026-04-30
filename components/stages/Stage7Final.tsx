'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, CheckCircle } from 'lucide-react';
import StageHeader from './StageHeader';
import { FINAL_CODE } from '@/lib/constants';
import { playSound } from '@/lib/sounds';

const NOISE_CHARS = '█▓▒░▀▄■□▪▫◆◇○●◉⊕⊗╬╫╪░▒▓';
const LOADING_DOT_INDICES = [0, 1, 2, 3, 4];

function createNoiseRows(cols: number, rows: number): string[] {
  return Array.from({ length: rows }, (_, row) => (
    Array.from({ length: cols }, (_, col) => {
      const index = (row * 17 + col * 31 + row * col) % NOISE_CHARS.length;
      return NOISE_CHARS[index];
    }).join('')
  ));
}

function StaticNoise({ cols, rows }: { cols: number; rows: number }) {
  const noiseRows = useMemo(() => createNoiseRows(cols, rows), [cols, rows]);

  return (
    <div
      aria-hidden="true"
      className="font-mono text-green-900/70 leading-none text-xs overflow-hidden select-none whitespace-pre"
    >
      {noiseRows.map((line, row) => (
        <div key={row}>{line}</div>
      ))}
    </div>
  );
}

function GlitchCode({ code }: { code: string }) {
  const [display, setDisplay] = useState('????');
  const [phase, setPhase] = useState<'noise' | 'reveal' | 'stable'>('noise');
  const codeDigits = useMemo(() => code.split(''), [code]);

  useEffect(() => {
    let step = 0;
    const total = 30;
    const id = setInterval(() => {
      step++;
      if (step < total * 0.6) {
        // 노이즈 단계
        setDisplay(
          codeDigits
            .map(() => String(Math.floor(Math.random() * 10)))
            .join('')
        );
        setPhase('noise');
      } else if (step < total) {
        // 점진적 공개
        const revealed = Math.floor(((step - total * 0.6) / (total * 0.4)) * code.length);
        setDisplay(
          codeDigits
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
  }, [code, codeDigits]);

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

interface StageProps {
  onComplete: () => void;
}

export default function Stage7Final({ onComplete }: StageProps) {
  const [phase, setPhase] = useState<'cctv' | 'reveal' | 'done'>('cctv');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 2500);
    const t2 = setTimeout(() => setPhase('done'), 6000);
    const t3 = setTimeout(() => onComplete(), 7200); // 코드 공개 후 MissionComplete 진입
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      {/* Header */}
      <StageHeader
        badge="STAGE // FINAL RECOVERY"
        icon={<Tv size={28} />}
        title="CCTV RESTORATION"
        subtitle={<>&gt; 복구 코드를 확인하고 시스템을 <span className="text-green-400">완전히 복원</span>하라</>}
      />

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
                    {LOADING_DOT_INDICES.map((i) => (
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
