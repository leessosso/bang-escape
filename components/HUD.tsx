'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Clock, RotateCcw } from 'lucide-react';

interface HUDProps {
  startedAt: number | null;
  currentStage: number;
  totalStages: number;
  onReset?: () => void;
}

export default function HUD({ startedAt, currentStage, totalStages, onReset }: HUDProps) {
  const [elapsed, setElapsed] = useState(() => (
    startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0
  ));
  const [isResetHolding, setIsResetHolding] = useState(false);
  const resetHoldTimer = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!startedAt) return;
    setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
  }, [startedAt]);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const cancelResetHold = useCallback(() => {
    if (resetHoldTimer.current) {
      window.clearTimeout(resetHoldTimer.current);
      resetHoldTimer.current = null;
    }
    setIsResetHolding(false);
  }, []);

  const startResetHold = useCallback(() => {
    if (!onReset || resetHoldTimer.current) return;
    setIsResetHolding(true);
    resetHoldTimer.current = window.setTimeout(() => {
      resetHoldTimer.current = null;
      setIsResetHolding(false);
      onReset();
    }, 1500);
  }, [onReset]);

  useEffect(() => cancelResetHold, [cancelResetHold]);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  const showReset = Boolean(onReset && currentStage > 0);

  return (
    <div className="fixed top-3 right-3 z-200 flex flex-col gap-2 text-xs font-mono">
      {/* Stage progress */}
      <div className="hud-widget px-3 py-1.5 rounded text-[10px] tracking-widest">
        <span className="text-green-600">STAGE </span>
        <span className="text-glow font-bold">
          {currentStage + 1}/{totalStages}
        </span>
        <span className="text-green-600"> ACTIVE</span>
      </div>

      {/* Elapsed timer */}
      <div className="hud-widget px-3 py-2 rounded flex items-center gap-2">
        <Clock size={12} className="text-green-500" />
        <span className="tracking-widest text-green-600">ELAPSED</span>
        <span
          className="font-bold text-base ml-auto tabular-nums text-glow"
        >
          {minutes}:{seconds}
        </span>
      </div>

      {showReset && (
        <button
          type="button"
          onPointerDown={startResetHold}
          onPointerUp={cancelResetHold}
          onPointerCancel={cancelResetHold}
          onPointerLeave={cancelResetHold}
          className={`
            hud-widget px-3 py-2 rounded flex items-center gap-2
            border border-red-900/70 text-[10px] tracking-widest
            transition-all duration-150 select-none
            ${isResetHolding
              ? 'bg-red-950/70 text-red-300 border-red-400 text-glow-red'
              : 'text-red-700 hover:text-red-400 hover:border-red-600'
            }
          `}
          title="1.5초 동안 누르면 첫 단계로 돌아갑니다"
        >
          <RotateCcw size={12} />
          <span>{isResetHolding ? 'HOLDING...' : 'HOLD RESET'}</span>
        </button>
      )}
    </div>
  );
}
