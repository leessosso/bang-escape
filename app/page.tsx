'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import CRTOverlay from '@/components/CRTOverlay';
import HUD from '@/components/HUD';
import GameOver from '@/components/GameOver';
import MissionComplete from '@/components/MissionComplete';
import StageTransition from '@/components/StageTransition';
import { STAGE_REGISTRY } from '@/components/stages';
import { loadState, saveState, clearState, type GameState } from '@/lib/storage';

export default function EscapeRoomPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMissionComplete, setIsMissionComplete] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = loadState();
    setGameState(saved);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (gameState) saveState(gameState);
  }, [gameState]);

  const handleStageComplete = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      const isLast = prev.currentStage >= STAGE_REGISTRY.length - 1;
      if (isLast) {
        // 마지막 스테이지 완료 → 완료 시각 기록
        setIsMissionComplete(true);
        return { ...prev, completedAt: Date.now() };
      }
      return { ...prev, currentStage: prev.currentStage + 1 };
    });
  }, []);

  const handleStageDataChange = useCallback((stageId: number, data: unknown) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stageData: { ...prev.stageData, [stageId]: data },
      };
    });
  }, []);

  const handleStart = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      if (prev.startedAt) return prev;
      return { ...prev, startedAt: Date.now() };
    });
  }, []);

  const handleTimeUp = useCallback(() => {
    setIsGameOver(true);
  }, []);

  const handleRestart = useCallback(() => {
    clearState();
    setIsGameOver(false);
    setIsMissionComplete(false);
    setGameState({
      currentStage: 0,
      startedAt: null,
      completedAt: null,
      stageData: {},
    });
  }, []);

  // Loading state (hydration)
  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-green-600 text-sm tracking-[0.4em] animate-pulse">
          LOADING SYSTEM...
        </p>
      </div>
    );
  }

  const { currentStage, startedAt, stageData } = gameState;
  const stageConfig = STAGE_REGISTRY[currentStage] ?? STAGE_REGISTRY[STAGE_REGISTRY.length - 1];
  const StageComponent = stageConfig.component;

  // Build stage-specific props
  const stageProps: Record<string, unknown> = {
    onComplete: handleStageComplete,
  };

  // Stage 3 = Photos (index 3 in registry)
  if (currentStage === 3) {
    stageProps.savedOrder = stageData[3] as number[] | undefined;
    stageProps.onOrderChange = (order: number[]) => handleStageDataChange(3, order);
  }
  // Stage 5 = Circuit (index 5 in registry)
  if (currentStage === 5) {
    stageProps.savedRotations = stageData[5] as number[] | undefined;
    stageProps.onRotationsChange = (rots: number[]) => handleStageDataChange(5, rots);
  }

  // Start timer on first interaction (Stage 0)
  if (currentStage === 0 && !startedAt) {
    const originalOnComplete = stageProps.onComplete as () => void;
    stageProps.onComplete = () => {
      handleStart();
      originalOnComplete();
    };
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black animate-flicker"
      style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
    >
      <CRTOverlay />

      {/* HUD — 타이머 시작 후에만 표시 */}
      {startedAt && !isGameOver && (
        <HUD
          startedAt={startedAt}
          onTimeUp={handleTimeUp}
          currentStage={currentStage}
          totalStages={STAGE_REGISTRY.length}
        />
      )}

      {/* Stage progress bar */}
      {startedAt && (
        <div className="fixed top-0 left-0 right-0 h-0.5 z-[150] bg-green-950">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${((currentStage) / (STAGE_REGISTRY.length - 1)) * 100}%`,
              boxShadow: '0 0 8px #00ff41',
            }}
          />
        </div>
      )}

      {/* Stage label */}
      <div className="fixed bottom-3 left-3 z-[150] text-green-800 text-[10px] tracking-[0.3em]">
        {STAGE_REGISTRY.map((s, i) => (
          <span key={s.id} className={i === currentStage ? 'text-green-500' : ''}>
            {i === currentStage ? `[${s.label}]` : s.label}
            {i < STAGE_REGISTRY.length - 1 ? ' → ' : ''}
          </span>
        ))}
      </div>

      {/* Main stage content */}
      <AnimatePresence mode="wait">
        {!isGameOver && (
          <StageTransition stageKey={currentStage}>
            <div className="h-screen w-screen">
              <StageComponent {...stageProps} />
            </div>
          </StageTransition>
        )}
      </AnimatePresence>

      {/* Game Over overlay */}
      <AnimatePresence>
        {isGameOver && <GameOver onRestart={handleRestart} />}
      </AnimatePresence>

      {/* Mission Complete overlay */}
      <AnimatePresence>
        {isMissionComplete && gameState.startedAt && gameState.completedAt && (
          <MissionComplete
            startedAt={gameState.startedAt}
            completedAt={gameState.completedAt}
            onNextTeam={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
