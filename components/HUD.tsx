'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

interface HUDProps {
  currentStage: number;
  totalStages: number;
  onReset?: () => void;
}

export default function HUD({ currentStage, totalStages, onReset }: HUDProps) {
  const [isResetHolding, setIsResetHolding] = useState(false);
  const resetHoldTimer = useRef<number | null>(null);

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
