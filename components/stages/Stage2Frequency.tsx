'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ChevronUp, ChevronDown, Lock, Unlock, CheckCircle } from 'lucide-react';
import StageHeader from './StageHeader';
import { FREQ_TARGETS, FREQ_INITIAL } from '@/lib/constants';
import { playSound } from '@/lib/sounds';

interface StageProps {
  onComplete: () => void;
}

const CHANNEL_NAMES = ['CH-01', 'CH-02', 'CH-03', 'CH-04'];
const BAND_LABELS   = ['2.4 GHz', '5.0 GHz', '6.0 GHz', '60 GHz'];

// 오실로스코프 파형 컴포넌트
function Oscilloscope({ locked, freq }: { locked: boolean; freq: number }) {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 12 }, () => Math.random()));

  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => {
      setBars(Array.from({ length: 12 }, () => Math.random()));
    }, 120);
    return () => clearInterval(id);
  }, [locked]);

  if (locked) {
    // 안정적인 사인파
    return (
      <svg viewBox="0 0 120 40" className="w-full h-10">
        <path
          d={`M 0 20 ${Array.from({ length: 24 }, (_, i) => {
            const x = (i / 23) * 120;
            const y = 20 - Math.sin((i / 23) * Math.PI * 2 * 1.5) * 14;
            return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
          }).join(' ')}`}
          stroke="#00ff41"
          strokeWidth="2"
          fill="none"
          filter="drop-shadow(0 0 3px #00ff41)"
        />
        <text x="108" y="14" fontSize="8" fill="#00cc33" textAnchor="end">{freq}.0</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 40" className="w-full h-10">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 10 + 1}
          y={40 - h * 36}
          width={8}
          height={h * 36}
          fill={`rgba(0,${Math.floor(80 + h * 80)},0,0.7)`}
        />
      ))}
    </svg>
  );
}

interface ChannelProps {
  name: string;
  band: string;
  current: number;
  target: number;
  onUp: () => void;
  onDown: () => void;
}

function Channel({ name, band, current, target, onUp, onDown }: ChannelProps) {
  const locked = current === target;

  return (
    <motion.div
      className={`flex flex-col items-center border-2 bg-black/70 p-3 gap-2 transition-colors duration-300 flex-1
                  ${locked ? 'border-green-400' : 'border-green-900'}`}
      style={locked ? { boxShadow: '0 0 16px rgba(0,255,65,0.3)' } : undefined}
      animate={locked ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 w-full">
        {locked
          ? <Lock size={12} className="text-green-400" />
          : <Unlock size={12} className="text-green-700" />
        }
        <span className={`text-xs font-bold tracking-widest ${locked ? 'text-green-400' : 'text-green-700'}`}>
          {name}
        </span>
        <span className="ml-auto text-[9px] text-green-900">{band}</span>
      </div>

      {/* Oscilloscope — 잠겼을 때만 안정적인 파형, 그 외엔 노이즈 (힌트 없음) */}
      <div className="w-full border border-green-950 bg-black p-1">
        <Oscilloscope locked={locked} freq={current} />
      </div>

      {/* Frequency value — 거리 힌트 없음 */}
      <div className={`text-4xl font-black tabular-nums tracking-widest ${locked ? 'text-green-400 text-glow' : 'text-green-600'}`}>
        {current}
        {locked && <span className="text-green-600 text-sm ml-1">GHz</span>}
      </div>

      {locked
        ? <div className="text-[10px] text-green-500 tracking-[0.3em] font-bold">● SIGNAL LOCKED</div>
        : <div className="text-[10px] text-green-900 tracking-[0.2em]">SEARCHING...</div>
      }

      {/* Up / Down buttons */}
      <div className="flex gap-2 w-full">
        <button
          onClick={onDown}
          disabled={locked}
          className="flex-1 flex items-center justify-center py-1.5 border border-green-800
                     hover:border-green-500 hover:bg-green-950/50 active:scale-95
                     transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown size={16} className="text-green-500" />
        </button>
        <button
          onClick={onUp}
          disabled={locked}
          className="flex-1 flex items-center justify-center py-1.5 border border-green-800
                     hover:border-green-500 hover:bg-green-950/50 active:scale-95
                     transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp size={16} className="text-green-500" />
        </button>
      </div>
    </motion.div>
  );
}

export default function StageFrequency({ onComplete }: StageProps) {
  const [values, setValues] = useState<number[]>([...FREQ_INITIAL]);
  const [solved, setSolved] = useState(false);

  const allLocked = useCallback((vals: number[]) =>
    vals.every((v, i) => v === FREQ_TARGETS[i]), []);

  const adjust = (ch: number, delta: number) => {
    if (solved) return;
    const next = [...values];
    next[ch] = (next[ch] + delta + 10) % 10;
    playSound.beep();
    setValues(next);
    if (allLocked(next)) {
      setSolved(true);
      playSound.success();
      setTimeout(onComplete, 2000);
    }
  };

  const lockedCount = values.filter((v, i) => v === FREQ_TARGETS[i]).length;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-5">
      {/* Header */}
      <StageHeader
        badge="STAGE // FREQUENCY CALIBRATION"
        icon={<Radio size={28} className="animate-pulse" />}
        title="SIGNAL LOCK"
        subtitle={<>&gt; 4개 채널을 <span className="text-green-400">올바른 주파수</span>로 맞춰 신호를 잠궈라</>}
      />

      {/* Status bar — 잠긴 채널 수만 표시, 거리 힌트 없음 */}
      <div className="w-full max-w-3xl flex items-center gap-3 border border-green-900 px-4 py-2 bg-black/60">
        <span className="text-green-700 text-xs tracking-widest">LOCKED</span>
        <div className="flex gap-1 flex-1">
          {FREQ_TARGETS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                values[i] === FREQ_TARGETS[i] ? 'bg-green-400' : 'bg-green-950'
              }`}
              style={values[i] === FREQ_TARGETS[i] ? { boxShadow: '0 0 6px #00ff41' } : undefined}
            />
          ))}
        </div>
        <span className={`text-xs font-bold tracking-widest ${lockedCount === FREQ_TARGETS.length ? 'text-green-400 text-glow' : 'text-green-700'}`}>
          {lockedCount}/{FREQ_TARGETS.length} CH
        </span>
      </div>

      {/* Channels */}
      <div className="flex gap-3 w-full max-w-3xl">
        {FREQ_TARGETS.map((_, i) => (
          <Channel
            key={i}
            name={CHANNEL_NAMES[i]}
            band={BAND_LABELS[i]}
            current={values[i]}
            target={FREQ_TARGETS[i]}
            onUp={() => adjust(i, 1)}
            onDown={() => adjust(i, -1)}
          />
        ))}
      </div>

      <p className="text-green-900 text-xs tracking-widest">
        오실로스코프가 안정될 때까지 탐색하라 // 팀원과 채널을 분담하세요
      </p>

      {/* Success overlay */}
      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 z-10"
          >
            <div className="border-2 border-green-400 bg-black px-12 py-8 text-center space-y-3"
                 style={{ boxShadow: '0 0 40px rgba(0,255,65,0.4)' }}>
              <CheckCircle size={48} className="text-green-400 mx-auto text-glow" />
              <p className="text-green-400 text-glow text-2xl font-black tracking-[0.4em]">
                ALL CHANNELS LOCKED
              </p>
              <p className="text-green-600 text-sm tracking-widest animate-blink">
                PROCEEDING TO NEXT MODULE...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
