'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, CheckCircle } from 'lucide-react';
import StageHeader from './StageHeader';
import { CIPHER_MOVE, CIPHER_ANSWER, CIPHER_ENCRYPTED } from '@/lib/constants';
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
      setTimeout(onComplete, 1600);
    } else {
      setStatus('error');
      playSound.error();
      setInput('');
      setTimeout(() => setStatus('idle'), 1800);
    }
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-6 gap-6 sm:gap-8">
      {/* Header */}
      <StageHeader
        badge="STAGE // ENCRYPTION BYPASS"
        icon={<><Lock size={26} /><Unlock size={26} /></>}
        title="CAESAR CIPHER"
        subtitle={<>&gt; 암호화된 메시지를 <span className="text-green-400">MOVE {CIPHER_MOVE}</span>로 복호화하라</>}
      />

      {/* Encrypted message */}
      <div className="text-center space-y-4">
        <p className="text-green-700 text-xs tracking-[0.4em]">{'// ENCRYPTED MESSAGE'}</p>
        <div className="flex gap-2 justify-center sm:gap-4">
          {CIPHER_ENCRYPTED.split('').map((char, i) => (
            <div
              key={i}
              className="flex h-16 w-12 items-center justify-center border-2 border-green-700 sm:h-20 sm:w-16
                         text-4xl font-black text-green-400 tracking-wider bg-black/60"
              style={{ boxShadow: '0 0 8px rgba(0,255,65,0.1)' }}
            >
              {char}
            </div>
          ))}
        </div>
        <p className="text-green-800 text-xs tracking-widest">
          복호화된 단어를 입력하면 다음 단계로 진행됩니다
        </p>
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
                className="terminal-input flex-1 text-2xl tracking-[0.4em] uppercase
                           placeholder:text-green-900 placeholder:text-base"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className="min-h-12 shrink-0 px-6 py-2 border border-green-500 text-green-400 text-glow
                           hover:bg-green-500 hover:text-black transition-all font-bold tracking-widest text-sm"
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
              <span className="text-green-400 text-glow text-xl font-bold tracking-[0.4em]">
                CIPHER BROKEN
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
