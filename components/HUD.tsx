'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

interface HUDProps {
  currentStage: number;
  totalStages: number;
  onReset?: () => void;
}

export default function HUD({ currentStage, totalStages, onReset }: HUDProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  const handleResetClick = useCallback(() => {
    if (!onReset) return;

    if (confirmReset) {
      // 두 번째 클릭: 초기화 실행
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }
      setConfirmReset(false);
      onReset();
    } else {
      // 첫 번째 클릭: 확인 상태로 변경
      setConfirmReset(true);
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = window.setTimeout(() => {
        setConfirmReset(false);
      }, 3000); // 3초 후 원래 상태로 복귀
    }
  }, [confirmReset, onReset]);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const showReset = Boolean(onReset && currentStage > 0);

  return (
    <div className="fixed top-3 right-3 z-200 flex flex-col gap-2 font-mono">
      {/* Stage progress */}
      <div className="hud-widget min-h-11 px-3.5 py-2 rounded tablet-label text-green-500">
        <span className="text-green-600">STAGE </span>
        <span className="text-glow font-bold">
          {currentStage + 1}/{totalStages}
        </span>
        <span className="text-green-600"> ACTIVE</span>
      </div>

      {showReset && (
        <button
          type="button"
          onClick={handleResetClick}
          className={`
            hud-widget min-h-11 px-3.5 py-2 rounded flex items-center gap-2
            border border-red-800/80 tablet-label
            transition-all duration-150 select-none
            ${confirmReset
              ? 'bg-red-950/70 text-red-300 border-red-400 text-glow-red animate-pulse'
              : 'text-red-500 hover:text-red-300 hover:border-red-500'
            }
          `}
          title={confirmReset ? "한 번 더 누르면 초기화됩니다" : "첫 단계로 돌아갑니다"}
        >
          <RotateCcw size={14} className={confirmReset ? "animate-spin" : ""} />
          <span>{confirmReset ? 'CONFIRM ?' : 'RESET'}</span>
        </button>
      )}
    </div>
  );
}
