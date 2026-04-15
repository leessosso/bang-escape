'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, RotateCcw } from 'lucide-react';
import { MEMORY_GRID_SIZE, MEMORY_ROUNDS, MEMORY_ROUND3_PHASES, MEMORY_SHOW_MS, MEMORY_SHOW_MS_R3 } from '@/lib/constants';
import { playSound } from '@/lib/sounds';

interface StageProps {
  onComplete: () => void;
}

type Phase = 'intro' | 'memorize' | 'recall' | 'wrong' | 'round-pass' | 'complete';

const TOTAL_CELLS = MEMORY_GRID_SIZE * MEMORY_GRID_SIZE; // 16

export default function StageMemory({ onComplete }: StageProps) {
  const [round, setRound] = useState(0);               // 0~2
  const [phase, setPhase] = useState<Phase>('intro');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<number>>(new Set());
  const [countdown, setCountdown] = useState(Math.ceil(MEMORY_SHOW_MS / 1000));
  const [attempts, setAttempts] = useState(0);
  // Round 3 전용: 0 = 첫 번째 플래시, 1 = 두 번째 플래시
  const [memFlash, setMemFlash] = useState(0);

  const correctSet = MEMORY_ROUNDS[round];
  const requiredCount = correctSet.length;

  // 현재 memorize 단계에서 보여줄 셀 인덱스 목록
  const currentMemorizeCells =
    round === 2
      ? MEMORY_ROUND3_PHASES[memFlash as 0 | 1]
      : MEMORY_ROUNDS[round];

  const showMs = round === 2 ? MEMORY_SHOW_MS_R3 : MEMORY_SHOW_MS;

  const startRound = useCallback((r: number) => {
    const ms = r === 2 ? MEMORY_SHOW_MS_R3 : MEMORY_SHOW_MS;
    setRound(r);
    setSelected(new Set());
    setWrongCells(new Set());
    setMemFlash(0);
    setPhase('memorize');
    setCountdown(Math.ceil(ms / 1000));
  }, []);

  // 카운트다운 (memorize 단계)
  useEffect(() => {
    if (phase !== 'memorize') return;
    if (countdown <= 0) {
      // Round 3: 첫 번째 플래시 종료 → 두 번째 플래시로 전환
      if (round === 2 && memFlash === 0) {
        setMemFlash(1);
        setCountdown(Math.ceil(MEMORY_SHOW_MS_R3 / 1000));
      } else {
        setPhase('recall');
      }
      return;
    }
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [phase, countdown, round, memFlash]);

  // 셀 클릭 (recall 단계)
  const handleCellClick = (idx: number) => {
    if (phase !== 'recall') return;
    playSound.beep();
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // 제출
  const handleSubmit = () => {
    const correct = MEMORY_ROUNDS[round];
    const isCorrect =
      selected.size === correct.length &&
      correct.every((i) => selected.has(i));

    if (isCorrect) {
      playSound.success();
      if (round >= MEMORY_ROUNDS.length - 1) {
        setPhase('complete');
        setTimeout(onComplete, 2000);
      } else {
        setPhase('round-pass');
        setTimeout(() => startRound(round + 1), 1800);
      }
    } else {
      // 틀린 칸 표시
      const wrong = new Set<number>();
      selected.forEach((i) => { if (!correct.includes(i)) wrong.add(i); });
      correct.forEach((i) => { if (!selected.has(i)) wrong.add(i); });
      setWrongCells(wrong);
      setPhase('wrong');
      setAttempts((a) => a + 1);
      playSound.error();
      setTimeout(() => startRound(round), 2000);
    }
  };

  const isMemorize = phase === 'memorize';
  const isRecall = phase === 'recall';

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-xs tracking-[0.4em] text-green-600">STAGE // MEMORY INTEGRITY CHECK</p>
        <h2 className="text-3xl font-bold tracking-[0.25em] text-glow flex items-center gap-3 justify-center">
          <Brain size={28} />
          MEMORY MATRIX
        </h2>
        <p className="text-green-600 text-sm tracking-widest">
          &gt; 패턴을 <span className="text-green-400">기억</span>하고 정확히 <span className="text-green-400">재현</span>하라
        </p>
      </div>

      {/* Round indicator */}
      <div className="flex gap-3">
        {MEMORY_ROUNDS.map((r, i) => (
          <div
            key={i}
            className={`px-4 py-1 border text-xs tracking-widest font-bold
                        ${i < round ? 'border-green-700 text-green-700' :
                          i === round ? 'border-green-400 text-green-400 text-glow' :
                          'border-green-950 text-green-950'}`}
          >
            ROUND {i + 1}
            {i < round && ' ✓'}
          </div>
        ))}
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-4">
            <p className="text-green-500 tracking-widest">라운드 {round + 1} 준비 완료</p>
            {round === 2 ? (
              <p className="text-yellow-500 text-sm tracking-widest leading-relaxed">
                ⚠ CAUTION: {requiredCount}개의 칸이<br />
                <span className="text-yellow-400 font-bold">2회 분할 플래시</span>로 표시됩니다<br />
                <span className="text-green-700">각 플래시 {MEMORY_SHOW_MS_R3 / 1000}초 — 모두 기억하라</span>
              </p>
            ) : (
              <p className="text-green-700 text-sm tracking-widest">
                {requiredCount}개의 칸이 {showMs / 1000}초간 표시됩니다
              </p>
            )}
            <button
              onClick={() => startRound(round)}
              className="px-8 py-3 border-2 border-green-400 text-green-400 text-glow
                         font-bold tracking-widest hover:bg-green-400 hover:text-black transition-all"
            >
              START ROUND {round + 1}
            </button>
          </motion.div>
        )}
        {isMemorize && (
          <motion.p key={`memorize-${round}-${memFlash}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-green-400 text-glow text-lg tracking-[0.4em] font-bold animate-pulse">
            {round === 2
              ? `FLASH ${memFlash + 1}/2 — MEMORIZING... ${countdown}s`
              : `MEMORIZING... ${countdown}s`}
          </motion.p>
        )}
        {isRecall && (
          <motion.p key="recall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-green-500 text-sm tracking-widest">
            선택: {selected.size} / {requiredCount}칸 — 틀려도 괜찮아, 팀원과 상의하라 (시도: {attempts + 1}회)
          </motion.p>
        )}
        {phase === 'wrong' && (
          <motion.p key="wrong" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-red-400 text-glow-red tracking-widest font-bold">
            ⚠ PATTERN MISMATCH — RETRY
          </motion.p>
        )}
        {phase === 'round-pass' && (
          <motion.p key="pass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-green-400 text-glow tracking-widest font-bold text-lg">
            ✓ ROUND {round + 1} CLEARED
          </motion.p>
        )}
        {phase === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 text-green-400 text-glow text-xl font-bold tracking-[0.3em]">
            <CheckCircle size={28} />
            MEMORY VERIFIED
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div
        className="grid gap-1.5 p-3 border border-green-900 bg-black/70"
        style={{ gridTemplateColumns: `repeat(${MEMORY_GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: TOTAL_CELLS }).map((_, idx) => {
          const isTarget = currentMemorizeCells.includes(idx);
          const isFullTarget = MEMORY_ROUNDS[round].includes(idx);
          const isSelected = selected.has(idx);
          const isWrong = wrongCells.has(idx);

          let cellStyle = 'border-green-900 bg-black hover:border-green-700 cursor-pointer';
          if (isMemorize && isTarget) {
            cellStyle = 'border-green-400 bg-green-400 shadow-[0_0_12px_#00ff41] cursor-default';
          } else if (isRecall) {
            if (isSelected) cellStyle = 'border-green-400 bg-green-950 shadow-[0_0_8px_#00ff41] cursor-pointer';
            else cellStyle = 'border-green-900 bg-black hover:border-green-700 cursor-pointer';
          } else if (phase === 'wrong') {
            if (isWrong) cellStyle = 'border-red-500 bg-red-950/60 cursor-default';
            else if (isFullTarget && isSelected) cellStyle = 'border-green-400 bg-green-950 cursor-default';
            else cellStyle = 'border-green-950 bg-black cursor-default';
          }

          return (
            <motion.button
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`w-13 h-13 sm:w-16 sm:h-16 border-2 transition-all duration-100 ${cellStyle}`}
              style={{ width: 'clamp(48px, 7vw, 64px)', height: 'clamp(48px, 7vw, 64px)' }}
              whileTap={isRecall ? { scale: 0.9 } : {}}
            >
              {isMemorize && isTarget && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-black opacity-30" />
                </div>
              )}
              {isRecall && isSelected && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-400"
                    style={{ boxShadow: '0 0 6px #00ff41' }} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Submit / retry */}
      <AnimatePresence>
        {isRecall && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-4"
          >
            <button
              onClick={() => { setSelected(new Set()); playSound.beep(); }}
              className="flex items-center gap-2 px-4 py-2 border border-green-800 text-green-700
                         hover:border-green-600 hover:text-green-500 transition-all text-sm tracking-widest"
            >
              <RotateCcw size={14} />
              RESET
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.size !== requiredCount}
              className="flex items-center gap-2 px-6 py-2 border-2 border-green-400 text-green-400
                         text-glow font-bold tracking-widest text-sm
                         hover:bg-green-400 hover:text-black transition-all
                         disabled:border-green-900 disabled:text-green-900 disabled:cursor-not-allowed"
            >
              SUBMIT ({selected.size}/{requiredCount})
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
