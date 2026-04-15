'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Terminal } from 'lucide-react';
import { LOGIN_PASSWORD } from '@/lib/constants';
import { playSound } from '@/lib/sounds';

interface StageProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  'INITIALIZING SECURE SHELL v4.2.1...',
  'LOADING ENCRYPTION MODULES... OK',
  'CONNECTING TO SERVER NODE-07... OK',
  'AUTHENTICATION REQUIRED',
  '─────────────────────────────────────',
];

export default function Stage0Login({ onComplete }: StageProps) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [bootDone, setBootDone] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= BOOT_LINES.length) {
        clearInterval(id);
        setTimeout(() => {
          setBootDone(true);
          inputRef.current?.focus();
        }, 300);
      }
    }, 280);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === LOGIN_PASSWORD) {
      setStatus('success');
      playSound.unlock();
      setTimeout(onComplete, 1800);
    } else {
      setStatus('error');
      setErrorMsg(`ACCESS DENIED: "${input.trim()}" is not valid`);
      playSound.error();
      setInput('');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center h-full px-6 ${status === 'error' ? 'animate-red-flash' : ''}`}>
      {/* Red overlay when error */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            className="fixed inset-0 z-10 pointer-events-none"
            style={{ background: 'rgba(255,0,51,0.18)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield size={28} className="text-glow" />
          <div>
            <p className="text-xs tracking-[0.4em] text-green-600">CLASSIFIED — LEVEL 5</p>
            <h1 className="text-2xl font-bold tracking-[0.3em] text-glow">SECURITY AUTHENTICATION</h1>
          </div>
        </div>

        {/* Boot terminal */}
        <div className="border border-green-900 bg-black/80 p-5 rounded font-mono text-sm space-y-1 min-h-[160px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-900">
            <Terminal size={14} className="text-green-600" />
            <span className="text-green-600 text-xs tracking-widest">root@cctv-server:~#</span>
          </div>
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="text-green-400 leading-relaxed"
            >
              &gt; {line}
            </motion.p>
          ))}
          {!bootDone && <span className="animate-blink text-green-400">▋</span>}
        </div>

        {/* Input area */}
        <AnimatePresence>
          {bootDone && status !== 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <form onSubmit={handleSubmit} className="flex items-center gap-4">
                <span className="text-green-500 text-xl font-bold shrink-0">&gt;_</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="ENTER ACCESS CODE"
                  maxLength={10}
                  className="terminal-input w-full text-2xl tracking-[0.5em] placeholder:text-green-900 placeholder:text-base"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="shrink-0 px-5 py-2 border border-green-500 text-green-400 text-glow
                             hover:bg-green-500 hover:text-black transition-all font-bold tracking-widest text-sm"
                >
                  AUTH
                </button>
              </form>

              {/* Error message */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border border-red-800 bg-red-950/40 p-3"
                  >
                    <p className="text-red-400 text-glow-red text-sm tracking-widest font-bold">
                      ⚠ SECURITY BREACH DETECTED
                    </p>
                    <p className="text-red-500 text-xs mt-1">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-2 border-green-400 p-6 text-center animate-success-pulse"
            >
              <p className="text-green-400 text-glow text-3xl font-bold tracking-[0.5em]">
                ACCESS GRANTED
              </p>
              <p className="text-green-600 text-sm mt-2 tracking-widest animate-blink">
                INITIALIZING RECOVERY PROTOCOL...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
