'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, CheckCircle, QrCode } from 'lucide-react';
import StageHeader from './StageHeader';
import { MORSE_ANSWER, MORSE_CODE } from '@/lib/constants';
import { playSound } from '@/lib/sounds';

interface StageProps {
  onComplete: () => void;
}

const ENCODED: { letter: string; code: string }[] = MORSE_ANSWER.split('').map((c) => ({
  letter: c,
  code: MORSE_CODE[c] ?? '?',
}));

function MorseSymbol({ char, active }: { char: string; active: boolean }) {
  if (char === '.') {
    return (
      <span
        className={`inline-block w-4 h-4 rounded-full border-2 mx-1 transition-all duration-100
                    ${active
                      ? 'bg-green-400 border-green-400 shadow-[0_0_10px_#00ff41]'
                      : 'bg-transparent border-green-900'}`}
      />
    );
  }
  return (
    <span
      className={`inline-block w-10 h-4 rounded-sm border-2 mx-1 transition-all duration-100
                  ${active
                    ? 'bg-green-400 border-green-400 shadow-[0_0_10px_#00ff41]'
                    : 'bg-transparent border-green-900'}`}
    />
  );
}

export default function StageSignal({ onComplete }: StageProps) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // 전체 심볼 목록 (글자 사이 gap 포함)
  const allSymbols: { letterIdx: number; symIdx: number }[] = [];
  ENCODED.forEach(({ code }, li) =>
    code.split('').forEach((_, si) => allSymbols.push({ letterIdx: li, symIdx: si }))
  );

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setActiveIdx(i);
      if (i >= allSymbols.length - 1) {
        clearInterval(id);
        setTimeout(() => inputRef.current?.focus(), 300);
      }
      i++;
    }, 300);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toUpperCase() === MORSE_ANSWER) {
      setStatus('success');
      playSound.unlock();
      setTimeout(onComplete, 1600);
    } else {
      setStatus('error');
      playSound.error();
      setInput('');
      setTimeout(() => setStatus('idle'), 1800);
    }
  };

  // 글자별 심볼 시작 인덱스 계산
  let globalSym = 0;
  const perLetter = ENCODED.map(({ code }) => {
    const start = globalSym;
    globalSym += code.length;
    return { code, start };
  });

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      {/* Header */}
      <StageHeader
        badge="STAGE // SIGNAL INTERCEPT"
        icon={<Radio size={28} className="animate-pulse" />}
        title="MORSE DECODE"
        subtitle={<>&gt; 수신된 모스 신호를 해독하여 <span className="text-green-400">영단어</span>를 입력하라</>}
      />

      {/* QR 안내 */}
      <div className="flex items-center gap-3 border border-green-800 bg-green-950/20 px-5 py-3 rounded">
        <QrCode size={28} className="text-green-500 shrink-0" />
        <div>
          <p className="text-green-400 text-sm font-bold tracking-widest">모스 부호 참조표</p>
          <p className="text-green-700 text-xs tracking-widest mt-0.5">
            현장에 비치된 QR 코드를 스캔하면 모스 규칙을 확인할 수 있습니다
          </p>
        </div>
      </div>

      {/* Morse display */}
      <div className="border border-green-900 bg-black/70 p-8 rounded w-full max-w-2xl">
        <p className="text-green-800 text-xs tracking-widest mb-6">// INCOMING TRANSMISSION</p>
        <div className="flex items-end justify-center gap-10 flex-wrap">
          {perLetter.map(({ code, start }, li) => (
            <div key={li} className="flex flex-col items-center gap-4">
              {/* 심볼 행 */}
              <div className="flex items-center h-8">
                {code.split('').map((sym, si) => (
                  <MorseSymbol
                    key={si}
                    char={sym}
                    active={activeIdx >= start + si}
                  />
                ))}
              </div>
              {/* CHAR 번호 */}
              <span className="text-green-800 text-xs tracking-[0.3em]">CHAR {li + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl space-y-3">
        <AnimatePresence>
          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-glow-red text-sm tracking-widest border border-red-900 bg-red-950/30 px-4 py-2"
            >
              ⚠ DECODE FAILED — WRONG ANSWER
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {status !== 'success' ? (
            <form key="form" onSubmit={handleSubmit} className="flex gap-3 items-center">
              <span className="text-green-500 text-xl shrink-0">&gt;_</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                placeholder="DECODED WORD"
                maxLength={20}
                className="terminal-input flex-1 text-2xl tracking-[0.5em] uppercase
                           placeholder:text-green-900 placeholder:text-base placeholder:tracking-widest"
                autoComplete="off"
              />
              <button
                type="submit"
                className="shrink-0 px-6 py-2 border border-green-500 text-green-400 text-glow
                           hover:bg-green-500 hover:text-black transition-all font-bold tracking-widest text-sm"
              >
                SEND
              </button>
            </form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 border-2 border-green-400 px-6 py-4 animate-success-pulse"
            >
              <CheckCircle size={24} className="text-green-400" />
              <span className="text-green-400 text-glow text-xl font-bold tracking-[0.4em]">
                SIGNAL DECODED
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
