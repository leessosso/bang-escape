'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, CheckCircle } from 'lucide-react';
import StageHeader from './StageHeader';
import { CIPHER_MOVE, CIPHER_ANSWER, CIPHER_ENCRYPTED } from '@/lib/constants';
import { primeFinalCctvPlayback } from '@/lib/finalCctvVideo';
import { playSound } from '@/lib/sounds';

interface StageProps {
  onComplete: () => void;
}

export default function StageCipher({ onComplete }: StageProps) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollInputIntoView = () => {
    window.setTimeout(() => {
      inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 120);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toUpperCase() === CIPHER_ANSWER) {
      setStatus('success');
      playSound.unlock();
      primeFinalCctvPlayback();
      setTimeout(onComplete, 1600);
    } else {
      setStatus('error');
      playSound.error();
      setInput('');
      setTimeout(() => setStatus('idle'), 1800);
    }
  };

  return (
    <div className="tablet-stage-shell mx-auto flex min-h-full flex-col items-center justify-center px-6 py-6 gap-6 sm:gap-8">
      {/* Header */}
      <StageHeader
        badge="STAGE // ENCRYPTION BYPASS"
        icon={<Lock />}
        trailingIcon={<Unlock />}
        title="CAESAR CIPHER"
        subtitle={<>&gt; 암호화된 메시지를 "<span className="text-yellow-400">MOVE {CIPHER_MOVE}</span>"으로 복호화하라</>}
      />

      {/* Encrypted message */}
      <div className="tablet-panel max-w-none text-center space-y-4">
        <p className="text-green-600 tablet-label">{'// ENCRYPTED MESSAGE'}</p>
        <div className="flex gap-2 justify-center sm:gap-4">
          {CIPHER_ENCRYPTED.split('').map((char, i) => (
            <div
              key={i}
              className="flex items-center justify-center border-2 border-green-700
                         text-4xl font-black text-green-400 tracking-wider bg-black/60"
              style={{
                width: 'clamp(52px, 4.6vw, 78px)',
                height: 'clamp(68px, 6.6vw, 110px)',
                boxShadow: '0 0 8px rgba(0,255,65,0.1)',
              }}
            >
              {char}
            </div>
          ))}
        </div>
        <p className="text-green-500 text-base tracking-[0.08em]">
          복호화된 단어를 입력하면 다음 단계로 진행됩니다
        </p>
      </div>

      {/* Input */}
      <div className="tablet-panel max-w-none space-y-3">
        <AnimatePresence>
          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-red-300 text-glow-red text-base tracking-[0.08em] border border-red-800 bg-red-950/30 px-4 py-2.5"
            >
              ⚠ DECRYPTION FAILED — WRONG KEY
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {status !== 'success' ? (
            <form key="form" onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-green-500 text-xl shrink-0">&gt;_</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="text"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                onFocus={scrollInputIntoView}
                placeholder="DECRYPTED WORD"
                maxLength={20}
                enterKeyHint="done"
                autoCapitalize="characters"
                className="terminal-input min-h-12 flex-1 text-2xl tracking-[0.26em] uppercase
                           placeholder:text-green-700 placeholder:text-lg placeholder:tracking-[0.12em]"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className="min-h-12 shrink-0 px-7 py-2 border border-green-500 text-green-400 text-glow
                           hover:bg-green-500 hover:text-black transition-all font-bold tracking-[0.08em] text-base"
              >
                DECRYPT
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
              <span className="text-green-400 text-glow text-xl font-bold tracking-[0.2em]">
                CIPHER BROKEN
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
