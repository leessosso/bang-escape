'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Terminal } from 'lucide-react';
import StageHeader from './StageHeader';
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

const PIN_LENGTH = 4;
const KEYPAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function Stage0Login({ onComplete }: StageProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [bootDone, setBootDone] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= BOOT_LINES.length) {
        clearInterval(id);
        setTimeout(() => {
          setBootDone(true);
          inputRefs.current[0]?.focus();
        }, 300);
      }
    }, 280);
    return () => clearInterval(id);
  }, []);

  const verify = useCallback((code: string) => {
    if (code === LOGIN_PASSWORD) {
      setStatus('success');
      playSound.unlock();
      setTimeout(onComplete, 1800);
    } else {
      setStatus('error');
      playSound.error();
      setTimeout(() => {
        setStatus('idle');
        setDigits(Array(PIN_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }, 1500);
    }
  }, [onComplete]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === PIN_LENGTH - 1) {
      const code = next.join('');
      if (code.length === PIN_LENGTH) {
        setTimeout(() => verify(code), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeypadPress = useCallback((key: string) => {
    if (status !== 'idle') return;

    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);

    if (key === '⌫') {
      setDigits((prev) => {
        const next = [...prev];
        const lastFilled = [...next].map((d, i) => (d ? i : -1)).filter(i => i >= 0);
        if (lastFilled.length === 0) return next;
        const idx = lastFilled[lastFilled.length - 1];
        next[idx] = '';
        inputRefs.current[idx]?.focus();
        return next;
      });
      return;
    }

    // 함수형 업데이터 밖에서 계산: StrictMode에서 업데이터는 두 번 실행되므로
    // setTimeout 같은 사이드이펙트는 업데이터 외부에서 처리해야 함
    const emptyIdx = digits.findIndex((d) => d === '');
    if (emptyIdx === -1) return;

    const next = [...digits];
    next[emptyIdx] = key;
    setDigits(next);
    inputRefs.current[Math.min(emptyIdx + 1, PIN_LENGTH - 1)]?.focus();

    if (emptyIdx === PIN_LENGTH - 1) {
      const code = next.join('');
      setTimeout(() => verify(code), 100);
    }
  }, [status, verify, digits]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;
    const next = Array(PIN_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, PIN_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === PIN_LENGTH) setTimeout(() => verify(pasted), 100);
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
        <StageHeader
          badge="STAGE // SYSTEM ACCESS"
          icon={<Shield size={28} />}
          title="SECURITY AUTHENTICATION"
          subtitle={<>&gt; 4자리 인증 코드를 입력하여 <span className="text-green-400">시스템</span>에 접근하라</>}
        />

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

        {/* PIN input area */}
        <AnimatePresence>
          {bootDone && status !== 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <p className="text-green-600 text-xs tracking-[0.3em] text-center">
                ENTER 4-DIGIT ACCESS CODE
              </p>
              <p className="text-green-500/80 text-sm text-center">
                등촌교회와 가장 관련있는 구절은?
              </p>

              {/* PIN boxes + Keypad side by side */}
              <div className="flex items-center justify-center gap-8">

                {/* 4-digit PIN boxes (세로 배치) */}
                <div className="flex flex-col gap-3">
                  {digits.map((digit, i) => (
                    <motion.div
                      key={i}
                      animate={status === 'error' ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <input
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        maxLength={2}
                        className={`
                          w-16 h-16 text-center text-3xl font-bold
                          border-2 bg-black/80 outline-none
                          transition-all duration-150 cursor-text
                          ${status === 'error'
                            ? 'border-red-500 text-red-400'
                            : digit
                              ? 'border-green-400 text-green-300 text-glow'
                              : 'border-green-800 text-green-400 focus:border-green-400'
                          }
                        `}
                        autoComplete="off"
                        style={{ caretColor: 'transparent' }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-2 w-52">
                  {KEYPAD.map((key, i) => (
                    <motion.button
                      key={i}
                      onClick={() => key && handleKeypadPress(key)}
                      disabled={!key || status !== 'idle'}
                      animate={pressedKey === key ? { scale: 0.88 } : { scale: 1 }}
                      transition={{ duration: 0.1 }}
                      className={`
                        h-14 text-xl font-bold border tracking-widest
                        transition-colors duration-100 select-none
                        ${!key ? 'invisible' : ''}
                        ${key === '⌫'
                          ? 'border-green-900 text-green-600 hover:border-green-600 hover:text-green-400 hover:bg-green-950/40'
                          : 'border-green-900 text-green-400 hover:border-green-400 hover:bg-green-950/60 hover:text-glow'
                        }
                        ${pressedKey === key ? 'bg-green-900/60 border-green-400' : 'bg-black/60'}
                        ${status === 'error' ? 'border-red-900 text-red-700 pointer-events-none' : ''}
                      `}
                    >
                      {key}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border border-red-800 bg-red-950/40 p-3"
                  >
                    <p className="text-red-400 text-glow-red text-sm tracking-widest font-bold text-center">
                      ⚠ ACCESS DENIED — INVALID CODE
                    </p>
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
